import {
  StoreStatus,
  SubscriptionPlan,
  SubscriptionStatus,
  ProductStatus,
  InventoryPolicy,
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  FulfillmentStatus,
  DiscountType,
  DiscountStatus,
  ShippingStatus,
  CustomerStatus,
  ThemeType,
  ThemeStatus,
  UserRole,
  Currency,
  WebhookEvent,
  NotificationType,
} from './enums';

// Base Entity
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// Tenant
export interface Tenant extends BaseEntity {
  name: string;
  slug: string;
  ownerId: string;
  subscriptionPlan: SubscriptionPlan;
  subscriptionStatus: SubscriptionStatus;
  subscriptionEndsAt?: Date;
  metadata?: Record<string, any>;
}

// Store
export interface Store extends BaseEntity {
  tenantId: string;
  name: string;
  slug: string;
  domain?: string;
  customDomain?: string;
  email: string;
  phone?: string;
  currency: Currency;
  timezone: string;
  status: StoreStatus;
  logo?: string;
  description?: string;
  address?: Address;
  settings?: StoreSettings;
  metadata?: Record<string, any>;
}

// Address
export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode?: string;
  country: string;
}

// Store Settings
export interface StoreSettings {
  enableCheckout: boolean;
  enableReviews: boolean;
  enableWishlist: boolean;
  taxIncluded: boolean;
  taxRate?: number;
  shippingRates?: ShippingRate[];
  paymentMethods: PaymentMethod[];
  notifications: NotificationSettings;
  seo?: SEOSettings;
}

// Shipping Rate
export interface ShippingRate {
  id: string;
  name: string;
  description?: string;
  price: number;
  minOrderAmount?: number;
  countries?: string[];
}

// Notification Settings
export interface NotificationSettings {
  orderConfirmation: boolean;
  orderShipped: boolean;
  orderDelivered: boolean;
  lowInventory: boolean;
  newCustomer: boolean;
}

// SEO Settings
export interface SEOSettings {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
}

// Product
export interface Product extends BaseEntity {
  storeId: string;
  title: string;
  slug: string;
  description?: string;
  status: ProductStatus;
  images: string[];
  tags?: string[];
  category?: string;
  vendor?: string;
  seo?: SEOSettings;
  variants: ProductVariant[];
  options: ProductOption[];
  metadata?: Record<string, any>;
}

// Product Variant
export interface ProductVariant extends BaseEntity {
  productId: string;
  sku: string;
  title: string;
  price: number;
  compareAtPrice?: number;
  costPerItem?: number;
  inventoryQuantity: number;
  inventoryPolicy: InventoryPolicy;
  weight?: number;
  weightUnit?: string;
  image?: string;
  optionValues: Record<string, string>;
  barcode?: string;
}

// Product Option
export interface ProductOption {
  name: string;
  values: string[];
}

// Order
export interface Order extends BaseEntity {
  storeId: string;
  orderNumber: string;
  customerId?: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  currency: Currency;
  shippingAddress: Address;
  billingAddress: Address;
  customerEmail: string;
  customerPhone?: string;
  notes?: string;
  metadata?: Record<string, any>;
}

// Order Item
export interface OrderItem {
  id: string;
  variantId: string;
  productId: string;
  title: string;
  variantTitle?: string;
  sku: string;
  quantity: number;
  price: number;
  total: number;
  image?: string;
}

// Payment
export interface Payment extends BaseEntity {
  orderId: string;
  storeId: string;
  amount: number;
  currency: Currency;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  gateway: string;
  metadata?: Record<string, any>;
}

// Customer
export interface Customer extends BaseEntity {
  storeId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  status: CustomerStatus;
  addresses: Address[];
  defaultAddressIndex?: number;
  totalOrders: number;
  totalSpent: number;
  tags?: string[];
  notes?: string;
  metadata?: Record<string, any>;
}

// Discount
export interface Discount extends BaseEntity {
  storeId: string;
  code: string;
  type: DiscountType;
  value: number;
  status: DiscountStatus;
  startsAt?: Date;
  endsAt?: Date;
  usageLimit?: number;
  usageCount: number;
  minOrderAmount?: number;
  applicableProducts?: string[];
  applicableCollections?: string[];
  metadata?: Record<string, any>;
}

// Theme
export interface Theme extends BaseEntity {
  storeId: string;
  name: string;
  type: ThemeType;
  status: ThemeStatus;
  settings: ThemeSettings;
  sections: ThemeSection[];
  previewImage?: string;
}

// Theme Settings
export interface ThemeSettings {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  layout: {
    headerStyle: string;
    footerStyle: string;
  };
}

// Theme Section
export interface ThemeSection {
  id: string;
  type: string;
  title: string;
  settings: Record<string, any>;
  blocks?: ThemeBlock[];
  order: number;
}

// Theme Block
export interface ThemeBlock {
  id: string;
  type: string;
  settings: Record<string, any>;
  order: number;
}

// Subscription
export interface Subscription extends BaseEntity {
  tenantId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAt?: Date;
  canceledAt?: Date;
  trialStart?: Date;
  trialEnd?: Date;
  metadata?: Record<string, any>;
}

// Webhook
export interface Webhook extends BaseEntity {
  storeId: string;
  url: string;
  events: WebhookEvent[];
  secret: string;
  isActive: boolean;
  metadata?: Record<string, any>;
}

// Notification
export interface Notification extends BaseEntity {
  storeId: string;
  userId?: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  link?: string;
  metadata?: Record<string, any>;
}

// Analytics Event
export interface AnalyticsEvent {
  storeId: string;
  eventType: string;
  eventData: Record<string, any>;
  timestamp: Date;
  sessionId?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

// API Response
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    page?: number;
    pageSize?: number;
    total?: number;
  };
}

// Pagination
export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Filter Params
export interface FilterParams {
  search?: string;
  status?: string;
  dateFrom?: Date;
  dateTo?: Date;
  [key: string]: any;
}
