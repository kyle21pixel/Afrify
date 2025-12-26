import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DiscountType, DiscountStatus } from '@afrify/shared';

@Entity('discounts')
export class Discount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'store_id' })
  storeId: string;

  @Column({ unique: true })
  code: string;

  @Column({
    type: 'enum',
    enum: DiscountType,
  })
  type: DiscountType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  value: number;

  @Column({
    type: 'enum',
    enum: DiscountStatus,
    default: DiscountStatus.ACTIVE,
  })
  status: DiscountStatus;

  @Column({ type: 'timestamp', nullable: true, name: 'starts_at' })
  startsAt: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'valid_from' })
  validFrom: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'ends_at' })
  endsAt: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'valid_until' })
  validUntil: Date;

  @Column({ type: 'int', nullable: true, name: 'usage_limit' })
  usageLimit: number;

  @Column({ type: 'int', default: 0, name: 'usage_count' })
  usageCount: number;

  @Column({ type: 'int', default: 0, name: 'used_count' })
  usedCount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'min_order_amount' })
  minOrderAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'min_order_value' })
  minOrderValue: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'max_discount_amount' })
  maxDiscountAmount: number;

  @Column({ type: 'simple-array', nullable: true, name: 'applicable_products' })
  applicableProducts: string[];

  @Column({ type: 'simple-array', nullable: true, name: 'applicable_collections' })
  applicableCollections: string[];

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
