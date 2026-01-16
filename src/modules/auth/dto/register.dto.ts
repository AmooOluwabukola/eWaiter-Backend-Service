import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, Matches } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'admin@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @MinLength(8)
  @Matches(
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()\-_=+{}[\]|\\:;"'<>,./~`]).{8,}$/,
  {
    message:
      'Password must include uppercase, lowercase, number, and special character',
  },
)
password: string;


  @ApiProperty({ example: 'Grand Hotel Restaurant' })
  @IsString()
  restaurantName: string;
}