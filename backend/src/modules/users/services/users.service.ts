import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserRole } from '../schemas/user.schema';
import { CreateUserDto, UpdateUserDto, ConnectWalletDto, UpdateReputationDto } from '../dto/user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name);

    constructor(@InjectModel(User.name) private userModel: Model<User>) { }

    /**
     * Find all users
     */
    async findAll(): Promise<User[]> {
        return this.userModel.find().exec();
    }

    /**
     * Find users by role
     */
    async findByRole(role: UserRole): Promise<User[]> {
        return this.userModel.find({ role }).exec();
    }

    /**
     * Find a user by ID
     */
    async findById(id: string): Promise<User> {
        const user = await this.userModel.findById(id);
        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }

    /**
     * Find a user by email
     */
    async findByEmail(email: string): Promise<User> {
        const user = await this.userModel.findOne({ email }).exec();
        if (!user) {
            throw new NotFoundException(`User with email ${email} not found`);
        }
        return user;
    }

    /**
     * Find a user by username
     */
    async findByUsername(username: string): Promise<User> {
        const user = await this.userModel.findOne({ username }).exec();
        if (!user) {
            throw new NotFoundException(`User with username ${username} not found`);
        }
        return user;
    }

    /**
     * Create a new user
     */
    async create(userData: any): Promise<User> {
        const newUser = new this.userModel(userData);
        return newUser.save();
    }

    /**
     * Update a user
     */
    async update(id: string, userData: any): Promise<User> {
        this.logger.log(`Updating user with ID: ${id}`);

        const user = await this.userModel.findById(id);
        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        // Hash password if it's being updated
        if (userData.password) {
            const salt = await bcrypt.genSalt();
            userData.password = await bcrypt.hash(userData.password, salt);
        }

        return this.userModel.findByIdAndUpdate(id, userData, { new: true }).exec();
    }

    /**
     * Connect a wallet address to a user
     */
    async connectWallet(userId: string, connectWalletDto: ConnectWalletDto): Promise<User> {
        this.logger.log(`Connecting wallet ${connectWalletDto.walletAddress} to user ${userId}`);

        const user = await this.userModel.findByIdAndUpdate(
            userId,
            {
                walletAddress: connectWalletDto.walletAddress,
                stellarPublicKey: connectWalletDto.stellarPublicKey,
            },
            { new: true },
        ).exec();

        if (!user) {
            throw new NotFoundException(`User with ID ${userId} not found`);
        }

        return user;
    }

    /**
     * Update user reputation
     */
    async updateReputation(updateReputationDto: UpdateReputationDto): Promise<User> {
        const { userId, change, reason } = updateReputationDto;
        this.logger.log(`Updating reputation for user ${userId} by ${change} for reason: ${reason}`);

        const user = await this.userModel.findById(userId).exec();
        if (!user) {
            throw new NotFoundException(`User with ID ${userId} not found`);
        }

        user.reputation += change;

        return user.save();
    }

    /**
     * Delete a user
     */
    async remove(id: string): Promise<void> {
        this.logger.log(`Removing user with ID: ${id}`);

        const result = await this.userModel.deleteOne({ _id: id }).exec();
        if (result.deletedCount === 0) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
    }
} 