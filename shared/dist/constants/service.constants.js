"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SERVICE_URLS = exports.SERVICE_PORTS = exports.SERVICE_NAMES = void 0;
exports.SERVICE_NAMES = {
    ADMIN: 'admin-service',
    CUSTOMER: 'customer-service',
    PRODUCT: 'product-service',
    ORDER: 'order-service',
    NOTIFICATION: 'notification-service',
};
exports.SERVICE_PORTS = {
    ADMIN: 3001,
    CUSTOMER: 3002,
    PRODUCT: 3003,
    ORDER: 3004,
    NOTIFICATION: 3005,
};
exports.SERVICE_URLS = {
    ADMIN: process.env.ADMIN_SERVICE_URL || 'http://localhost:3001',
    CUSTOMER: process.env.CUSTOMER_SERVICE_URL || 'http://localhost:3002',
    PRODUCT: process.env.PRODUCT_SERVICE_URL || 'http://localhost:3003',
    ORDER: process.env.ORDER_SERVICE_URL || 'http://localhost:3004',
    NOTIFICATION: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3005',
};
//# sourceMappingURL=service.constants.js.map