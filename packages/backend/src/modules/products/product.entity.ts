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
import { ProductStatus } from '@afrify/shared';
import { Store } from '../stores/store.entity';
import { ProductVariant } from './product-variant.entity';
import { OrderItem } from '../orders/order-item.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'store_id' })
  storeId: string;

  @ManyToOne(() => Store, (store) => store.products)
  @JoinColumn({ name: 'store_id' })
  store: Store;

  @Column()
  title: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price: number;

  @Column({ nullable: true })
  name: string;

  @Column({ type: 'boolean', default: true, name: 'track_inventory' })
  trackInventory: boolean;

  @Column({
    type: 'enum',
    enum: ProductStatus,
    default: ProductStatus.DRAFT,
  })
  status: ProductStatus;

  @Column({ type: 'simple-array' })
  images: string[];

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ nullable: true })
  category: string;

  @Column({ nullable: true })
  vendor: string;

  @Column({ type: 'jsonb', nullable: true })
  seo: {
    title?: string;
    description?: string;
    keywords?: string[];
    ogImage?: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  options: Array<{
    name: string;
    values: string[];
  }>;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @OneToMany(() => ProductVariant, (variant) => variant.product, { cascade: true })
  variants: ProductVariant[];

  @OneToMany(() => OrderItem, (orderItem) => orderItem.product)
  orderItems: OrderItem[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
