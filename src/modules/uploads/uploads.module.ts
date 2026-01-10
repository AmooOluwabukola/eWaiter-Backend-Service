import { Module } from '@nestjs/common';
import { UploadService } from './uploads.service';
import { UploadsController } from './uploads.controller';
import { CloudinaryProvider } from 'src/config/cloudinary.config';

@Module({
  providers: [UploadService,CloudinaryProvider],
  controllers: [UploadsController],
  exports: [UploadService],

})
export class UploadsModule {}
