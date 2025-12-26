import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ThemeType, ThemeStatus } from '@afrify/shared';
import { Store } from '../stores/store.entity';

@Entity('themes')
export class Theme {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'store_id' })
  storeId: string;

  @ManyToOne(() => Store, (store) => store.themes)
  @JoinColumn({ name: 'store_id' })
  store: Store;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: ThemeType,
    default: ThemeType.PRESET,
  })
  type: ThemeType;

  @Column({
    type: 'enum',
    enum: ThemeStatus,
    default: ThemeStatus.UNPUBLISHED,
  })
  status: ThemeStatus;

  @Column({ type: 'jsonb' })
  settings: {
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
  };

  @Column({ type: 'jsonb', default: [] })
  sections: Array<{
    id: string;
    type: string;
    title: string;
    settings: Record<string, any>;
    blocks?: Array<{
      id: string;
      type: string;
      settings: Record<string, any>;
      order: number;
    }>;
    order: number;
  }>;

  @Column({ nullable: true, name: 'preview_image' })
  previewImage: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
