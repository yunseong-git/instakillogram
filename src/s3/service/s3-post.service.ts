import {
    PutObjectCommand,
    DeleteObjectCommand,
    S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuid } from 'uuid';

@Injectable()
export class S3Service {
    private readonly bucket: string;
    constructor(
        @Inject('S3_CLIENT') private readonly s3: S3Client,
        private readonly configService: ConfigService,
    ) {
        const bucket = this.configService.get<string>('AWS_BUCKET_NAME');
        if (!bucket) throw new Error('Missing AWS_BUCKET_NAME in .env');
        this.bucket = bucket;
    }

    async uploadFile(file: Express.Multer.File): Promise<string> {
        const key = `uploads/${uuid()}-${file.originalname}`;

        const command = new PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
        });

        await this.s3.send(command);
        return key;
    }

    async getPresignedUrl(key: string): Promise<string> {
        const command = new PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
        });

        return await getSignedUrl(this.s3, command, { expiresIn: 60 });
    }

    async deleteFile(key: string): Promise<void> {
        const command = new DeleteObjectCommand({
            Bucket: this.bucket,
            Key: key,
        });

        await this.s3.send(command);
    }
}