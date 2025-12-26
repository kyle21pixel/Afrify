import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Discount } from './discount.entity';
import { DiscountStatus, DiscountType } from '@afrify/shared';

export interface CreateDiscountDto {
  code: string;
  type: DiscountType;
  value: number;
  minOrderValue?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  validFrom: Date;
  validUntil: Date;
  description?: string;
}

export interface UpdateDiscountDto {
  value?: number;
  minOrderValue?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  validFrom?: Date;
  validUntil?: Date;
  description?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
}

export interface ValidateDiscountResult {
  valid: boolean;
  discount?: Discount;
  discountAmount: number;
  error?: string;
}

@Injectable()
export class DiscountsService {
  constructor(
    @InjectRepository(Discount)
    private discountRepository: Repository<Discount>,
  ) {}

  /**
   * Create a new discount code
   */
  async create(storeId: string, createDiscountDto: CreateDiscountDto): Promise<Discount> {
    // Check if code already exists
    const existing = await this.discountRepository.findOne({
      where: { code: createDiscountDto.code.toUpperCase(), storeId },
    });

    if (existing) {
      throw new BadRequestException('Discount code already exists');
    }

    // Validate discount value
    if (createDiscountDto.type === 'PERCENTAGE' && createDiscountDto.value > 100) {
      throw new BadRequestException('Percentage discount cannot exceed 100%');
    }

    if (createDiscountDto.value <= 0) {
      throw new BadRequestException('Discount value must be greater than 0');
    }

    // Validate dates
    const now = new Date();
    if (createDiscountDto.validFrom < now) {
      throw new BadRequestException('Valid from date cannot be in the past');
    }

    if (createDiscountDto.validUntil <= createDiscountDto.validFrom) {
      throw new BadRequestException('Valid until date must be after valid from date');
    }

    const discount = this.discountRepository.create({
      ...createDiscountDto,
      code: createDiscountDto.code.toUpperCase(),
      storeId,
      status: DiscountStatus.ACTIVE,
      usedCount: 0,
    });

    return this.discountRepository.save(discount);
  }

