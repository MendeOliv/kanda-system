import { Module, Global, DynamicModule } from '@nestjs/common';
import { FirebaseService } from './firebase.service';

/**
 * FirebaseModule — inicializa o Firebase Admin SDK exatamente uma vez.
 *
 * Uso:
 *   FirebaseModule.forRoot() no AppModule.
 *   Todos os módulos que precisam de auth têm acesso ao FirebaseService
 *   como singleton global, sem repetir a inicialização.
 */
@Global()
@Module({})
export class FirebaseModule {
  static forRoot(): DynamicModule {
    return {
      module: FirebaseModule,
      providers: [FirebaseService],
      exports: [FirebaseService],
    };
  }
}