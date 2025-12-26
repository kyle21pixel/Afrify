// Store Status
export enum StoreStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING',
}

// Payment Gateway
export enum PaymentGateway {
  MPESA = 'mpesa',
  PAYSTACK = 'paystack',
  FLUTTERWAVE = 'flutterwave',
  STRIPE = 'stripe',
}

// Subscription Plan Types
export enum SubscriptionPlan {
  FREE = 'FREE',
  BASIC = 'BASIC',
  PROFESSIONAL = 'PROFESSIONAL',
  ENTERPRISE = 'ENTERPRISE',
}

// Subscription Status
export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
  TRIAL = 'TRIAL',
  PAST_DUE = 'PAST_DUE',
}

// Product Status
export enum ProductStatus {
  ACTIVE = 'ACTIVE',
  DRAFT = 'DRAFT',
  ARCHIVED = 'ARCHIVED',
}

// Inventory Policy
export enum InventoryPolicy {
  DENY = 'DENY',
  CONTINUE = 'CONTINUE',
}

// Order Status
export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  FULFILLED = 'FULFILLED',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  RETURNED = 'RETURNED',
  REFUNDED = 'REFUNDED',
}

// Payment Status
export enum PaymentStatus {
  PENDING = 'PENDING',
  AUTHORIZED = 'AUTHORIZED',
  PAID = 'PAID',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',
}

// Payment Method
export enum PaymentMethod {
  MPESA = 'MPESA',
  AIRTEL_MONEY = 'AIRTEL_MONEY',
  CARD = 'CARD',
  PAYSTACK = 'PAYSTACK',
  FLUTTERWAVE = 'FLUTTERWAVE',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CASH_ON_DELIVERY = 'CASH_ON_DELIVERY',
}

// Fulfillment Status
export enum FulfillmentStatus {
  UNFULFILLED = 'UNFULFILLED',
  PARTIALLY_FULFILLED = 'PARTIALLY_FULFILLED',
  FULFILLED = 'FULFILLED',
  DELIVERED = 'DELIVERED',
  RETURNED = 'RETURNED',
}

// Discount Type
export enum DiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED_AMOUNT = 'FIXED_AMOUNT',
  FREE_SHIPPING = 'FREE_SHIPPING',
  BUY_X_GET_Y = 'BUY_X_GET_Y',
}

// Discount Status
export enum DiscountStatus {
  ACTIVE = 'ACTIVE',
  SCHEDULED = 'SCHEDULED',
  EXPIRED = 'EXPIRED',
  DISABLED = 'DISABLED',
}

// Shipping Status
export enum ShippingStatus {
  PENDING = 'PENDING',
  IN_TRANSIT = 'IN_TRANSIT',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
  RETURNED = 'RETURNED',
}

// Customer Status
export enum CustomerStatus {
  ACTIVE = 'ACTIVE',
  DISABLED = 'DISABLED',
  INVITED = 'INVITED',
}

// Theme Type
export enum ThemeType {
  PRESET = 'PRESET',
  CUSTOM = 'CUSTOM',
}

// Theme Status
export enum ThemeStatus {
  PUBLISHED = 'PUBLISHED',
  UNPUBLISHED = 'UNPUBLISHED',
}

// User Role
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  MERCHANT = 'MERCHANT',
  STAFF = 'STAFF',
  CUSTOMER = 'CUSTOMER',
}

// Currency
export enum Currency {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
  NGN = 'NGN',
  KES = 'KES',
  GHS = 'GHS',
  ZAR = 'ZAR',
  TZS = 'TZS',
  UGX = 'UGX',
  XOF = 'XOF',
  XAF = 'XAF',
}

// Webhook Event
export enum WebhookEvent {
  ORDER_CREATED = 'order.created',
  ORDER_UPDATED = 'order.updated',
  ORDER_CANCELLED = 'order.cancelled',
  ORDER_FULFILLED = 'order.fulfilled',
  PRODUCT_CREATED = 'product.created',
  PRODUCT_UPDATED = 'product.updated',
  PRODUCT_DELETED = 'product.deleted',
  CUSTOMER_CREATED = 'customer.created',
  CUSTOMER_UPDATED = 'customer.updated',
  PAYMENT_SUCCEEDED = 'payment.succeeded',
  PAYMENT_FAILED = 'payment.failed',
  REFUND_CREATED = 'refund.created',
}

// Notification Type
export enum NotificationType {
  ORDER = 'ORDER',
  PAYMENT = 'PAYMENT',
  INVENTORY = 'INVENTORY',
  CUSTOMER = 'CUSTOMER',
  SYSTEM = 'SYSTEM',
}

// Report Type
export enum ReportType {
  SALES = 'SALES',
  PRODUCTS = 'PRODUCTS',
  CUSTOMERS = 'CUSTOMERS',
  TRAFFIC = 'TRAFFIC',
  FINANCE = 'FINANCE',
}

// Image Type
export enum ImageType {
  PRODUCT = 'PRODUCT',
  LOGO = 'LOGO',
  BANNER = 'BANNER',
  THUMBNAIL = 'THUMBNAIL',
  AVATAR = 'AVATAR',
}
