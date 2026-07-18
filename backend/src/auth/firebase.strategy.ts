import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Request } from 'express';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

export const IS_PUBLIC_KEY = 'isPublic';

const hasFirebaseCredentials = Boolean(
  process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_PROJECT_ID !== 'your-firebase-project-id' &&
    process.env.FIREBASE_PRIVATE_KEY &&
    process.env.FIREBASE_PRIVATE_KEY.includes('BEGIN PRIVATE KEY') &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_CLIENT_EMAIL.includes('firebase-adminsdk'),
);

let auth: any = null;

// Initialize Firebase Admin SDK safely
if (hasFirebaseCredentials && !getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
  });
  auth = getAuth();
} else {
  console.warn('Firebase credentials not configured; authentication checks are disabled.');
}

@Injectable()
export class FirebaseStrategy extends PassportStrategy(Strategy, 'firebase') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'unused-firebase-validates-itself',
      passReqToCallback: true,
    });
  }

  // Custom validation: bypass passport JWT verification and validate directly with Firebase Admin
  async validate(req: Request): Promise<{ uid: string; phone: string; role: string }> {
    if (!auth) {
      return {
        uid: 'local-dev-user',
        phone: '',
        role: 'USER',
      };
    }

    const authHeader = req.headers?.authorization as string;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Firebase token missing');
    }
    const token = authHeader.split(' ')[1];
    try {
      const decoded = await auth.verifyIdToken(token);
      return {
        uid: decoded.uid,
        phone: decoded.phone_number || '',
        role: (decoded as any).role || 'USER',
      };
    } catch {
      throw new UnauthorizedException('Invalid or expired Firebase token');
    }
  }
}