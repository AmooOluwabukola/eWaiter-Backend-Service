import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-guard';
import { RolesGuard } from '../auth/guards/role-guard';
import { Roles } from '../../common/decorators/role.decorator';
import { UserRole } from 'src/models/user.schema';
import { OrderStatus } from 'src/models/order.schema';
import { Types } from 'mongoose';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new order (Public - no auth required)' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  async create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @Get('track/:orderNumber')
  @ApiOperation({ summary: 'Track order by order number (Public)' })
  async trackOrder(@Param('orderNumber') orderNumber: string) {
    return this.ordersService.findByOrderNumber(orderNumber)
  }

  @Get('restaurant')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RESTAURANT_ADMIN, UserRole.KITCHEN_STAFF, UserRole.ATTENDANT)
  @ApiOperation({ summary: 'Get all orders for restaurant (Admin/Staff only)' })
  async findAllForRestaurant(
    @Request() req,
    @Query('status') status?: OrderStatus,
  ) {
    return this.ordersService.findAllByRestaurant(req.user.restaurantId, status);
  }

  @Patch(':id/status')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RESTAURANT_ADMIN, UserRole.KITCHEN_STAFF)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update order status (Admin/Kitchen only)' })
  async updateStatus(
    @Request() req,
    @Param('id') id: string,
    @Body('status') status: OrderStatus,
  ) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid order ID');
    }

    return this.ordersService.updateStatus(id, status, req.user.restaurantId);
  }
}