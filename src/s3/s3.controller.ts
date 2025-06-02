import { Body, Controller, Delete, Get, Param, Post } from "@nestjs/common";
import { S3Service } from "./s3.service";
import { ProfileUrlDto } from "./s3.dto";
import { User } from "src/common/decorators/user.decorator";

@Controller('s3')
export class S3Controller {
    constructor(
        private readonly s3Service: S3Service,
    ) { }
    /**profile upload flow
     * 1. 클라이언트는 썸네일+이미지 webP 변환작업 후 서버로 url 요청
     * 2. 서버는 getUploadUrl로 2개의 presignedUrl 반환(originkey:profile/:userId)
     * 2-p. 프로필의 경우에는 유저 생성시 키값을 생성하고 s3에서 덮어쓰기를 사용하기 때문에, userId로 profile key값을 가져와서 url생성 후 반환
     * 3. 클라이언트는 해당 url로 s3에 데이터 저장 후 서버로 업로드 완료 요청
     * 4. 서버는 DB의 profileVersion 수정 후 2개의 pulicUrl 반환
     * //
     */

    /**delete flow
     * 1. 클라이언트는 해당 이미지의 key값과 user의 payload를 검증하여 해당 유저 데이터인지 확인 후 서버로 삭제 요청 전달
     * 2. 서버도 2중으로 해당 유저가 맞는지 검증 후, s3에 삭제 요청+DB의 key값 삭제
     * 2-1. 프로필의 경우에는 덮어쓰기로 진행하기 때문에 key값을 삭제 하지 않고 s3에서만 삭제
     */

    //download(read)의 경우에는 CDN 주소로 클라이언트가 자체 처리

    //<for profile> presigned url 반환
    @Get('profile/upload')
    async getProfileUploadUrl(@User('userId') userId: number) {
        const originalName = 'profile.webP'
        return this.s3Service.getUploadUrlWithThumb(originalName, userId);
    }

    //<for story> presigned url 반환
    @Get('story/upload')
    async getPostUploadUrl(@User('userId') userId: number, @Param() storyId: number) {
        const originalName = 'story.webP'
        return this.s3Service.getUploadUrlWithThumb(originalName, userId, storyId);
    }
}