import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, IsOptional, IsArray, IsObject, Min } from 'class-validator';

export class CreateMenuItemDto {
  @ApiProperty({ example: 'Grilled Salmon' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Fresh Atlantic salmon with herbs and lemon' })
  @IsString()
  description: string;

  @ApiProperty({ example: 24.99 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 'Mains' })
  @IsString()
  category: string;

  @ApiProperty({ example: 'https://example.com/salmon.jpg', required: false })
  @IsString()
  @IsOptional()
  image?: string;

  @ApiProperty({ example: 25, description: 'Preparation time in minutes' })
  @IsNumber()
  @Min(1)
  preparationTime: number;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  available?: boolean;

  @ApiProperty({ example: ['seafood', 'healthy', 'gluten-free'], required: false })
  @IsArray()
  @IsOptional()
  tags?: string[];

  @ApiProperty({ 
    example: { calories: 450, protein: 35, carbs: 20, fat: 25 },
    required: false 
  })
  @IsObject()
  @IsOptional()
  nutritionalInfo?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
}