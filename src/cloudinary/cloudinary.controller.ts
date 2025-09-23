import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Auth } from '../auth/decorators/auth.decorator';
import { CloudinaryService } from './cloudinary.service';

@ApiTags('Cloudinary')
@Controller('cloudinary')
export class CloudinaryController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Get('signature')
  @ApiOperation({ summary: 'Get Cloudinary upload signature (timestamp + signature + api_key + cloud_name)' })
  @Auth()
  getSignature() {
    return this.cloudinaryService.getSignature();
  }
}
