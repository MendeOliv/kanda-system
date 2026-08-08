import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Request } from 'express';
import { FirebaseService } from '../firebase/firebase.service';

export const IS_PUBLIC_KEY = 'isPublic';

@Injectable()
export class FirebaseStrategy extends PassportStrategy(Strategy, 'firebase') {
  constructor(private readonly firebase: FirebaseService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'unused-firebase-validates-itself',
      passReqToCallback: true,
    });
  }

  async validate(req: Request): Promise<{ uid: string; phone: string; role: string }> {
    // Firebase não configurado — dev fallback
    if (!this.firebase.isConfigured) {
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
      return await this.firebase.verifyToken(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired Firebase token');
    }
  }
}