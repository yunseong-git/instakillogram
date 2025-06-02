import {
    PutObjectCommand,
    DeleteObjectCommand,
    DeleteObjectsCommand,
    S3Client,
    GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuid } from 'uuid';
import { PresignedUploadResult } from './s3.type';
import { UserQueryService } from 'src/users/service/user-query.service';

@Injectable()
export class S3Service {
    private readonly bucket: string;
    constructor(
        @Inject('S3_CLIENT') private readonly s3: S3Client,
        private readonly configService: ConfigService,
        private readonly userQueryService: UserQueryService,
    ) {
        const bucket = this.configService.get<string>('AWS_BUCKET_NAME');
        if (!bucket) throw new Error('Missing AWS_BUCKET_NAME in .env');
        this.bucket = bucket;
    }


    async getUploadUrlWithThumb(originalName: string, userId: number, storyId?: number) {
        let key: string;
        if (originalName = 'profile.webP') {
            key = `uploads/${userId}/${uuid()}/${originalName}`;
        } else key = `uploads/${userId}/${originalName}`;

        const original = await this.getUploadUrl(key);
        const thumbKey = original.key.replace('uploads/', 'uploads/thumbs/');
        const thumb = await this.getUploadUrl(thumbKey);

        return { original, thumb };
    }

    /**단일 presigned URL 발급 */
    async getUploadUrl(key: string): Promise<PresignedUploadResult> {
        const command = new PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            ContentType: 'image/webP',
        });

        const url = await getSignedUrl(this.s3, command, { expiresIn: 300 });
        return { url, key };
    }




    /**<for download> url 발급 */
    async getDownloadPresignedUrl(key: string): Promise<string> {
        const command = new GetObjectCommand({
            Bucket: this.bucket,
            Key: key,
        });

        
        return await getSignedUrl(this.s3, command, { expiresIn: 300 });
    }

    /**<단일> S3 내부 파일삭제 */
    async deleteFile(key: string): Promise<void> {
        try {
            const command = new DeleteObjectCommand({ Bucket: this.bucket, Key: key });
            await this.s3.send(command);
        } catch (error) {
            throw new InternalServerErrorException('S3 삭제 실패');
        }
    }

    /**<썸네일포함> S3 내부 파일삭제 */
    async deleteMultiple(originKey: string): Promise<void> {
        const keys = this.getMultipleKeys(originKey);
        try {
            await this.s3.send(new DeleteObjectsCommand({
                Bucket: this.bucket,
                Delete: { Objects: keys }
            }));
        } catch (error) {
            throw new InternalServerErrorException('S3 다중 삭제 실패');
        }
    }

    /**S3 내부 파일삭제 */
    getMultipleKeys(originKey: string) {
        const thumbKey = originKey.replace('uploads/', 'uploads/thumbs/');
        const keys = [
            { Key: originKey },
            { Key: thumbKey },
        ];

        return keys;
    }

    /**for CDN */
    getPublicUrl(key: string): string {
        const cdnDomain = this.configService.get<string>('CDN_DOMAIN');
        if (!cdnDomain) throw new Error('Missing CDN_DOMAIN in .env');
        return `${cdnDomain}/${key}`;
    }
}