import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';
import { FirebaseAuthGuard } from './firebase-auth.guard';
import { IS_PUBLIC_KEY } from './firebase.strategy';

/**
 * CompositeAuthGuard — tries JWT first, falls back to Firebase.
 *
 * This preserves backward compatibility with existing Firebase-authenticated
 * clients (mobile app) while enabling new JWT-based flows (web dashboard, API keys).
 *
 * Public endpoints (decorated with @Public()) skip authentication entirely.
 */
@Injectable()
export class CompositeAuthGuard implements CanActivate {
  constructor(
    private readonly jwtGuard: JwtAuthGuard,
    private readonly firebaseGuard: FirebaseAuthGuard,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if the request is for the WhatsApp message endpoint
    const request = context.switchToHttp().getRequest();
    const path = request.path.replace(/\/+$/, ''); // Remove trailing slashes
    // DEBUG: log auth info for WhatsApp message endpoint
    if (path === '/api/whatsapp/message') {
      const internalKey = request.header('x-internal-key');
      const expectedKey = process.env.BACKEND_API_TOKEN;
      console.log(`[AUTH DEBUG] path=${path}`);
      console.log(`[AUTH DEBUG] internal key present: ${!!internalKey}, length: ${internalKey?.length ?? 0}`);
      console.log(`[AUTH DEBUG] expected key configured: ${!!expectedKey}, length: ${expectedKey?.length ?? 0}`);
      if (internalKey && expectedKey && internalKey === expectedKey) {
        console.log(`[AUTH DEBUG] internal key match: true`);
        return true;
      }
      console.log(`[AUTH DEBUG] internal key match: false`);
      throw new UnauthorizedException('Invalid internal API key');
    }

    // Check if endpoint is public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    // Try JWT first
    try {
      const jwtResult = await this.jwtGuard.canActivate(context);
      if (jwtResult) return true;
    } catch {
      // JWT failed — fall through to Firebase
    }

    // Fallback: Firebase
    try {
      const firebaseResult = await this.firebaseGuard.canActivate(context);
      if (firebaseResult) return true;
    } catch {
      // Firebase also failed
    }

    throw new UnauthorizedException('Authentication required (JWT or Firebase token)');
  }
}