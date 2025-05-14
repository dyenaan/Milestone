import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRole } from '../../users/schemas/user.schema';

export class RegisterDto {
    @IsNotEmpty()
    @IsString()
    username: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    password: string;

    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole;

    readonly walletAddress?: string;
    readonly stellarPublicKey?: string;
}

export class LoginDto {
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    password: string;
}

export class SocialLoginDto {
    @IsNotEmpty()
    @IsString()
    provider: string;

    @IsNotEmpty()
    @IsString()
    token: string;

    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole;
}

export class TokenResponseDto {
    access_token: string;
    user: any;
}

export class JwtPayload {
    readonly userId: string;
    readonly email: string;
    readonly role: UserRole;
} 