import { BaseEntity } from './base.entity';
import { Order, PaymentStatus } from './order.entity';
export declare enum PaymentMethod {
    CREDIT_CARD = "credit_card",
    DEBIT_CARD = "debit_card",
    PAYPAL = "paypal",
    STRIPE = "stripe",
    BANK_TRANSFER = "bank_transfer",
    CASH_ON_DELIVERY = "cash_on_delivery",
    CRYPTOCURRENCY = "cryptocurrency",
    GIFT_CARD = "gift_card"
}
export declare enum PaymentProvider {
    STRIPE = "stripe",
    PAYPAL = "paypal",
    RAZORPAY = "razorpay",
    BRAINTREE = "braintree",
    ADYEN = "adyen",
    CHECKOUT = "checkout",
    MANUAL = "manual"
}
export declare class Payment extends BaseEntity {
    orderId: string;
    order: Order;
    transactionId: string;
    externalTransactionId: string | null;
    status: PaymentStatus;
    method: PaymentMethod;
    provider: PaymentProvider;
    amount: number;
    currency: string;
    cardLastFour: string | null;
    cardBrand: string | null;
    cardExpiryMonth: string | null;
    cardExpiryYear: string | null;
    cardToken: string | null;
    billingAddressEncrypted: string | null;
    billingAddressHash: string;
    is3DSecure: boolean;
    threeDSEci: string | null;
    threeDSAuthenticationEncrypted: string | null;
    riskScore: number | null;
    riskLevel: string | null;
    riskFactors: string[] | null;
    isFraudulent: boolean;
    refundedAmount: number;
    refundCount: number;
    providerResponseEncrypted: string | null;
    failureReason: string | null;
    failureCode: string | null;
    retryCount: number;
    webhookId: string | null;
    webhookReceivedAt: Date | null;
    authorizedAt: Date | null;
    capturedAt: Date | null;
    voidedAt: Date | null;
    refundedAt: Date | null;
    ipAddress: string;
    userAgent: string | null;
    metadata: Record<string, any> | null;
    retentionUntil: Date | null;
}
