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
import { CustomerStatus } from '@afrify/shared';
import { Store } from '../stores/store.entity';
import { Order } from '../orders/order.entity';

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'store_id' })
  storeId: string;

  @ManyToOne(() => Store, (store) => store.customers)
  @JoinColumn({ name: 'store_id' })
  store: Store;

  @Column()
  email: string;

  @Column({ nullable: true, name: 'first_name' })
  firstName: string;

  @Column({ nullable: true, name: 'last_name' })
  lastName: string;

  @Column({ nullable: true })
  phone: string;

  @Column({
    type: 'enum',
    enum: CustomerStatus,
    default: CustomerStatus.ACTIVE,
  })
  status: CustomerStatus;

  @Column({ type: 'jsonb', default: [] })
  addresses: Array<{
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postalCode?: string;
    country: string;
  }>;

  @Column({ type: 'int', nullable: true, name: 'default_address_index' })
  defaultAddressIndex: number;

  @Column({ type: 'int', default: 0, name: 'total_orders' })
  totalOrders: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, name: 'total_spent' })
  totalSpent: number;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @OneToMany(() => Order, (order) => order.customer)
  orders: Order[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
