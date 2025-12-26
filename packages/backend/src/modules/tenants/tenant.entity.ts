import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { SubscriptionPlan, SubscriptionStatus } from '@afrify/shared';
import { Store } from '../stores/store.entity';

@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  slug: string;

  @Column()
  name: string;

  @Column({ name: 'owner_id' })
  ownerId: string;

  @Column({
    type: 'enum',
    enum: SubscriptionPlan,
    default: SubscriptionPlan.FREE,
    name: 'subscription_plan',
  })
  subscriptionPlan: SubscriptionPlan;

  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.TRIAL,
    name: 'subscription_status',
  })
  subscriptionStatus: SubscriptionStatus;

  @Column({ type: 'timestamp', nullable: true, name: 'subscription_ends_at' })
  subscriptionEndsAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @OneToMany(() => Store, (store) => store.tenant)
  stores: Store[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
