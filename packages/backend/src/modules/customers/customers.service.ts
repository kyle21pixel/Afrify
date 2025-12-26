import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './customer.entity';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private customersRepository: Repository<Customer>,
  ) {}

  async findAll(storeId: string): Promise<Customer[]> {
    return this.customersRepository.find({ where: { storeId } });
  }

  async findOne(id: string): Promise<Customer> {
    return this.customersRepository.findOne({ where: { id } });
  }
}
