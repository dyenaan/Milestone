import { Model } from 'mongoose';
import { User, UserRole } from '../schemas/user.schema';
import { ConnectWalletDto, UpdateReputationDto } from '../dto/user.dto';
export declare class UsersService {
    private userModel;
    private readonly logger;
    constructor(userModel: Model<User>);
    findAll(): Promise<User[]>;
    findByRole(role: UserRole): Promise<User[]>;
    findById(id: string): Promise<User>;
    findByEmail(email: string): Promise<User>;
    findByUsername(username: string): Promise<User>;
    create(userData: any): Promise<User>;
    update(id: string, userData: any): Promise<User>;
    connectWallet(userId: string, connectWalletDto: ConnectWalletDto): Promise<User>;
    updateReputation(updateReputationDto: UpdateReputationDto): Promise<User>;
    remove(id: string): Promise<void>;
}
