import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, IsOptional, IsArray } from 'class-validator';

export class CreateMenuItemDto {
  @ApiProperty({ example: 'Grilled Salmon' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Fresh Atlantic salmon with herbs' })
  @IsString()
  description: string;

  @ApiProperty({ example: 24.99 })
  @IsNumber()
  price: number;

  @ApiProperty({ example: 'Mains' })
  @IsString()
  category: string;

  @ApiProperty({ example: 25 })
  @IsNumber()
  preparationTime: number;

  @ApiProperty({ example: true })
  @IsBoolean()
  @IsOptional()
  available?: boolean;

  @ApiProperty({ example: ['seafood', 'healthy'] })
  @IsArray()
  @IsOptional()
  tags?: string[];
}