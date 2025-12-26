import { Currency, SubscriptionPlan } from './enums';

// API Configuration
export const API_CONFIG = {
  VERSION: 'v1',
  BASE_PATH: '/api',
  TIMEOUT: 30000,
  RATE_LIMIT: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 100,
  },
};

// Pagination Defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
};

// Currency Symbols
export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  [Currency.USD]: '$',
  [Currency.EUR]: '€',
  [Currency.GBP]: '£',
  [Currency.NGN]: '₦',
  [Currency.KES]: 'KSh',
  [Currency.GHS]: 'GH₵',
  [Currency.ZAR]: 'R',
  [Currency.TZS]: 'TSh',
  [Currency.UGX]: 'USh',
  [Currency.XOF]: 'CFA',
  [Currency.XAF]: 'FCFA',
};

// Subscription Plan Limits
export const PLAN_LIMITS: Record<SubscriptionPlan, {
  products: number;
  orders: number;
  staff: number;
  storage: number; // in GB
  transactionFee: number; // percentage
}> = {
  [SubscriptionPlan.FREE]: {
    products: 10,
    orders: 50,
    staff: 1,
    storage: 1,
    transactionFee: 2.5,
  },
  [SubscriptionPlan.BASIC]: {
    products: 100,
    orders: 500,
    staff: 2,
    storage: 5,
    transactionFee: 2.0,
  },
  [SubscriptionPlan.PROFESSIONAL]: {
    products: 1000,
    orders: 5000,
    staff: 5,
    storage: 20,
    transactionFee: 1.5,
  },
  [SubscriptionPlan.ENTERPRISE]: {
    products: -1, // unlimited
    orders: -1, // unlimited
    staff: -1, // unlimited
    storage: 100,
    transactionFee: 1.0,
  },
};

// Subscription Plan Prices (monthly in USD)
export const PLAN_PRICES: Record<SubscriptionPlan, number> = {
  [SubscriptionPlan.FREE]: 0,
  [SubscriptionPlan.BASIC]: 29,
  [SubscriptionPlan.PROFESSIONAL]: 79,
  [SubscriptionPlan.ENTERPRISE]: 299,
};

// File Upload Limits
export const FILE_LIMITS = {
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  ALLOWED_FILE_TYPES: ['application/pdf', 'application/msword', 'text/csv'],
};

// Cache TTL (in seconds)
export const CACHE_TTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400, // 24 hours
};

// Error Codes
export const ERROR_CODES = {
  // Authentication
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  
  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  
  // Resources
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  CONFLICT: 'CONFLICT',
  
  // Business Logic
  INSUFFICIENT_INVENTORY: 'INSUFFICIENT_INVENTORY',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  PLAN_LIMIT_EXCEEDED: 'PLAN_LIMIT_EXCEEDED',
  STORE_INACTIVE: 'STORE_INACTIVE',
  
  // Server
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
};

// Webhook Retry Configuration
export const WEBHOOK_CONFIG = {
  MAX_RETRIES: 3,
  RETRY_DELAYS: [1000, 5000, 15000], // in milliseconds
  TIMEOUT: 10000,
};

// African Countries
export const AFRICAN_COUNTRIES = [
  { code: 'NG', name: 'Nigeria', currency: Currency.NGN },
  { code: 'KE', name: 'Kenya', currency: Currency.KES },
  { code: 'GH', name: 'Ghana', currency: Currency.GHS },
  { code: 'ZA', name: 'South Africa', currency: Currency.ZAR },
  { code: 'TZ', name: 'Tanzania', currency: Currency.TZS },
  { code: 'UG', name: 'Uganda', currency: Currency.UGX },
  { code: 'SN', name: 'Senegal', currency: Currency.XOF },
  { code: 'CM', name: 'Cameroon', currency: Currency.XAF },
];

// Payment Gateway Configuration
export const PAYMENT_GATEWAYS = {
  MPESA: {
    name: 'M-Pesa',
    countries: ['KE', 'TZ', 'UG'],
    currencies: [Currency.KES, Currency.TZS, Currency.UGX],
  },
  AIRTEL_MONEY: {
    name: 'Airtel Money',
    countries: ['KE', 'TZ', 'UG', 'NG', 'GH'],
    currencies: [Currency.KES, Currency.TZS, Currency.UGX, Currency.NGN, Currency.GHS],
  },
  PAYSTACK: {
    name: 'Paystack',
    countries: ['NG', 'GH', 'ZA', 'KE'],
    currencies: [Currency.NGN, Currency.GHS, Currency.ZAR, Currency.KES, Currency.USD],
  },
  FLUTTERWAVE: {
    name: 'Flutterwave',
    countries: ['NG', 'GH', 'KE', 'ZA', 'TZ', 'UG'],
    currencies: [Currency.NGN, Currency.GHS, Currency.KES, Currency.ZAR, Currency.TZS, Currency.UGX, Currency.USD],
  },
};

// Email Templates
export const EMAIL_TEMPLATES = {
  ORDER_CONFIRMATION: 'order-confirmation',
  ORDER_SHIPPED: 'order-shipped',
  ORDER_DELIVERED: 'order-delivered',
  ORDER_CANCELLED: 'order-cancelled',
  PASSWORD_RESET: 'password-reset',
  WELCOME: 'welcome',
  INVITATION: 'invitation',
};

// Default Theme
export const DEFAULT_THEME = {
  colors: {
    primary: '#2563eb',
    secondary: '#64748b',
    accent: '#f59e0b',
    background: '#ffffff',
    text: '#1e293b',
  },
  fonts: {
    heading: 'Inter, sans-serif',
    body: 'Inter, sans-serif',
  },
};
