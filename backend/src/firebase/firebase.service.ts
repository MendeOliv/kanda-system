import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';

/**
 * FirebaseService — singleton que gere a inicialização do Firebase Admin SDK.
 *
 * A inicialização acontece uma única vez no OnModuleInit.
 * Consumidores (guards, strategies) injetam este serviço para obter a
 * instância `auth` partilhada.
 */
@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);
  private _auth: Auth | null = null;

  constructor(private readonly config: ConfigService) {}

  async onModuleInit() {
    const projectId = this.config.get<string>('FIREBASE_PROJECT_ID');
    const privateKey = this.config.get<string>('FIREBASE_PRIVATE_KEY');
    const clientEmail = this.config.get<string>('FIREBASE_CLIENT_EMAIL');

    if (
      !projectId ||
      projectId === 'your-firebase-project-id' ||
      !privateKey ||
      !privateKey.includes('BEGIN PRIVATE KEY') ||
      !clientEmail ||
      !clientEmail.includes('firebase-adminsdk')
    ) {
      this.logger.warn(
        'Firebase credentials not configured; authentication checks will be bypassed.',
      );
      return;
    }

    if (getApps().length > 0) {
      this.logger.debug('Firebase already initialized — reusing existing app.');
      this._auth = getAuth();
      return;
    }

    initializeApp({
      credential: cert({
        projectId,
        privateKey: privateKey.replace(/\\n/g, '\n'),
        clientEmail,
      }),
    });

    this._auth = getAuth();
    this.logger.log('Firebase Admin SDK initialized successfully.');
  }

  /** Retorna a instância Auth inicializada, ou null se não configurada. */
  get auth(): Auth | null {
    return this._auth;
  }

  /** Retorna true se o Firebase está configurado e operacional. */
  get isConfigured(): boolean {
    return this._auth !== null;
  }

  /**
   * Verifica um Firebase ID token.
   * Retorna os claims ou lança erro.
   */
  async verifyToken(token: string): Promise<{ uid: string; phone: string; role: string }> {
    if (!this._auth) {
      throw new Error('Firebase not configured');
    }
    const decoded = await this._auth.verifyIdToken(token);
    return {
      uid: decoded.uid,
      phone: decoded.phone_number || '',
      role: (decoded as any).role || 'USER',
    };
  }
}