import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { MenuItemsService } from './menu-items.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-guard';
import { RolesGuard } from '../auth/guards/role-guard';
import { Roles } from '../../common/decorators/role.decorator';
import { UserRole } from 'src/models/user.schema';
import { SuccessResponse } from 'src/utils/https';

@ApiTags('Menu Items')
@Controller('menu-items')
export class MenuItemsController {
  constructor(private readonly menuItemsService: MenuItemsService) {}

  // Public endpoints - for guests 
  @Get('public/restaurant/:restaurantId')
  @ApiOperation({ summary: 'Get all available menu items for a restaurant (public)' })
  async findAllPublic(@Param('restaurantId') restaurantId: string) {
    const items = await this.menuItemsService.findAllPublic(restaurantId);
    return new SuccessResponse('Menu items retrieved successfully', items);
  }

  @Get('public/restaurant/:restaurantId/category/:category')
  @ApiOperation({ summary: 'Get menu items by category (public)' })
  async findByCategory(
    @Param('restaurantId') restaurantId: string,
    @Param('category') category: string,
  ) {
    const items = await this.menuItemsService.findByCategory(restaurantId, category);
    return new SuccessResponse('Menu items retrieved successfully', items);
  }

  @Get('public/restaurant/:restaurantId/categories')
  @ApiOperation({ summary: 'Get all categories for a restaurant (public)' })
  async getCategories(@Param('restaurantId') restaurantId: string) {
    return this.menuItemsService.getCategories(restaurantId);
  }

  // Admin endpoints - manage menu items
  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RESTAURANT_ADMIN)
  @ApiOperation({ summary: 'Create menu item (Admin only)' })
  async create(@Request() req, @Body() createMenuItemDto: CreateMenuItemDto) {
    const menuItem = await this.menuItemsService.create(createMenuItemDto, req.user.restaurantId);
    return  new SuccessResponse ('Menu item created succesfully', menuItem)
  }

 @Get()
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.RESTAURANT_ADMIN, UserRole.KITCHEN_STAFF)
@ApiOperation({ summary: 'Get all menu items (Admin & Kitchen)' })
async findAll(@Request() req) {
  console.log('User restaurantId:', req.user.restaurantId);
  console.log('Type:', typeof req.user.restaurantId);
  
  const items = await this.menuItemsService.findAll(req.user.restaurantId);
return new SuccessResponse('Menu items retrieved successfully', items);  
}

  @Get('stats')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RESTAURANT_ADMIN)

  async getStats(@Request() req) {
    const stats = await this.menuItemsService.getStats(req.user.restaurantId);
    return new SuccessResponse('Menu statistics retrieved successfully', stats);
  }

  


  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RESTAURANT_ADMIN, UserRole.KITCHEN_STAFF)
  @ApiOperation({ summary: 'Get menu item by ID' })
  async findOne(@Param('id') id: string) {
    const item = await this.menuItemsService.findById(id);
    return new SuccessResponse('Menu item retrieved successfully', item);
 
  }


  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RESTAURANT_ADMIN)
  @ApiOperation({ summary: 'Update menu item (Admin only)' })
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateMenuItemDto: UpdateMenuItemDto,
  ) {
    const menuItem = await  this.menuItemsService.update(id, updateMenuItemDto, req.user.restaurantId);
    return new SuccessResponse('Menu item updated successfully', menuItem);
  }


  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RESTAURANT_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete menu item (Admin only)' })
  async remove(@Request() req, @Param('id') id: string) {
    const menuItem = await this.menuItemsService.delete(id, req.user.restaurantId);
    return new SuccessResponse('Menu item deleted successfully', menuItem);
  }
}