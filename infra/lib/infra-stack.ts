import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as apigwv2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as authorizers from 'aws-cdk-lib/aws-apigatewayv2-authorizers';
import * as path from 'path';

export class InfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ---------------------------------------------------------------------
    // Cognito User Pool
    // ---------------------------------------------------------------------
    const userPool = new cognito.UserPool(this, 'AbaTraceUserPool', {
      userPoolName: 'ABATrace-Users',
      selfSignUpEnabled: true,
      signInAliases: { email: true },
      autoVerify: { email: true },
      standardAttributes: {
        fullname: { required: true, mutable: true },
        phoneNumber: { required: false, mutable: true },
      },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: false,
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      userVerification: {
        emailSubject: 'Your ABA TRACE verification code',
        emailBody: 'Welcome to ABA TRACE. Your verification code is {####}. Enter this code to confirm your account.',
        emailStyle: cognito.VerificationEmailStyle.CODE,
      },
    });

    const userPoolClient = new cognito.UserPoolClient(this, 'AbaTraceUserPoolClient', {
      userPool,
      userPoolClientName: 'ABATrace-WebClient',
      authFlows: {
        userPassword: true,
        userSrp: true,
      },
      generateSecret: false,
    });

    new cognito.CfnUserPoolGroup(this, 'AdminsGroup', {
      userPoolId: userPool.userPoolId,
      groupName: 'Admins',
      description: 'ABA TRACE administrators',
    });

    // ---------------------------------------------------------------------
    // DynamoDB Tables
    // ---------------------------------------------------------------------
    const artisansTable = new dynamodb.Table(this, 'ArtisansTable', {
      tableName: 'ABATrace_Artisans',
      partitionKey: { name: 'artisanId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    artisansTable.addGlobalSecondaryIndex({
      indexName: 'CognitoSubIndex',
      partitionKey: { name: 'cognitoSub', type: dynamodb.AttributeType.STRING },
    });

    const passportsTable = new dynamodb.Table(this, 'PassportsTable', {
      tableName: 'ABATrace_Passports',
      partitionKey: { name: 'passportId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    passportsTable.addGlobalSecondaryIndex({
      indexName: 'ArtisanIdIndex',
      partitionKey: { name: 'artisanId', type: dynamodb.AttributeType.STRING },
    });

    const ledgerTable = new dynamodb.Table(this, 'LedgerTable', {
      tableName: 'ABATrace_Ledger',
      partitionKey: { name: 'sequenceNumber', type: dynamodb.AttributeType.NUMBER },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    ledgerTable.addGlobalSecondaryIndex({
      indexName: 'PassportIdIndex',
      partitionKey: { name: 'passportId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'sequenceNumber', type: dynamodb.AttributeType.NUMBER },
    });

    // ---------------------------------------------------------------------
    // S3 Buckets
    // ---------------------------------------------------------------------
    const qrCodesBucket = new s3.Bucket(this, 'QrCodesBucket', {
      bucketName: `abatrace-qr-codes-${this.account}-${this.region}`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });

    const ninUploadsBucket = new s3.Bucket(this, 'NinUploadsBucket', {
      bucketName: `abatrace-nin-uploads-${this.account}-${this.region}`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });

    // ---------------------------------------------------------------------
    // Lambda Functions
    // ---------------------------------------------------------------------
    const publicBaseUrl = process.env.PUBLIC_BASE_URL || 'https://aba-trace.vercel.app';

    const sharedEnv = {
      ARTISANS_TABLE: artisansTable.tableName,
      PASSPORTS_TABLE: passportsTable.tableName,
      LEDGER_TABLE: ledgerTable.tableName,
      QR_CODES_BUCKET: qrCodesBucket.bucketName,
      NIN_UPLOADS_BUCKET: ninUploadsBucket.bucketName,
      PUBLIC_BASE_URL: publicBaseUrl,
    };

    const lambdaDefaults: Partial<nodejs.NodejsFunctionProps> = {
      runtime: lambda.Runtime.NODEJS_20_X,
      bundling: { minify: true, sourceMap: false },
      environment: sharedEnv,
      timeout: cdk.Duration.seconds(10),
      memorySize: 256,
    };

    const makeFn = (name: string) =>
      new nodejs.NodejsFunction(this, name, {
        ...lambdaDefaults,
        entry: path.join(__dirname, `../lambda/${name}/index.ts`),
      });

    const registerArtisanFn = makeFn('registerArtisan');
    const getArtisanProfileFn = makeFn('getArtisanProfile');
    const listMyPassportsFn = makeFn('listMyPassports');
    const createPassportFn = makeFn('createPassport');
    const getPassportFn = makeFn('getPassport');
    const verifyPassportFn = makeFn('verifyPassport');
    const amendPassportFn = makeFn('amendPassport');
    const listArtisansFn = makeFn('listArtisans');
    const verifyNinFn = makeFn('verifyNin');
    const getNinUploadUrlFn = makeFn('getNinUploadUrl');
    const getNinDocumentUrlFn = makeFn('getNinDocumentUrl');
    const getPassportQrCodeFn = makeFn('getPassportQrCode');
    const getDashboardStatsFn = makeFn('getDashboardStats');
    const verifyChainAdminFn = makeFn('verifyChainAdmin');

    // Table permissions
    artisansTable.grantReadWriteData(registerArtisanFn);
    artisansTable.grantReadData(getArtisanProfileFn);
    artisansTable.grantReadData(listMyPassportsFn);
    artisansTable.grantReadData(createPassportFn);
    artisansTable.grantReadData(getPassportFn);
    artisansTable.grantReadWriteData(listArtisansFn);
    artisansTable.grantReadWriteData(verifyNinFn);
    artisansTable.grantReadData(getDashboardStatsFn);
    artisansTable.grantReadWriteData(getNinUploadUrlFn);
    artisansTable.grantReadData(getNinDocumentUrlFn);
    artisansTable.grantReadData(getPassportQrCodeFn);

    passportsTable.grantReadData(listMyPassportsFn);
    passportsTable.grantReadWriteData(createPassportFn);
    passportsTable.grantReadData(getPassportFn);
    passportsTable.grantReadData(getPassportQrCodeFn);
    passportsTable.grantReadData(verifyPassportFn);
    passportsTable.grantReadWriteData(amendPassportFn);
    passportsTable.grantReadData(getDashboardStatsFn);

    ledgerTable.grantReadWriteData(createPassportFn);
    ledgerTable.grantReadData(getPassportFn);
    ledgerTable.grantReadData(verifyPassportFn);
    ledgerTable.grantReadWriteData(amendPassportFn);
    ledgerTable.grantReadData(verifyChainAdminFn);

    qrCodesBucket.grantPut(createPassportFn);
    qrCodesBucket.grantRead(createPassportFn);
    qrCodesBucket.grantRead(getPassportQrCodeFn);

    ninUploadsBucket.grantPut(getNinUploadUrlFn);
    ninUploadsBucket.grantRead(getNinDocumentUrlFn);

    // ---------------------------------------------------------------------
    // HTTP API (API Gateway v2) with Cognito JWT Authorizer
    // ---------------------------------------------------------------------
    const authorizer = new authorizers.HttpUserPoolAuthorizer('CognitoAuthorizer', userPool, {
      userPoolClients: [userPoolClient],
    });

    const httpApi = new apigwv2.HttpApi(this, 'AbaTraceApi', {
      apiName: 'ABATrace-Api',
      corsPreflight: {
        allowOrigins: ['*'],
        allowMethods: [apigwv2.CorsHttpMethod.ANY],
        allowHeaders: ['Authorization', 'Content-Type'],
      },
    });

    const authenticated = { authorizer };

    httpApi.addRoutes({
      path: '/artisans/register',
      methods: [apigwv2.HttpMethod.POST],
      integration: new integrations.HttpLambdaIntegration('RegisterArtisanIntegration', registerArtisanFn),
      ...authenticated,
    });
    httpApi.addRoutes({
      path: '/artisans/me',
      methods: [apigwv2.HttpMethod.GET],
      integration: new integrations.HttpLambdaIntegration('GetArtisanProfileIntegration', getArtisanProfileFn),
      ...authenticated,
    });
    httpApi.addRoutes({
      path: '/artisans/me/passports',
      methods: [apigwv2.HttpMethod.GET],
      integration: new integrations.HttpLambdaIntegration('ListMyPassportsIntegration', listMyPassportsFn),
      ...authenticated,
    });
    httpApi.addRoutes({
      path: '/artisans/me/passports/{passportId}/qr-code',
      methods: [apigwv2.HttpMethod.GET],
      integration: new integrations.HttpLambdaIntegration('GetPassportQrCodeIntegration', getPassportQrCodeFn),
      ...authenticated,
    });
    httpApi.addRoutes({
      path: '/artisans/me/nin-upload-url',
      methods: [apigwv2.HttpMethod.POST],
      integration: new integrations.HttpLambdaIntegration('GetNinUploadUrlIntegration', getNinUploadUrlFn),
      ...authenticated,
    });
    httpApi.addRoutes({
      path: '/passports',
      methods: [apigwv2.HttpMethod.POST],
      integration: new integrations.HttpLambdaIntegration('CreatePassportIntegration', createPassportFn),
      ...authenticated,
    });
    httpApi.addRoutes({
      path: '/passports/{passportId}',
      methods: [apigwv2.HttpMethod.GET],
      integration: new integrations.HttpLambdaIntegration('GetPassportIntegration', getPassportFn),
    });
    httpApi.addRoutes({
      path: '/passports/{passportId}/verify',
      methods: [apigwv2.HttpMethod.GET],
      integration: new integrations.HttpLambdaIntegration('VerifyPassportIntegration', verifyPassportFn),
    });
    httpApi.addRoutes({
      path: '/passports/{passportId}/amend',
      methods: [apigwv2.HttpMethod.POST],
      integration: new integrations.HttpLambdaIntegration('AmendPassportIntegration', amendPassportFn),
      ...authenticated,
    });
    httpApi.addRoutes({
      path: '/admin/artisans',
      methods: [apigwv2.HttpMethod.GET],
      integration: new integrations.HttpLambdaIntegration('ListArtisansIntegration', listArtisansFn),
      ...authenticated,
    });
    httpApi.addRoutes({
      path: '/admin/artisans/{artisanId}/verify-nin',
      methods: [apigwv2.HttpMethod.POST],
      integration: new integrations.HttpLambdaIntegration('VerifyNinIntegration', verifyNinFn),
      ...authenticated,
    });
    httpApi.addRoutes({
      path: '/admin/artisans/{artisanId}/nin-document-url',
      methods: [apigwv2.HttpMethod.GET],
      integration: new integrations.HttpLambdaIntegration('GetNinDocumentUrlIntegration', getNinDocumentUrlFn),
      ...authenticated,
    });
    httpApi.addRoutes({
      path: '/admin/dashboard-stats',
      methods: [apigwv2.HttpMethod.GET],
      integration: new integrations.HttpLambdaIntegration('GetDashboardStatsIntegration', getDashboardStatsFn),
      ...authenticated,
    });
    httpApi.addRoutes({
      path: '/admin/verify-chain',
      methods: [apigwv2.HttpMethod.GET],
      integration: new integrations.HttpLambdaIntegration('VerifyChainAdminIntegration', verifyChainAdminFn),
      ...authenticated,
    });

    // ---------------------------------------------------------------------
    // Outputs
    // ---------------------------------------------------------------------
    new cdk.CfnOutput(this, 'UserPoolId', { value: userPool.userPoolId });
    new cdk.CfnOutput(this, 'UserPoolClientId', { value: userPoolClient.userPoolClientId });
    new cdk.CfnOutput(this, 'ArtisansTableName', { value: artisansTable.tableName });
    new cdk.CfnOutput(this, 'PassportsTableName', { value: passportsTable.tableName });
    new cdk.CfnOutput(this, 'LedgerTableName', { value: ledgerTable.tableName });
    new cdk.CfnOutput(this, 'QrCodesBucketName', { value: qrCodesBucket.bucketName });
    new cdk.CfnOutput(this, 'NinUploadsBucketName', { value: ninUploadsBucket.bucketName });
    new cdk.CfnOutput(this, 'ApiUrl', { value: httpApi.apiEndpoint });
  }
}
