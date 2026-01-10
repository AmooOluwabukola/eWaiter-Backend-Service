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
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RestaurantsService } from './restaurants.service';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-guard';
import { RolesGuard } from '../auth/guards/role-guard';
import { Roles } from '../../common/decorators/role.decorator';
import { UserRole } from 'src/models/user.schema';
import { SuccessResponse } from 'src/utils/https';

@ApiTags('Restaurants')
@Controller('restaurants')
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all restaurants (public)' })
  @ApiResponse({ status: 200, description: 'Returns all active restaurants' })
  async findAll() {
    const restaurants = await this.restaurantsService.findAll();
    // Only return active restaurants for public endpoint
    return restaurants.filter(restaurant => restaurant.isActive);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get restaurant by slug (public)' })
  @ApiResponse({ status: 200, description: 'Returns restaurant details' })
  @ApiResponse({ status: 404, description: 'Restaurant not found' })
  async findBySlug(@Param('slug') slug: string) {
    return this.restaurantsService.findBySlug(slug);
  }

  @Get('restaurant/user')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user restaurant' })
  @ApiResponse({ status: 200, description: 'Returns user restaurant' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMyRestaurant(@Request() req) {
    if (!req.user.restaurantId) {
      throw new ForbiddenException('No restaurant associated with this account');
    }
    return this.restaurantsService.findById(req.user.restaurantId);
  }

  @Patch('restaurant/admin')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RESTAURANT_ADMIN)
  @ApiOperation({ summary: 'Update current restaurant (Admin only)' })
  @ApiResponse({ status: 200, description: 'Restaurant updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async updateMyRestaurant(
    @Request() req,
    @Body() updateRestaurantDto: UpdateRestaurantDto,
  ) {
    if (!req.user.restaurantId) {
      throw new ForbiddenException('No restaurant associated with this account');
    }
    return this.restaurantsService.update(req.user.restaurantId, updateRestaurantDto);
  }

  @Patch('restaurant/toggle-active')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RESTAURANT_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Toggle restaurant active status (Admin only)' })
  async toggleMyRestaurant(@Request() req) {
    if (!req.user.restaurantId) {
      throw new ForbiddenException('No restaurant associated with this account');
    }
    const restaurant = await this.restaurantsService.findById(req.user.restaurantId);
    if (!restaurant) {
      throw new ForbiddenException('Restaurant not found');
    }
    return new SuccessResponse('Restaurant status toggled successfully', await this.restaurantsService.toggleActive(req.user.restaurantId));
  }

 

  

  @Post('admin/create')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create restaurant (Super Admin only)' })

  async createRestaurant(@Body() createRestaurantDto: CreateRestaurantDto) {
    return this.restaurantsService.create(createRestaurantDto);
  }

  @Patch('admin/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update any restaurant (Super Admin only)' })
  @ApiResponse({ status: 200, description: 'Restaurant updated successfully' })
  async updateRestaurant(
    @Param('id') id: string,
    @Body() updateRestaurantDto: UpdateRestaurantDto,
  ) {
    return this.restaurantsService.update(id, updateRestaurantDto);
  }

  @Patch('admin/:id/toggle-active')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Toggle restaurant status (Super Admin only)' })
  async toggleRestaurant(@Param('id') id: string) {
    const restaurant = await this.restaurantsService.toggleActive(id);
    return new SuccessResponse('Restaurant status toggled successfully', restaurant);
  }

  @Delete('admin/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete restaurant (Super Admin only)' })
  async remove(@Param('id') id: string) {

    throw new ForbiddenException('Restaurant deletion requires manual intervention. Please contact system administrator.');
  }


   @Get(':id')
  @ApiOperation({ summary: 'Get restaurant by ID (public)' })
  async findOne(@Param('id') id: string) {
    const restaurant = await this.restaurantsService.findById(id);
    return new SuccessResponse('Restaurant retrieved successfully', restaurant);
  }
}