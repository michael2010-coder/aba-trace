'use client';

import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute,
  CognitoUserSession,
} from 'amazon-cognito-identity-js';
import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import { config } from './config';

let _userPool: CognitoUserPool | null = null;

function getUserPool(): CognitoUserPool {
  if (!_userPool) {
    _userPool = new CognitoUserPool({
      UserPoolId: config.userPoolId,
      ClientId: config.userPoolClientId,
    });
  }
  return _userPool;
}

export interface AuthUser {
  email: string;
  sub: string;
  isAdmin: boolean;
  idToken: string;
  accessToken: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  confirmSignUp: (email: string, code: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  getIdToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function sessionToUser(session: CognitoUserSession): AuthUser {
  const idToken = session.getIdToken();
  const payload = idToken.payload;
  const groups: string[] = payload['cognito:groups'] || [];
  return {
    email: payload.email,
    sub: payload.sub,
    isAdmin: groups.includes('Admins'),
    idToken: idToken.getJwtToken(),
    accessToken: session.getAccessToken().getJwtToken(),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    queueMicrotask(() => {
      const cognitoUser = getUserPool().getCurrentUser();
      if (!cognitoUser) {
        setLoading(false);
        return;
      }
      cognitoUser.getSession((err: Error | null, session: CognitoUserSession | null) => {
        if (!err && session) {
          setUser(sessionToUser(session));
        }
        setLoading(false);
      });
    });
  }, []);

  const signUp = useCallback((email: string, password: string, fullName: string) => {
    return new Promise<void>((resolve, reject) => {
      const attributes = [new CognitoUserAttribute({ Name: 'name', Value: fullName })];
      getUserPool().signUp(email, password, attributes, [], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }, []);

  const confirmSignUp = useCallback((email: string, code: string) => {
    return new Promise<void>((resolve, reject) => {
      const cognitoUser = new CognitoUser({ Username: email, Pool: getUserPool() });
      cognitoUser.confirmRegistration(code, true, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }, []);

  const signIn = useCallback((email: string, password: string) => {
    return new Promise<void>((resolve, reject) => {
      const cognitoUser = new CognitoUser({ Username: email, Pool: getUserPool() });
      const authDetails = new AuthenticationDetails({ Username: email, Password: password });
      cognitoUser.authenticateUser(authDetails, {
        onSuccess: (session) => {
          setUser(sessionToUser(session));
          resolve();
        },
        onFailure: (err) => reject(err),
      });
    });
  }, []);

  const signOut = useCallback(() => {
    const cognitoUser = getUserPool().getCurrentUser();
    cognitoUser?.signOut();
    setUser(null);
  }, []);

  const getIdToken = useCallback((): Promise<string | null> => {
    return new Promise((resolve) => {
      const cognitoUser = getUserPool().getCurrentUser();
      if (!cognitoUser) {
        resolve(null);
        return;
      }
      cognitoUser.getSession((err: Error | null, session: CognitoUserSession | null) => {
        if (err || !session) {
          resolve(null);
          return;
        }
        resolve(session.getIdToken().getJwtToken());
      });
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signUp, confirmSignUp, signIn, signOut, getIdToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
