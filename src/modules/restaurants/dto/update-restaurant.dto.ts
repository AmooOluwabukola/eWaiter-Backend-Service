import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsObject, IsBoolean } from 'class-validator';

export class UpdateRestaurantDto {
  @ApiProperty({ example: 'Grand Hotel Restaurant', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 'Fine dining experience', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'https://example.com/logo.png', required: false })
  @IsString()
  @IsOptional()
  logo?: string;

  @ApiProperty({ example: '123 Main Street', required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ example: '+1234567890', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: 'contact@example.com', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ 
    example: {
      currency: 'USD',
      timezone: 'America/New_York',
      allowTableOrders: true,
      allowRoomOrders: false
    },
    required: false 
  })
  @IsObject()
  @IsOptional()
  settings?: {
    currency?: string;
    timezone?: string;
    allowTableOrders?: boolean;
    allowRoomOrders?: boolean;
  };

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}