import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Store } from './store.entity';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { slugify } from '@afrify/shared';

@Injectable()
export class StoresService {
  constructor(
    @InjectRepository(Store)
    private storesRepository: Repository<Store>,
  ) {}

  async create(createStoreDto: CreateStoreDto): Promise<Store> {
    const slug = slugify(createStoreDto.name);
    
    // Check if slug already exists
    const existingStore = await this.storesRepository.findOne({ where: { slug } });
    if (existingStore) {
      throw new ConflictException('Store with this name already exists');
    }

    const store = this.storesRepository.create({
      ...createStoreDto,
      slug,
    });

    return this.storesRepository.save(store);
  }

  async findAll(tenantId?: string): Promise<Store[]> {
    const where = tenantId ? { tenantId } : {};
    return this.storesRepository.find({ where });
  }

  async findOne(id: string): Promise<Store> {
    const store = await this.storesRepository.findOne({ where: { id } });
    if (!store) {
      throw new NotFoundException('Store not found');
    }
    return store;
  }

  async findBySlug(slug: string): Promise<Store> {
    const store = await this.storesRepository.findOne({ where: { slug } });
    if (!store) {
      throw new NotFoundException('Store not found');
    }
    return store;
  }

  async update(id: string, updateStoreDto: UpdateStoreDto): Promise<Store> {
    const store = await this.findOne(id);
    
    if (updateStoreDto.name && updateStoreDto.name !== store.name) {
      const newSlug = slugify(updateStoreDto.name);
      const existingStore = await this.storesRepository.findOne({ where: { slug: newSlug } });
      if (existingStore && existingStore.id !== id) {
        throw new ConflictException('Store with this name already exists');
      }
      store.slug = newSlug;
    }

    Object.assign(store, updateStoreDto);
    return this.storesRepository.save(store);
  }

  async remove(id: string): Promise<void> {
    const store = await this.findOne(id);
    await this.storesRepository.remove(store);
  }

  async findByTenantId(tenantId: string): Promise<Store[]> {
    return this.storesRepository.find({ where: { tenantId } });
  }
}
