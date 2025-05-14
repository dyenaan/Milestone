import { UsersService } from '../services/users.service';
import { CreateUserDto, UserResponseDto, ConnectWalletDto, UpdateReputationDto } from '../dto/user.dto';
import { Request } from 'express';
import { UserRole } from '../schemas/user.schema';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getCurrentUser(req: any): Promise<import("../schemas/user.schema").User>;
    findAll(): Promise<import("../schemas/user.schema").User[]>;
    findOne(id: string): Promise<import("../schemas/user.schema").User>;
    findByRole(role: UserRole): Promise<import("../schemas/user.schema").User[]>;
    update(id: string, updateUserDto: any): Promise<import("../schemas/user.schema").User>;
    updateProfile(req: any, updateData: any): Promise<import("../schemas/user.schema").User>;
    create(createUserDto: CreateUserDto): Promise<UserResponseDto>;
    connectWallet(connectWalletDto: ConnectWalletDto, req: Request): Promise<UserResponseDto>;
    updateReputation(updateReputationDto: UpdateReputationDto): Promise<UserResponseDto>;
    remove(id: string, req: Request): Promise<void>;
}
