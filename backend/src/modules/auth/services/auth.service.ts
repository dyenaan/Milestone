import { Injectable, UnauthorizedException, Logger, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../../users/schemas/user.schema';
import { RegisterDto, LoginDto, SocialLoginDto, TokenResponseDto, JwtPayload } from '../dto/auth.dto';
import { UsersService } from '../../users/services/users.service';
import { ConfigService } from '@nestjs/config';
import { AptosService } from '../../blockchain/services/aptos.service';
import { AptosLoginDto, AptosGoogleLoginDto, AptosAppleLoginDto } from '../dto/aptos-auth.dto';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        private jwtService: JwtService,
        private usersService: UsersService,
        private configService: ConfigService,
        private aptosService: AptosService
    ) { }

    /**
     * Register a new user
     */
    async register(registerDto: RegisterDto): Promise<TokenResponseDto> {
        // Check if user exists
        const userExists = await this.usersService.findByEmail(registerDto.email);
        if (userExists) {
            throw new ConflictException('User with this email already exists');
        }

        // Hash password
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(registerDto.password, salt);

        // Create user
        const newUser = await this.usersService.create({
            ...registerDto,
            password: hashedPassword
        });

        // Generate tokens
        const tokens = this.generateTokens(newUser);

        // Return response
        return {
            access_token: tokens.accessToken,
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                role: newUser.role,
                walletAddress: newUser.walletAddress,
                reputation: newUser.reputation || 0
            }
        };
    }

    /**
     * Login a user
     */
    async login(loginDto: LoginDto): Promise<TokenResponseDto> {
        const user = await this.usersService.findByEmail(loginDto.email);

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Generate tokens
        const tokens = this.generateTokens(user);

        return {
            access_token: tokens.accessToken,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                walletAddress: user.walletAddress,
                reputation: user.reputation || 0
            }
        };
    }

    /**
     * Handle social login
     */
    async socialLogin(socialLoginDto: SocialLoginDto): Promise<TokenResponseDto> {
        const { token, provider, role } = socialLoginDto;

        // In a real implementation, you would verify the token with the provider's API
        // Here, we'll assume the token is valid and extract user info
        // This is a mock implementation
        const mockUserId = Buffer.from(token).toString('hex').substring(0, 10);
        const mockUserEmail = `user_${mockUserId}@${provider}.com`;
        const mockUserName = `User ${mockUserId}`;

        // Find user by social provider ID or create a new one
        let user = await this.userModel.findOne({
            socialProviderId: mockUserId,
            socialProvider: provider,
        }).exec();

        if (!user) {
            // Create new user
            user = new this.userModel({
                email: mockUserEmail,
                name: mockUserName,
                role: role || UserRole.FREELANCER,
                socialProviderId: mockUserId,
                socialProvider: provider,
            });

            await user.save();
            this.logger.log(`New social user created: ${user.id}`);
        }

        // Generate JWT token
        return this.generateToken(user);
    }

    /**
     * Validate a user by JWT payload
     */
    async validateUser(payload: JwtPayload): Promise<User> {
        const user = await this.userModel.findById(payload.userId).exec();
        if (!user) {
            throw new UnauthorizedException('User not found');
        }
        return user;
    }

    /**
     * Generate JWT token
     */
    private generateToken(user: User): TokenResponseDto {
        const payload: JwtPayload = {
            userId: user.id,
            email: user.email,
            role: user.role,
        };

        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                walletAddress: user.walletAddress,
                stellarPublicKey: user.stellarPublicKey,
                reputation: user.reputation,
            },
        };
    }

    private generateTokens(user: any) {
        const payload = {
            sub: user._id,
            email: user.email,
            role: user.role
        };

        const accessToken = this.jwtService.sign(payload, {
            secret: this.configService.get<string>('JWT_SECRET'),
            expiresIn: this.configService.get<string>('JWT_EXPIRATION') || '1d'
        });

        return {
            accessToken
        };
    }

    /**
     * Hash a password
     */
    private async hashPassword(password: string): Promise<string> {
        const salt = await bcrypt.genSalt(10);
        return bcrypt.hash(password, salt);
    }

    /**
     * Compare a password with a hash
     */
    private async comparePasswords(password: string, hash: string): Promise<boolean> {
        return bcrypt.compare(password, hash);
    }

    /**
     * Login with Aptos wallet
     */
    async loginWithAptos(aptosLoginDto: AptosLoginDto): Promise<TokenResponseDto> {
        const { walletAddress, signedMessage, message, role } = aptosLoginDto;

        // Verify wallet ownership if signed message is provided
        if (signedMessage && message) {
            const isValid = await this.aptosService.verifyWalletOwnership(
                walletAddress,
                signedMessage,
                message
            );

            if (!isValid) {
                throw new UnauthorizedException('Invalid wallet signature');
            }
        }

        // Find user by wallet address or create a new one
        let user = await this.userModel.findOne({ walletAddress }).exec();

        if (!user) {
            // Create new user with wallet address
            user = new this.userModel({
                username: `aptos_${walletAddress.substring(0, 8)}`,
                email: `${walletAddress.substring(0, 8)}@aptos.user`,
                walletAddress,
                role: role || UserRole.FREELANCER,
                // Generate a random password since login will be wallet-based
                password: await bcrypt.hash(Math.random().toString(36), 10)
            });

            await user.save();
            this.logger.log(`New Aptos user created: ${user.id}`);
        }

        // Generate tokens
        const tokens = this.generateTokens(user);

        return {
            access_token: tokens.accessToken,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                walletAddress: user.walletAddress,
                reputation: user.reputation || 0
            }
        };
    }

    /**
     * Login with Google + Aptos wallet (Zero-knowledge proof)
     */
    async loginWithGoogleAptos(aptosGoogleLoginDto: AptosGoogleLoginDto): Promise<TokenResponseDto> {
        const { walletAddress, googleToken, role } = aptosGoogleLoginDto;

        // Verify Google token and ZK proof
        const isValid = await this.aptosService.verifyZkProofWithGoogle(googleToken, walletAddress);

        if (!isValid) {
            throw new UnauthorizedException('Invalid Google ZK proof');
        }

        // Find user by wallet address or create a new one
        let user = await this.userModel.findOne({ walletAddress }).exec();

        if (!user) {
            // Create new user with wallet address and Google auth
            user = new this.userModel({
                username: `google_aptos_${walletAddress.substring(0, 8)}`,
                email: `${walletAddress.substring(0, 8)}@google.aptos.user`,
                walletAddress,
                role: role || UserRole.FREELANCER,
                socialProvider: 'google',
                // Generate a random password since login will be wallet-based
                password: await bcrypt.hash(Math.random().toString(36), 10)
            });

            await user.save();
            this.logger.log(`New Google+Aptos user created: ${user.id}`);
        }

        // Generate tokens
        const tokens = this.generateTokens(user);

        return {
            access_token: tokens.accessToken,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                walletAddress: user.walletAddress,
                reputation: user.reputation || 0
            }
        };
    }

    /**
     * Login with Apple + Aptos wallet (Zero-knowledge proof)
     */
    async loginWithAppleAptos(aptosAppleLoginDto: AptosAppleLoginDto): Promise<TokenResponseDto> {
        const { walletAddress, appleToken, role } = aptosAppleLoginDto;

        // Verify Apple token and ZK proof
        const isValid = await this.aptosService.verifyZkProofWithApple(appleToken, walletAddress);

        if (!isValid) {
            throw new UnauthorizedException('Invalid Apple ZK proof');
        }

        // Find user by wallet address or create a new one
        let user = await this.userModel.findOne({ walletAddress }).exec();

        if (!user) {
            // Create new user with wallet address and Apple auth
            user = new this.userModel({
                username: `apple_aptos_${walletAddress.substring(0, 8)}`,
                email: `${walletAddress.substring(0, 8)}@apple.aptos.user`,
                walletAddress,
                role: role || UserRole.FREELANCER,
                socialProvider: 'apple',
                // Generate a random password since login will be wallet-based
                password: await bcrypt.hash(Math.random().toString(36), 10)
            });

            await user.save();
            this.logger.log(`New Apple+Aptos user created: ${user.id}`);
        }

        // Generate tokens
        const tokens = this.generateTokens(user);

        return {
            access_token: tokens.accessToken,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                walletAddress: user.walletAddress,
                reputation: user.reputation || 0
            }
        };
    }
} 