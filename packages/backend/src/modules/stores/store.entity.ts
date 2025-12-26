import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { StoreStatus, Currency } from '@afrify/shared';
import { Tenant } from '../tenants/tenant.entity';
import { Product } from '../products/product.entity';
import { Order } from '../orders/order.entity';
import { Customer } from '../customers/customer.entity';
import { Theme } from '../themes/theme.entity';

@Entity('stores')
export class Store {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @ManyToOne(() => Tenant, (tenant) => tenant.stores)
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ nullable: true })
  domain: string;

  @Column({ nullable: true, name: 'custom_domain' })
  customDomain: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({
    type: 'enum',
    enum: Currency,
    default: Currency.USD,
  })
  currency: Currency;

  @Column({ default: 'UTC' })
  timezone: string;

  @Column({
    type: 'enum',
    enum: StoreStatus,
    default: StoreStatus.PENDING,
  })
  status: StoreStatus;

  @Column({ nullable: true })
  logo: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  address: {
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postalCode?: string;
    country: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  settings: {
    enableCheckout: boolean;
    enableReviews: boolean;
    enableWishlist: boolean;
    taxIncluded: boolean;
    taxRate?: number;
    shippingRates?: any[];
    paymentMethods: string[];
    notifications: any;
    seo?: any;
  };

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @OneToMany(() => Product, (product) => product.store)
  products: Product[];

  @OneToMany(() => Order, (order) => order.store)
  orders: Order[];

  @OneToMany(() => Customer, (customer) => customer.store)
  customers: Customer[];

  @OneToMany(() => Theme, (theme) => theme.store)
  themes: Theme[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
