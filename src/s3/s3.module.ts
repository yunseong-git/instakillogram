import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { S3Service } from './s3.service';
import { ConfigService } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';

@Module({
  providers: [
    {
      provide: 'S3_CLIENT',
      useFactory: (configService: ConfigService) => {
        const accessKeyId = configService.get<string>('AWS_ACCESS_KEY');
        const secretAccessKey = configService.get<string>('AWS_SECRET_KEY');
        const region = configService.get<string>('AWS_REGION');

        if (!accessKeyId || !secretAccessKey || !region) {
          throw new Error('Missing AWS credentials or region in .env');
        }
        return new S3Client({ region, credentials: { accessKeyId, secretAccessKey } });
      },
      inject: [ConfigService],
    },
    S3Service,
  ],
  imports: [
    MulterModule.register({
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  ],
})
export class S3Module { }
