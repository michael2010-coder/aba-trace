#!/usr/bin/env bash
set -euo pipefail

REGION="eu-west-1"
USER_POOL_ID="eu-west-1_eV3HK8TYq"
ARTISANS_TABLE="ABATrace_Artisans"
PASSPORTS_TABLE="ABATrace_Passports"
LEDGER_TABLE="ABATrace_Ledger"
QR_BUCKET="abatrace-qr-codes-819693013656-eu-west-1"
NIN_BUCKET="abatrace-nin-uploads-819693013656-eu-west-1"

echo "=== Deleting all Cognito users from $USER_POOL_ID ==="
aws cognito-idp list-users --user-pool-id "$USER_POOL_ID" --region "$REGION" \
  --query "Users[].Username" --output text | tr '\t' '\n' | while read -r username; do
    if [ -n "$username" ]; then
      echo "Deleting user: $username"
      aws cognito-idp admin-delete-user --user-pool-id "$USER_POOL_ID" --region "$REGION" --username "$username"
    fi
  done

wipe_table() {
  local table="$1"
  local key_attrs="$2" # space-separated list of key attribute names
  echo "=== Wiping table $table ==="
  aws dynamodb scan --table-name "$table" --region "$REGION" \
    --projection-expression "$(echo "$key_attrs" | tr ' ' ',')" \
    --output json | python3 -c "
import json,sys
data = json.load(sys.stdin)
for item in data['Items']:
    print(json.dumps(item))
" | while read -r key_json; do
      aws dynamodb delete-item --table-name "$table" --region "$REGION" --key "$key_json"
    done
}

wipe_table "$ARTISANS_TABLE" "artisanId"
wipe_table "$PASSPORTS_TABLE" "passportId"
wipe_table "$LEDGER_TABLE" "sequenceNumber"

empty_bucket() {
  local bucket="$1"
  echo "=== Emptying bucket $bucket ==="
  aws s3 rm "s3://$bucket" --recursive --region "$REGION" || true
}

empty_bucket "$QR_BUCKET"
empty_bucket "$NIN_BUCKET"

echo "=== Done. Verifying ==="
echo "Cognito users remaining: $(aws cognito-idp list-users --user-pool-id "$USER_POOL_ID" --region "$REGION" --query 'length(Users)' --output text)"
echo "Artisans remaining: $(aws dynamodb scan --table-name "$ARTISANS_TABLE" --region "$REGION" --select COUNT --output text | awk '{print $2}')"
echo "Passports remaining: $(aws dynamodb scan --table-name "$PASSPORTS_TABLE" --region "$REGION" --select COUNT --output text | awk '{print $2}')"
echo "Ledger entries remaining: $(aws dynamodb scan --table-name "$LEDGER_TABLE" --region "$REGION" --select COUNT --output text | awk '{print $2}')"
echo "QR bucket objects remaining: $(aws s3api list-objects-v2 --bucket "$QR_BUCKET" --region "$REGION" --query 'KeyCount' --output text)"
echo "NIN bucket objects remaining: $(aws s3api list-objects-v2 --bucket "$NIN_BUCKET" --region "$REGION" --query 'KeyCount' --output text)"
