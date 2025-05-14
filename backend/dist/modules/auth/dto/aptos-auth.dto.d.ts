import { UserRole } from '../../users/schemas/user.schema';
export declare class AptosLoginDto {
    walletAddress: string;
    signedMessage?: string;
    message?: string;
    role?: UserRole;
}
export declare class AptosGoogleLoginDto {
    walletAddress: string;
    googleToken: string;
    role?: UserRole;
}
export declare class AptosAppleLoginDto {
    walletAddress: string;
    appleToken: string;
    role?: UserRole;
}
