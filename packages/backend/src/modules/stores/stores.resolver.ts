import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { StoresService } from './stores.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';

@Resolver('Store')
export class StoresResolver {
  constructor(private readonly storesService: StoresService) {}

  @Mutation('createStore')
  create(@Args('createStoreInput') createStoreDto: CreateStoreDto) {
    return this.storesService.create(createStoreDto);
  }

  @Query('stores')
  findAll(@Args('tenantId') tenantId?: string) {
    return this.storesService.findAll(tenantId);
  }

  @Query('store')
  findOne(@Args('id') id: string) {
    return this.storesService.findOne(id);
  }

  @Mutation('updateStore')
  update(
    @Args('id') id: string,
    @Args('updateStoreInput') updateStoreDto: UpdateStoreDto,
  ) {
    return this.storesService.update(id, updateStoreDto);
  }

  @Mutation('removeStore')
  remove(@Args('id') id: string) {
    return this.storesService.remove(id);
  }
}
