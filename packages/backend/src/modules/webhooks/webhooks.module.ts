import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Webhook } from './webhook.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Webhook])],
})
export class WebhooksModule {}
