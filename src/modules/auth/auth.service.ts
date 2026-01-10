import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RestaurantsService } from '../restaurants/restaurants.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UserRole } from 'src/models/user.schema';
import { SuccessResponse } from 'src/utils/https';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private restaurantsService: RestaurantsService,
    private jwtService: JwtService,
  ) {}



async register(registerDto: RegisterDto) {

  const existingUser = await this.usersService.findByEmail(registerDto.email);
  if (existingUser) {
    throw new ConflictException('User with this email already exists');
  }

  try {
   
    const restaurant = await this.restaurantsService.create({
      name: registerDto.restaurantName,
      email: registerDto.email,
    });
   

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
  
    const user = await this.usersService.create(
      {
        name: registerDto.name,
        email: registerDto.email,
        password: hashedPassword,
        role: UserRole.RESTAURANT_ADMIN,
      },
      restaurant._id,
    );
 
    await this.restaurantsService.setOwner(restaurant._id, user._id);
    const token = this.generateToken(user);
    return {
      access_token: token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        restaurant: {
          id: restaurant._id,
          name: restaurant.name,
          slug: restaurant.slug,
        },
      },
    };
  } catch (error) {

    console.error('Error:', error);
    
    if (error.code === 11000) {
      throw new ConflictException('A restaurant with a similar name already exists. Please choose a different name.');
    }
    
    throw error;
  }
}

  async login(loginDto: LoginDto): Promise<SuccessResponse> {
  const user = await this.usersService.findByEmail(loginDto.email);
  
  if (!user) {
    throw new UnauthorizedException('Invalid credentials');
  }

  const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
  
  if (!isPasswordValid) {
    throw new UnauthorizedException('Invalid credentials');
  }

  if (!user.isActive) {
    throw new UnauthorizedException('Account is deactivated');
  }

  const token = this.generateToken(user);

  let restaurantData;
  if (user.restaurant) {
    try {
      const restaurant = await this.restaurantsService.findById(user.restaurant.toString());
      restaurantData = {
        id: restaurant._id,
        name: restaurant.name,
        slug: restaurant.slug,
      };
    } catch (error) {
      console.error('Failed to fetch restaurant:', error);
      // Continue without restaurant data
    }
  }

  return new SuccessResponse('Login successful', {
    access_token: token,
    user: {
      id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          restaurant: restaurantData,
        },
    }
    );
  };




  private generateToken(user: any) {
    const payload = { 
      email: user.email, 
      sub: user._id, 
      role: user.role,
      restaurantId: user.restaurant,
    };
    return this.jwtService.sign(payload);
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }
}