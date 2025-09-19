import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as crypto from 'crypto';
import { envs } from '../config';

@Injectable()
export class CloudinaryService {
  getSignature() {
    const secret = envs.CLOUDINARY_API_SECRET;
    const apiKey = envs.CLOUDINARY_API_KEY;
    const cloudName = envs.CLOUDINARY_CLOUD_NAME;

    if (!secret || !apiKey || !cloudName) {
      throw new InternalServerErrorException('Cloudinary env vars not configured');
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const toSign = `timestamp=${timestamp}${secret}`;
    const signature = crypto.createHash('sha1').update(toSign).digest('hex');

    return { timestamp, signature, api_key: apiKey, cloud_name: cloudName };
  }
}
