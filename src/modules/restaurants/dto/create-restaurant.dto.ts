import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsBoolean, IsObject } from 'class-validator';

export class CreateRestaurantDto {
  @ApiProperty({ example: 'Grand Hotel Restaurant' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Fine dining experience with international cuisine', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: '123 Main Street, City', required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ example: '+1234567890', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: 'contact@grandhotel.com', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ 
    example: {
      currency: 'USD',
      timezone: 'America/New_York',
      allowTableOrders: true,
      allowRoomOrders: true
    },
    required: false 
  })
  @IsObject()
  @IsOptional()
  settings?: {
    currency: string;
    timezone: string;
    allowTableOrders: boolean;
    allowRoomOrders: boolean;
  };
}