  /**
   * Find all discounts for a store
   */
  async findAll(storeId: string): Promise<Discount[]> {
    return this.discountRepository.find({
      where: { storeId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Find a discount by ID
   */
  async findOne(id: string, storeId: string): Promise<Discount> {
    const discount = await this.discountRepository.findOne({
      where: { id, storeId },
    });

    if (!discount) {
      throw new NotFoundException('Discount not found');
    }

    return discount;
  }

  /**
   * Find a discount by code
   */
  async findByCode(code: string, storeId: string): Promise<Discount | null> {
    return this.discountRepository.findOne({
      where: { code: code.toUpperCase(), storeId },
    });
  }

  /**
   * Update a discount
   */
  async update(
    id: string,
    storeId: string,
    updateDiscountDto: UpdateDiscountDto,
  ): Promise<Discount> {
    const discount = await this.findOne(id, storeId);

    // Validate percentage if updating value
    if (
      updateDiscountDto.value !== undefined &&
      discount.type === 'PERCENTAGE' &&
      updateDiscountDto.value > 100
    ) {
      throw new BadRequestException('Percentage discount cannot exceed 100%');
    }

    // Validate dates if updating
    if (
      updateDiscountDto.validFrom &&
      updateDiscountDto.validUntil &&
      updateDiscountDto.validUntil <= updateDiscountDto.validFrom
    ) {
      throw new BadRequestException('Valid until date must be after valid from date');
    }

    Object.assign(discount, updateDiscountDto);
    return this.discountRepository.save(discount);
  }

  /**
   * Delete a discount
   */
  async remove(id: string, storeId: string): Promise<void> {
    const discount = await this.findOne(id, storeId);
    await this.discountRepository.remove(discount);
  }

  /**
   * Validate a discount code and calculate discount amount
   */
  async validateDiscount(
    code: string,
    storeId: string,
    orderTotal: number,
  ): Promise<ValidateDiscountResult> {
    const discount = await this.findByCode(code, storeId);

    // Check if discount exists
    if (!discount) {
      return {
        valid: false,
        discountAmount: 0,
        error: 'Invalid discount code',
      };
    }

    // Check if discount is active
    if (discount.status !== 'ACTIVE') {
      return {
        valid: false,
        discountAmount: 0,
        error: 'This discount code is not active',
      };
    }

    // Check date validity
    const now = new Date();
    if (now < discount.validFrom) {
      return {
        valid: false,
        discountAmount: 0,
        error: `This discount code is not valid until ${discount.validFrom.toLocaleDateString()}`,
      };
    }

    if (now > discount.validUntil) {
      return {
        valid: false,
        discountAmount: 0,
        error: 'This discount code has expired',
      };
    }

    // Check usage limit
    if (discount.usageLimit && discount.usedCount >= discount.usageLimit) {
      return {
        valid: false,
        discountAmount: 0,
        error: 'This discount code has reached its usage limit',
      };
    }

    // Check minimum order value
    if (discount.minOrderValue && orderTotal < discount.minOrderValue) {
      return {
        valid: false,
        discountAmount: 0,
        error: `Order total must be at least ₦${discount.minOrderValue.toLocaleString()} to use this code`,
      };
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (discount.type === 'PERCENTAGE') {
      discountAmount = (orderTotal * discount.value) / 100;
    } else if (discount.type === 'FIXED_AMOUNT') {
      discountAmount = discount.value;
    }

    // Apply maximum discount amount cap
    if (discount.maxDiscountAmount && discountAmount > discount.maxDiscountAmount) {
      discountAmount = discount.maxDiscountAmount;
    }

    // Ensure discount doesn't exceed order total
    if (discountAmount > orderTotal) {
      discountAmount = orderTotal;
    }

    return {
      valid: true,
      discount,
      discountAmount,
    };
  }

  /**
   * Apply a discount (increment used count)
   */
  async applyDiscount(discountId: string): Promise<void> {
    await this.discountRepository.increment({ id: discountId }, 'usedCount', 1);
  }

  /**
   * Get discount statistics
   */
  async getStatistics(storeId: string): Promise<{
    total: number;
    active: number;
    expired: number;
    totalUsage: number;
  }> {
    const discounts = await this.findAll(storeId);
    const now = new Date();

    const total = discounts.length;
    const active = discounts.filter(
      (d) => d.status === 'ACTIVE' && d.validUntil > now,
    ).length;
    const expired = discounts.filter((d) => d.validUntil <= now).length;
    const totalUsage = discounts.reduce((sum, d) => sum + d.usedCount, 0);

    return {
      total,
      active,
      expired,
      totalUsage,
    };
  }

  /**
   * Automatically expire discounts past their valid until date
   */
  async expireOldDiscounts(): Promise<number> {
    const now = new Date();
    const result = await this.discountRepository
      .createQueryBuilder()
      .update(Discount)
      .set({ status: DiscountStatus.EXPIRED })
      .where('validUntil < :now', { now })
      .andWhere('status = :status', { status: DiscountStatus.ACTIVE })
      .execute();

    return result.affected || 0;
  }

  /**
   * Generate a random discount code
   */
  generateCode(prefix = 'SAVE', length = 8): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = prefix;
    
    for (let i = 0; i < length; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    return code;
  }

  /**
   * Bulk create discount codes
   */
  async bulkCreate(
    storeId: string,
    template: CreateDiscountDto,
    count: number,
  ): Promise<Discount[]> {
    if (count > 100) {
      throw new BadRequestException('Cannot create more than 100 codes at once');
    }

    const discounts: Discount[] = [];

    for (let i = 0; i < count; i++) {
      const code = this.generateCode('BULK', 10);
      const discount = this.discountRepository.create({
        ...template,
        code,
        storeId,
        status: DiscountStatus.ACTIVE,
        usedCount: 0,
      });
      discounts.push(discount);
    }

    return this.discountRepository.save(discounts);
  }
}
