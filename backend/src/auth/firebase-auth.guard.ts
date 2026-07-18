import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
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
export class FirebaseAuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    if (!auth) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader: string = request.headers['authorization'];
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Authentication required.');
    }
    const token = authHeader.split(' ')[1];
    try {
      const decoded = await auth.verifyIdToken(token);
      request.user = {
        uid: decoded.uid,
        phone: decoded.phone_number || '',
        role: (decoded as any).role || 'USER',
      };
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token.');
    }
  }
}