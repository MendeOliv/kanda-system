export class PaymentEntity {
  id: string;
  orderId: string;
  method: string;
  amount: number;
  status: string;
  appypayTransactionId?: string;
  rawWebhookPayload?: any;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
