import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsEnum, MinLength, IsOptional } from 'class-validator';
import { UserRole } from 'src/models/user.schema';

export class CreateStaffDto {
  @ApiProperty({ example: 'Jane Smith' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'jane@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ 
    enum: [UserRole.KITCHEN_STAFF, UserRole.ATTENDANT], 
    example: UserRole.KITCHEN_STAFF 
  })
  @IsEnum([UserRole.KITCHEN_STAFF, UserRole.ATTENDANT])
  role: UserRole.KITCHEN_STAFF | UserRole.ATTENDANT;

  @ApiProperty({ example: '+1234567890', required: false })
  @IsString()
  @IsOptional()
  phone?: string;
}