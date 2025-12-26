import { IsString, IsEmail, IsOptional, IsEnum, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Currency, StoreStatus } from '@afrify/shared';

export class CreateStoreDto {
  @ApiProperty()
  @IsString()
  tenantId: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  domain?: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ enum: Currency, default: Currency.USD })
  @IsEnum(Currency)
  currency: Currency;

  @ApiProperty({ required: false, default: 'UTC' })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiProperty({ enum: StoreStatus, default: StoreStatus.PENDING })
  @IsOptional()
  @IsEnum(StoreStatus)
  status?: StoreStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  logo?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  address?: any;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  settings?: any;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
