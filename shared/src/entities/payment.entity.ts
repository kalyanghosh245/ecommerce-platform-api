import { Entity, Column, ManyToOne, JoinColumn, Index, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Order, PaymentStatus } from './order.entity';



export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  PAYPAL = 'paypal',
  STRIPE = 'stripe',
  BANK_TRANSFER = 'bank_transfer',
  CASH_ON_DELIVERY = 'cash_on_delivery',
  CRYPTOCURRENCY = 'cryptocurrency',
  GIFT_CARD = 'gift_card'
}

export enum PaymentProvider {
  STRIPE = 'stripe',
  PAYPAL = 'paypal',
  RAZORPAY = 'razorpay',
  BRAINTREE = 'braintree',
  ADYEN = 'adyen',
  CHECKOUT = 'checkout',
  MANUAL = 'manual'
}

@Entity('payments')
@Index(['orderId'])
@Index(['transactionId'], { unique: true })
@Index(['status'])
@Index(['createdAt'])
export class Payment extends BaseEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'payment_id' })
  paymentId: string;

  @Column({ type: 'uuid' })
  orderId: string;

  @ManyToOne(() => Order, (order) => order.items)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ type: 'varchar', length: 100, unique: true })
  transactionId: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  externalTransactionId: string | null;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Column({ type: 'enum', enum: PaymentMethod })
  method: PaymentMethod;

  @Column({ type: 'enum', enum: PaymentProvider })
  provider: PaymentProvider;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency: string;

  // PCI DSS: Don't store full card data, only last 4 digits
  @Column({ type: 'varchar', length: 4, nullable: true })
  cardLastFour: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  cardBrand: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  cardExpiryMonth: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  cardExpiryYear: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  cardToken: string | null;

  @Column({ type: 'text', nullable: true })
  billingAddressEncrypted: string | null;

  @Column({ type: 'varchar', length: 100 })
  billingAddressHash: string;

  @Column({ type: 'boolean', default: false })
  is3DSecure: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  threeDSEci: string | null;

  @Column({ type: 'text', nullable: true })
  threeDSAuthenticationEncrypted: string | null;

  @Column({ type: 'integer', nullable: true })
  riskScore: number | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  riskLevel: string | null;

  @Column({ type: 'simple-json', nullable: true })
  riskFactors: string[] | null;

  @Column({ type: 'boolean', default: false })
  isFraudulent: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  refundedAmount: number;

  @Column({ type: 'integer', default: 0 })
  refundCount: number;

  @Column({ type: 'text', nullable: true })
  providerResponseEncrypted: string | null;

  @Column({ type: 'text', nullable: true })
  failureReason: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  failureCode: string | null;

  @Column({ type: 'integer', default: 0 })
  retryCount: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  webhookId: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  webhookReceivedAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  authorizedAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  capturedAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  voidedAt: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  refundedAt: Date | null;

  @Column({ type: 'varchar', length: 45 })
  ipAddress: string;

  @Column({ type: 'text', nullable: true })
  userAgent: string | null;

  @Column({ type: 'simple-json', nullable: true })
  metadata: Record<string, any> | null;

  @Column({ type: 'date', nullable: true, name: 'retention_until' })
  retentionUntil: Date | null;
}