import { UserRole } from '../../users/schemas/user.schema';
export declare class RegisterDto {
    username: string;
    email: string;
    password: string;
    role?: UserRole;
    readonly walletAddress?: string;
    readonly stellarPublicKey?: string;
}
export declare class LoginDto {
    email: string;
    password: string;
}
export declare class SocialLoginDto {
    provider: string;
    token: string;
    role?: UserRole;
}
export declare class TokenResponseDto {
    access_token: string;
    user: any;
}
export declare class JwtPayload {
    readonly userId: string;
    readonly email: string;
    readonly role: UserRole;
}
