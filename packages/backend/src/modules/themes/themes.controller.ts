import { Controller, Get, Post, Body, Patch, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ThemesService } from './themes.service';

@ApiTags('themes')
@ApiBearerAuth()
@Controller('themes')
export class ThemesController {
  constructor(private readonly themesService: ThemesService) {}

  @Get()
  findAll(@Query('storeId') storeId: string) {
    return this.themesService.findAll(storeId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.themesService.findOne(id);
  }

  @Post()
  create(@Body() data: any) {
    return this.themesService.create(data);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.themesService.update(id, data);
  }
}
