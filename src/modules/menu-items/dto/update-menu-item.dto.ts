import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, IsOptional, IsArray, IsObject, Min } from 'class-validator';

export class UpdateMenuItemDto {
  @ApiProperty({ example: 'Grilled Salmon', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 'Fresh Atlantic salmon with herbs', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 24.99, required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @ApiProperty({ example: 'Mains', required: false })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({ example: 'https://example.com/salmon.jpg', required: false })
  @IsString()
  @IsOptional()
  image?: string;

  @ApiProperty({ example: 25, required: false })
  @IsNumber()
  @Min(1)
  @IsOptional()
  preparationTime?: number;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  available?: boolean;

  @ApiProperty({ example: ['seafood', 'healthy'], required: false })
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