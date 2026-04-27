import { User, UserProfile } from "@generated/prisma";

export interface CustomTokenPayload {
    sub: string; // user ID
    email: string;
    tokenType: 'access' | 'refresh';
    iat: number;
    exp: number;
}

export interface TokenResponse {
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: number;
    user: User & {
        profile: UserProfile | null
    }
}
