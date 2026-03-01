export const SERVICE_NAMES = {
  ADMIN: 'admin-service',
  CUSTOMER: 'customer-service',
  PRODUCT: 'product-service',
  ORDER: 'order-service',
  NOTIFICATION: 'notification-service',
} as const;

export const SERVICE_PORTS = {
  ADMIN: 3001,
  CUSTOMER: 3002,
  PRODUCT: 3003,
  ORDER: 3004,
  NOTIFICATION: 3005,
} as const;

// For inter-service communication without message broker
// We'll use HTTP with circuit breaker pattern
export const SERVICE_URLS = {
  ADMIN: process.env.ADMIN_SERVICE_URL || 'http://localhost:3001',
  CUSTOMER: process.env.CUSTOMER_SERVICE_URL || 'http://localhost:3002',
  PRODUCT: process.env.PRODUCT_SERVICE_URL || 'http://localhost:3003',
  ORDER: process.env.ORDER_SERVICE_URL || 'http://localhost:3004',
  NOTIFICATION: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3005',
} as const;