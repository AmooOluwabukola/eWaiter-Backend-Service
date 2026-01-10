import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-guard';
import { RolesGuard } from '../../auth/guards/role-guard';
import { Roles } from 'src/common/decorators/role.decorator';
import { UserRole } from 'src/models/user.schema';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @Roles(UserRole.RESTAURANT_ADMIN)
  @ApiOperation({ summary: 'Get dashboard statistics (Admin only)' })
  async getStats(@Request() req) {
    return this.dashboardService.getAdminStats(req.user.restaurantId);
  }

  @Get('recent-orders')
  @Roles(UserRole.RESTAURANT_ADMIN)
  @ApiOperation({ summary: 'Get recent orders (Admin only)' })
  async getRecentOrders(@Request() req) {
    return this.dashboardService.getRecentOrders(req.user.restaurantId);
  }

  @Get('top-items')
  @Roles(UserRole.RESTAURANT_ADMIN)
  @ApiOperation({ summary: 'Get top selling menu items (Admin only)' })
  async getTopItems(@Request() req) {
    return this.dashboardService.getTopItems(req.user.restaurantId);
  }
}