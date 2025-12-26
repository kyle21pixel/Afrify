import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { ProductVariant } from './product-variant.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(ProductVariant)
    private variantsRepository: Repository<ProductVariant>,
  ) {}

  async create(data: Partial<Product>): Promise<Product> {
    const product = this.productsRepository.create(data);
    return this.productsRepository.save(product);
  }

  async findAll(storeId: string): Promise<Product[]> {
    return this.productsRepository.find({
      where: { storeId },
      relations: ['variants'],
    });
  }

  async findOne(id: string): Promise<Product> {
    return this.productsRepository.findOne({
      where: { id },
      relations: ['variants'],
    });
  }

  async update(id: string, data: Partial<Product>): Promise<Product> {
    await this.productsRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.productsRepository.delete(id);
  }
}
