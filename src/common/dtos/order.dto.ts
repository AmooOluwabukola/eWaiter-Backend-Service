import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, IsNumber, IsEnum, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '../../models/order.schema';

class OrderItemDto {
  @ApiProperty()
  @IsString()
  menuItem: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNumber()
  price: number;

  @ApiProperty()
  @IsNumber()
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty()
  @IsString()
  customerName: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  roomNumber?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  tableNumber?: string;

  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiProperty()
  @IsNumber()
  total: number;

  @ApiProperty({ enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  specialInstructions?: string;
}