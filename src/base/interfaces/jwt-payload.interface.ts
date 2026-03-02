import { User, UserTypeEnum } from "@prisma/client";
import { UserProfileType } from "@src/modules/user/user/fields";

export interface CustomTokenPayload {
    sub: number; // user ID
    email: string;
    type: UserTypeEnum;
    tokenType: 'access' | 'refresh';
    iat: number;
    exp: number;
}

export interface TokenResponse {
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: number;
    user: UserProfileType
}
