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
    BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateStaffDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-guard';
import { RolesGuard } from '../auth/guards/role-guard';
import { Roles } from '../../common/decorators/role.decorator';
import { UserRole } from 'src/models/user.schema';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from 'src/common/dtos/user.dto';
import { Types } from 'mongoose';
import { SuccessResponse } from 'src/utils/https';


@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller({
    path:'users',
    version:'1',
})
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Returns current user' })
  async getProfile(@Request() req) {
    return this.usersService.findById(req.user.userId);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  async updateProfile(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    // If password is being updated, hash it
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    return this.usersService.update(req.user.userId, updateUserDto);
  }

  @Post('staff')
  @UseGuards(RolesGuard)
  @Roles(UserRole.RESTAURANT_ADMIN)
  @ApiOperation({ summary: 'Create new staff member (Admin only)' })
  @ApiResponse({ status: 201, description: 'Staff member created successfully' })
  async createStaff(@Request() req, @Body() createUserDto: CreateStaffDto) {
    // Validate role
    if (!createUserDto.role || ![UserRole.KITCHEN_STAFF, UserRole.ATTENDANT].includes(createUserDto.role)) {
      throw new BadRequestException('Invalid role. Must be kitchen_staff or attendant');
    }

    const restaurantId = new Types.ObjectId(req.user.restaurantId);
    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    return this.usersService.create(
      {
        ...createUserDto,
        password: hashedPassword,
      },
      restaurantId,
    );
  }

  @Get('staff')
  @Roles(UserRole.RESTAURANT_ADMIN)
  @ApiOperation({ summary: 'Get all staff members (Admin only)' })
  @ApiResponse({ status: 200, description: 'Returns all staff' })
  async getAllStaff(@Request() req) {
    return this.usersService.findAll(req.user.restaurantId);
  }

  @Get('staff/:id')
  @Roles(UserRole.RESTAURANT_ADMIN)
  @ApiOperation({ summary: 'Get staff member by ID (Admin only)' })

  async getStaffById(@Request() req, @Param('id') id: string) {
    const staff = await this.usersService.findById(id);
    if (staff.restaurant.toString() !== req.user.restaurantId.toString()) {
      throw new ForbiddenException('Access denied');
    }
    
    return staff;
  }

  @Patch('staff/:id')
  @Roles(UserRole.RESTAURANT_ADMIN)
  @ApiOperation({ summary: 'Update staff member (Admin only)' })
  async updateStaff(
    @Request() req,
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const staff = await this.usersService.update(id, updateUserDto);

    return new SuccessResponse('Staff member updated successfully', staff);
  }


@Patch('staff/:id/toggle-active')
@UseGuards(RolesGuard)
@Roles(UserRole.RESTAURANT_ADMIN)
@HttpCode(HttpStatus.OK)
@ApiOperation({ summary: 'Toggle staff member active status (Admin only)' })
async toggleStaffActive(@Request() req, @Param('id') id: string) {
  const updatedStaff = await this.usersService.toggleActive(id);
  return new SuccessResponse('Staff member status toggled successfully', updatedStaff);
}

  @Delete('staff/:id')
  @Roles(UserRole.RESTAURANT_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete staff member (Admin only)' })
  async deleteStaff(@Request() req, @Param('id') id: string) {
    const staff = await this.usersService.delete(id); 
    
    return new SuccessResponse('Staff member deleted successfully', staff);
  }

  @Get('kitchen-staff')
  @Roles(UserRole.RESTAURANT_ADMIN, UserRole.KITCHEN_STAFF)
  @ApiOperation({ summary: 'Get all kitchen staff' })
  @ApiResponse({ status: 200, description: 'Returns all kitchen staff' })
  async getKitchenStaff(@Request() req) {
    const allStaff = await this.usersService.findAll(req.user.restaurantId);
    return allStaff.filter(staff => staff.role === UserRole.KITCHEN_STAFF);
  }

  @Get('attendants')
  @Roles(UserRole.RESTAURANT_ADMIN, UserRole.ATTENDANT)
  @ApiOperation({ summary: 'Get all attendants' })
  @ApiResponse({ status: 200, description: 'Returns all attendants' })
  async getAttendants(@Request() req) {
    const allStaff = await this.usersService.findAll(req.user.restaurantId);
    return allStaff.filter(staff => staff.role === UserRole.ATTENDANT);
  }
}