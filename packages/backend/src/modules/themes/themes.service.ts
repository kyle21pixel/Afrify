import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Theme } from './theme.entity';

@Injectable()
export class ThemesService {
  constructor(
    @InjectRepository(Theme)
    private themesRepository: Repository<Theme>,
  ) {}

  async findAll(storeId: string): Promise<Theme[]> {
    return this.themesRepository.find({ where: { storeId } });
  }

  async findOne(id: string): Promise<Theme> {
    return this.themesRepository.findOne({ where: { id } });
  }

  async create(data: Partial<Theme>): Promise<Theme> {
    const theme = this.themesRepository.create(data);
    return this.themesRepository.save(theme);
  }

  async update(id: string, data: Partial<Theme>): Promise<Theme> {
    await this.themesRepository.update(id, data);
    return this.findOne(id);
  }
}
