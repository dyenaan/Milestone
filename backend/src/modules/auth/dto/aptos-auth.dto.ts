import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { UserRole } from '../../users/schemas/user.schema';

export class AptosLoginDto {
    @IsNotEmpty()
    @IsString()
    walletAddress: string;

    @IsOptional()
    @IsString()
    signedMessage?: string;

    @IsOptional()
    @IsString()
    message?: string;

    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole;
}

export class AptosGoogleLoginDto {
    @IsNotEmpty()
    @IsString()
    walletAddress: string;

    @IsNotEmpty()
    @IsString()
    googleToken: string;

    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole;
}

export class AptosAppleLoginDto {
    @IsNotEmpty()
    @IsString()
    walletAddress: string;

    @IsNotEmpty()
    @IsString()
    appleToken: string;

    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole;
} 