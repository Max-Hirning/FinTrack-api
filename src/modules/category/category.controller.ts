import {IResponse} from '@/types/app.types';
import {CategoryService} from './category.service';
import {ImageService} from '@imageModule/image.service';
import {FileInterceptor} from '@nestjs/platform-express';
import {AdminGuard} from '@authModule/guards/admin.guard';
import {CommonService} from '@commonModule/common.service';
import {CategorySuccessMessages} from '@messages/category';
import {CreateCategoryDto} from './dto/create-category.dto';
import {UpdateCategoryDto} from './dto/update-category.dto';
import {ICategory, IUpdateCategory} from './types/category.types';
import {Controller, Get, Post, Body, Put, Param, Delete, HttpStatus, UseGuards, UseInterceptors, HttpException, UploadedFile} from '@nestjs/common';

@Controller('category')
export class CategoryController {
  constructor(
    private readonly imageService: ImageService,
    private readonly commonService: CommonService,
    private readonly categoryService: CategoryService,
  ) {}

  @Get()
  async findMany(): Promise<IResponse<ICategory[]>> {
    const response = await this.categoryService.findMany();
    return ({
      data: response,
      statusCode: HttpStatus.OK,
      message: CategorySuccessMessages.findMany,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<IResponse<ICategory>> {
    const response = await this.categoryService.findOne(id);
    return ({
      data: response,
      statusCode: HttpStatus.OK,
      message: CategorySuccessMessages.findOne,
    });
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  async removeOne(@Param('id') id: string): Promise<IResponse<undefined>> {
    const transaction = await this.commonService.findOneTransactionAPI('categoryId', id, true);
    if(transaction) throw new HttpException('Category must have no transactions', HttpStatus.NOT_FOUND);
    const category = await this.commonService.findOneCategoryAPI('_id', id);
    await this.imageService.removeOne(category.imageId);
    const response = await this.categoryService.removeOne(id);
    return ({
      message: response,
      statusCode: HttpStatus.OK,
    });
  }

  @Post()
  @UseGuards(AdminGuard)
  @UseInterceptors(FileInterceptor('image'))
  async create(@UploadedFile() file: Express.Multer.File, @Body() createCategoryDto: CreateCategoryDto): Promise<IResponse<undefined>> {
    if(file && (createCategoryDto.mcc && Array.isArray(JSON.parse(createCategoryDto.mcc)))) {
      const imageId = await this.imageService.createOne(file.buffer, {folder: 'FinTrack/categories'});
      const response = await this.categoryService.createOne({
        imageId,
        title: createCategoryDto.title,
        color: createCategoryDto.color,
        parentId: createCategoryDto.parentId,
        mcc: JSON.parse(createCategoryDto.mcc),
      });
      return ({
        message: response,
        statusCode: HttpStatus.OK,
      });
    }
    throw new HttpException('Image, mcc are required', HttpStatus.BAD_REQUEST);
  }

  @Put(':id')
  @UseGuards(AdminGuard)
  @UseInterceptors(FileInterceptor('image'))
  async updateOne(@Param('id') id: string, @UploadedFile() file: Express.Multer.File, @Body() updateCategoryDto: UpdateCategoryDto): Promise<IResponse<undefined>> {
    const updateCategory: IUpdateCategory = {};
    if(file) {
      const category = await this.commonService.findOneCategoryAPI('_id', id);
      await this.imageService.updateOne(category.imageId, file.buffer, {folder: 'FinTrack/categories'});
    }
    if(updateCategoryDto.title) updateCategory.title = updateCategoryDto.title;
    if(updateCategoryDto.color) updateCategory.color = updateCategoryDto.color;
    if(updateCategoryDto.parentId) updateCategory.parentId = updateCategoryDto.parentId;
    if(updateCategoryDto.mcc && Array.isArray(JSON.parse(updateCategoryDto.mcc))) updateCategory.mcc = JSON.parse(updateCategoryDto.mcc);
    const response = await this.categoryService.updateOne(id, updateCategory);
    return ({
      message: response,
      statusCode: HttpStatus.OK,
    });
  }
}
