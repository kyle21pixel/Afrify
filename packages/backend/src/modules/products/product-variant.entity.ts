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
import { InventoryPolicy } from '@afrify/shared';
import { Product } from './product.entity';
import { OrderItem } from '../orders/order-item.entity';

@Entity('product_variants')
export class ProductVariant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'product_id' })
  productId: string;

  @ManyToOne(() => Product, (product) => product.variants)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ unique: true })
  sku: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'compare_at_price' })
  compareAtPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'cost_per_item' })
  costPerItem: number;

  @Column({ type: 'int', default: 0, name: 'inventory_quantity' })
  inventoryQuantity: number;

  @Column({ type: 'int', default: 0 })
  inventory: number;

  @Column({
    type: 'enum',
    enum: InventoryPolicy,
    default: InventoryPolicy.DENY,
    name: 'inventory_policy',
  })
  inventoryPolicy: InventoryPolicy;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  weight: number;

  @Column({ nullable: true, name: 'weight_unit' })
  weightUnit: string;

  @Column({ nullable: true })
  image: string;

  @Column({ type: 'jsonb', nullable: true, name: 'option_values' })
  optionValues: Record<string, string>;

  @Column({ nullable: true })
  barcode: string;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.variant)
  orderItems: OrderItem[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
