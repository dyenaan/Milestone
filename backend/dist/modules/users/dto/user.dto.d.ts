import { UserRole } from '../schemas/user.schema';
export declare class CreateUserDto {
    readonly name: string;
    readonly email: string;
    readonly password?: string;
    readonly role?: UserRole;
    readonly walletAddress?: string;
    readonly stellarPublicKey?: string;
    readonly socialProviderId?: string;
    readonly socialProvider?: string;
    readonly skills?: Record<string, number>;
}
export declare class UpdateUserDto {
    readonly name?: string;
    readonly email?: string;
    readonly password?: string;
    readonly role?: UserRole;
    readonly walletAddress?: string;
    readonly stellarPublicKey?: string;
    readonly socialProviderId?: string;
    readonly socialProvider?: string;
    readonly skills?: Record<string, number>;
}
export declare class ConnectWalletDto {
    readonly walletAddress: string;
    readonly stellarPublicKey?: string;
}
export declare class UpdateReputationDto {
    readonly userId: string;
    readonly change: number;
    readonly reason: string;
}
export declare class UserResponseDto {
    readonly id: string;
    readonly name: string;
    readonly email: string;
    readonly role: UserRole;
    readonly walletAddress?: string;
    readonly stellarPublicKey?: string;
    readonly reputation: number;
    readonly skills: Record<string, number>;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
