import {CategoryService} from './category.service';
import {AuthGuard} from '../auth/guards/auth.guard';
import {ImageService} from '@imageModule/image.service';
import {FileInterceptor} from '@nestjs/platform-express';
import {CommonService} from '@commonModule/common.service';
import {CreateCategoryDto} from './dto/create-category.dto';
import {UpdateCategoryDto} from './dto/update-category.dto';
import {ICustomRequest, IResponse} from 'src/types/app.types';
import {CategorySuccessMessages} from '@configs/messages/category';
import {ICategoryResponse, IUpdateCategory} from './types/category.types';
import {Controller, Get, Post, Body, Put, Param, Delete, HttpStatus, UseGuards, UseInterceptors, HttpException, UploadedFile, Request} from '@nestjs/common';

@Controller('category')
export class CategoryController {
  constructor(
    private readonly imageService: ImageService,
    private readonly commonService: CommonService,
    private readonly categoryService: CategoryService,
  ) {}

  @Get()
  async findMany(): Promise<IResponse<ICategoryResponse[]>> {
    const response = await this.categoryService.findMany();
    return ({
      data: response,
      statusCode: HttpStatus.OK,
      message: CategorySuccessMessages.findMany,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<IResponse<ICategoryResponse>> {
    const response = await this.categoryService.findOne(id);
    return ({
      data: response,
      statusCode: HttpStatus.OK,
      message: CategorySuccessMessages.findOne,
    });
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async removeOne(@Request() req: ICustomRequest, @Param('id') id: string): Promise<IResponse<undefined>> {
    if(req.role !== 'Admin') throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
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
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async create(@Request() req: ICustomRequest, @UploadedFile() file: Express.Multer.File, @Body() createCategoryDto: CreateCategoryDto): Promise<IResponse<undefined>> {
    if(req.role !== 'Admin') throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    if(file && (createCategoryDto.mcc && Array.isArray(JSON.parse(createCategoryDto.mcc)))) {
      const imageId = await this.imageService.createOne(file.buffer, {
        folder: 'FinTrack/categories',
        fetch_format: 'svg',
        crop: 'fill',
        height: 50, 
        width: 50, 
      });
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
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async updateOne(@Request() req: ICustomRequest, @Param('id') id: string, @UploadedFile() file: Express.Multer.File, @Body() updateCategoryDto: UpdateCategoryDto): Promise<IResponse<undefined>> {
    if(req.role !== 'Admin') throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    const updateCategory: IUpdateCategory = {};
    if(file) {
      const category = await this.commonService.findOneCategoryAPI('_id', id);
      await this.imageService.updateOne(category.imageId, file.buffer, {
        folder: 'FinTrack/categories',
        fetch_format: 'svg',
        crop: 'fill',
        height: 50, 
        width: 50, 
      });
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
