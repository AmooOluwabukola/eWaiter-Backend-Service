
import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  UseGuards,
  
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiConsumes, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { UploadService} from './uploads.service';
import * as Multer from 'multer';
import { JwtAuthGuard } from '../auth/guards/jwt-guard';
import { RolesGuard } from '../auth/guards/role-guard';
import { Roles } from '../../common/decorators/role.decorator';
import { UserRole } from 'src/models/user.schema';
import { SuccessResponse } from 'src/utils/https';


@ApiTags('Uploads')
@Controller('uploads')
export class UploadsController {
    constructor(private readonly uploadService: UploadService) {}
    @Post('image')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.RESTAURANT_ADMIN || UserRole.SUPER_ADMIN || UserRole.KITCHEN_STAFF || UserRole.ATTENDANT)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async uploadImage(@UploadedFile() file: Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

 const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Only image files are allowed');
    }

    const result = await this.uploadService.uploadImage(file);
    
    return new SuccessResponse('Image uploaded successfully', {
      url: result.secure_url,
      publicId: result.public_id,
    })
     
   
  }
}

