import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RestaurantsService } from '../restaurants/restaurants.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UserRole } from 'src/models/user.schema';
import { SuccessResponse } from 'src/utils/https';
import { EmailService } from '../email/email.service';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private emailService: EmailService,
    private restaurantsService: RestaurantsService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<SuccessResponse> {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    try {
      const restaurant = await this.restaurantsService.create({
        name: registerDto.restaurantName,
        email: registerDto.email,
      });

      const hashedPassword = await bcrypt.hash(registerDto.password, 10);

      const verificationToken = crypto.randomBytes(32).toString('hex');
      const verificationExpires = new Date();
      verificationExpires.setHours(verificationExpires.getHours() + 24);

      const user = await this.usersService.create(
        {
          name: registerDto.name,
          email: registerDto.email,
          password: hashedPassword,
          role: UserRole.RESTAURANT_ADMIN,
          isEmailVerified: false,
          emailVerificationToken: verificationToken,
          emailVerificationExpires: verificationExpires,
          isActive: true,
        },
        restaurant._id,
      );

      await this.restaurantsService.setOwner(restaurant._id, user._id);

      await this.emailService.sendVerificationEmail(
        user.email,
        user.name,
        verificationToken,
      );

      return new SuccessResponse(
        'Registration successful. Please check your email to verify your account.',
        {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
          },
        },
      );
    } catch (error) {

      if (error.code === 11000) {
        throw new ConflictException(
          'A restaurant with a similar name already exists. Please choose a different name.',
        );
      }

      throw error;
    }
  }

  async verifyEmail(token: string): Promise<SuccessResponse> {
    const user = await this.usersService.findByVerificationToken(token);

    if (!user) {
      throw new UnauthorizedException('Invalid or expired verification token');
    }

    if (!user.emailVerificationExpires || user.emailVerificationExpires < new Date()) {
      throw new UnauthorizedException(
        'Verification token has expired. Please request a new one.',
      );
    }

    await this.usersService.update(user._id.toString(), {
      isEmailVerified: true,
      emailVerificationToken: undefined,
      emailVerificationExpires: undefined,
    });
await this.emailService.sendWelcomeEmail(
  user.email,
  user.name,
  (user.restaurant as any)?.name ?? 'your restaurant',
);
    return new SuccessResponse('Email verified successfully. You can now log in.', {});
  }

  async resendVerificationEmail(email: string): Promise<SuccessResponse> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      // Don't reveal if user exists for security
      return new SuccessResponse(
        'If an account exists with this email, a verification link has been sent.',{}
      );
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date();
    verificationExpires.setHours(verificationExpires.getHours() + 24);

    await this.usersService.update(user._id.toString(), {
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
    });

    await this.emailService.sendVerificationEmail(
      user.email,
      user.name,
      verificationToken,
    );

    return new SuccessResponse(
      'If an account exists with this email, a verification link has been sent.',{}
    );
  }

  async login(loginDto: LoginDto): Promise<SuccessResponse> {
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isEmailVerified) {
      throw new UnauthorizedException(
        'Please verify your email before logging in. Check your inbox for the verification link.',
      );
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    const token = this.generateToken(user);

    let restaurantData;
    if (user.restaurant) {
      try {
        const restaurant = await this.restaurantsService.findById(
          user.restaurant.toString(),
        );
        restaurantData = {
          id: restaurant._id,
          name: restaurant.name,
          slug: restaurant.slug,
        };
      } catch (error) {
        console.error('Failed to fetch restaurant:', error);
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
    });
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<SuccessResponse> {
    const user = await this.usersService.findByEmail(forgotPasswordDto.email);

    // Always return success to prevent email enumeration
    if (!user) {
      return new SuccessResponse(
        'If an account exists with this email, a password reset link has been sent.',{}
      );
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date();
    resetExpires.setHours(resetExpires.getHours() + 1); // 1 hour expiry

    await this.usersService.update(user._id.toString(), {
      passwordResetToken: resetToken,
      passwordResetExpires: resetExpires,
    });

    await this.emailService.sendPasswordResetEmail(
      user.email,
      user.name,
      resetToken,
    );

    return new SuccessResponse(
      'If an account exists with this email, a password reset link has been sent.',{}
    );
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<SuccessResponse> {
    const user = await this.usersService.findByPasswordResetToken(
      resetPasswordDto.token,
    );

    if (!user) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    if (!user.passwordResetExpires || user.passwordResetExpires < new Date()) {
      throw new UnauthorizedException(
        'Reset token has expired. Please request a new password reset.',
      );
    }

    const hashedPassword = await bcrypt.hash(resetPasswordDto.newPassword, 10);

    await this.usersService.update(user._id.toString(), {
      password: hashedPassword,
      passwordResetToken: undefined,
      passwordResetExpires: undefined,
    });

    return new SuccessResponse(
      'Password reset successful. You can now log in with your new password.',{}
    );
  }

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
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password: _, ...result } = user;
      return result;
    }
    return null;
  }
}