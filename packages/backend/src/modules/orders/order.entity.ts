import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { OrderStatus, PaymentStatus, FulfillmentStatus, Currency } from '@afrify/shared';
import { Store } from '../stores/store.entity';
import { Customer } from '../customers/customer.entity';
import { OrderItem } from './order-item.entity';
import { Payment } from '../payments/payment.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'store_id' })
  storeId: string;

  @ManyToOne(() => Store, (store) => store.orders)
  @JoinColumn({ name: 'store_id' })
  store: Store;

  @Column({ unique: true, name: 'order_number' })
  orderNumber: string;

  @Column({ name: 'customer_id', nullable: true })
  customerId: string;

  @ManyToOne(() => Customer, (customer) => customer.orders, { nullable: true })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
    name: 'payment_status',
  })
  paymentStatus: PaymentStatus;

  @Column({
    type: 'enum',
    enum: FulfillmentStatus,
    default: FulfillmentStatus.UNFULFILLED,
    name: 'fulfillment_status',
  })
  fulfillmentStatus: FulfillmentStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  tax: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  shipping: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @Column({
    type: 'enum',
    enum: Currency,
  })
  currency: Currency;

  @Column({ type: 'jsonb', name: 'shipping_address' })
  shippingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postalCode?: string;
    country: string;
  };

  @Column({ type: 'jsonb', name: 'billing_address' })
  billingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postalCode?: string;
    country: string;
  };

  @Column({ name: 'customer_email' })
  customerEmail: string;

  @Column({ nullable: true, name: 'customer_phone' })
  customerPhone: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ nullable: true, name: 'tracking_number' })
  trackingNumber: string;

  @Column({ nullable: true })
  carrier: string;

  @Column({ nullable: true, name: 'cancellation_reason' })
  cancellationReason: string;

  @Column({ type: 'timestamp', nullable: true, name: 'delivered_at' })
  deliveredAt: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'cancelled_at' })
  cancelledAt: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'fulfilled_at' })
  fulfilledAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];

  @OneToOne(() => Payment, (payment) => payment.order)
  payment: Payment;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
