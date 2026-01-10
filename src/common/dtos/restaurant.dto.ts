import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsBoolean, IsObject } from 'class-validator';

export class CreateRestaurantDto {
  @ApiProperty({ example: 'Grand Hotel Restaurant' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Fine dining experience with international cuisine' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: '123 Main Street, City' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ example: '+1234567890' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: 'contact@grandhotel.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty()
  @IsObject()
  @IsOptional()
  settings?: {
    currency: string;
    timezone: string;
    allowTableOrders: boolean;
    allowRoomOrders: boolean;
  };
}