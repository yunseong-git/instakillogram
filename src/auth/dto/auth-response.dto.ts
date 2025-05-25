export type JwtPayload = {
    userId: number;
    nickname: string;
    exp?: number;
}

export class AllTokenResponse {
    accessToken: string;
    refreshToken: String;
}

export class TokenResponse {
    accessToken: string;
}
