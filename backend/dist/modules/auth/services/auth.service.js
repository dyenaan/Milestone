"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const bcrypt = __importStar(require("bcrypt"));
const user_schema_1 = require("../../users/schemas/user.schema");
const users_service_1 = require("../../users/services/users.service");
const config_1 = require("@nestjs/config");
const aptos_service_1 = require("../../blockchain/services/aptos.service");
let AuthService = AuthService_1 = class AuthService {
    constructor(userModel, jwtService, usersService, configService, aptosService) {
        this.userModel = userModel;
        this.jwtService = jwtService;
        this.usersService = usersService;
        this.configService = configService;
        this.aptosService = aptosService;
        this.logger = new common_1.Logger(AuthService_1.name);
    }
    async register(registerDto) {
        const userExists = await this.usersService.findByEmail(registerDto.email);
        if (userExists) {
            throw new common_1.ConflictException('User with this email already exists');
        }
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(registerDto.password, salt);
        const newUser = await this.usersService.create(Object.assign(Object.assign({}, registerDto), { password: hashedPassword }));
        const tokens = this.generateTokens(newUser);
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
    async login(loginDto) {
        const user = await this.usersService.findByEmail(loginDto.email);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
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
    async socialLogin(socialLoginDto) {
        const { token, provider, role } = socialLoginDto;
        const mockUserId = Buffer.from(token).toString('hex').substring(0, 10);
        const mockUserEmail = `user_${mockUserId}@${provider}.com`;
        const mockUserName = `User ${mockUserId}`;
        let user = await this.userModel.findOne({
            socialProviderId: mockUserId,
            socialProvider: provider,
        }).exec();
        if (!user) {
            user = new this.userModel({
                email: mockUserEmail,
                name: mockUserName,
                role: role || user_schema_1.UserRole.FREELANCER,
                socialProviderId: mockUserId,
                socialProvider: provider,
            });
            await user.save();
            this.logger.log(`New social user created: ${user.id}`);
        }
        return this.generateToken(user);
    }
    async validateUser(payload) {
        const user = await this.userModel.findById(payload.userId).exec();
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        return user;
    }
    generateToken(user) {
        const payload = {
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
    generateTokens(user) {
        const payload = {
            sub: user._id,
            email: user.email,
            role: user.role
        };
        const accessToken = this.jwtService.sign(payload, {
            secret: this.configService.get('JWT_SECRET'),
            expiresIn: this.configService.get('JWT_EXPIRATION') || '1d'
        });
        return {
            accessToken
        };
    }
    async hashPassword(password) {
        const salt = await bcrypt.genSalt(10);
        return bcrypt.hash(password, salt);
    }
    async comparePasswords(password, hash) {
        return bcrypt.compare(password, hash);
    }
    async loginWithAptos(aptosLoginDto) {
        const { walletAddress, signedMessage, message, role } = aptosLoginDto;
        if (signedMessage && message) {
            const isValid = await this.aptosService.verifyWalletOwnership(walletAddress, signedMessage, message);
            if (!isValid) {
                throw new common_1.UnauthorizedException('Invalid wallet signature');
            }
        }
        let user = await this.userModel.findOne({ walletAddress }).exec();
        if (!user) {
            user = new this.userModel({
                username: `aptos_${walletAddress.substring(0, 8)}`,
                email: `${walletAddress.substring(0, 8)}@aptos.user`,
                walletAddress,
                role: role || user_schema_1.UserRole.FREELANCER,
                password: await bcrypt.hash(Math.random().toString(36), 10)
            });
            await user.save();
            this.logger.log(`New Aptos user created: ${user.id}`);
        }
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
    async loginWithGoogleAptos(aptosGoogleLoginDto) {
        const { walletAddress, googleToken, role } = aptosGoogleLoginDto;
        const isValid = await this.aptosService.verifyZkProofWithGoogle(googleToken, walletAddress);
        if (!isValid) {
            throw new common_1.UnauthorizedException('Invalid Google ZK proof');
        }
        let user = await this.userModel.findOne({ walletAddress }).exec();
        if (!user) {
            user = new this.userModel({
                username: `google_aptos_${walletAddress.substring(0, 8)}`,
                email: `${walletAddress.substring(0, 8)}@google.aptos.user`,
                walletAddress,
                role: role || user_schema_1.UserRole.FREELANCER,
                socialProvider: 'google',
                password: await bcrypt.hash(Math.random().toString(36), 10)
            });
            await user.save();
            this.logger.log(`New Google+Aptos user created: ${user.id}`);
        }
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
    async loginWithAppleAptos(aptosAppleLoginDto) {
        const { walletAddress, appleToken, role } = aptosAppleLoginDto;
        const isValid = await this.aptosService.verifyZkProofWithApple(appleToken, walletAddress);
        if (!isValid) {
            throw new common_1.UnauthorizedException('Invalid Apple ZK proof');
        }
        let user = await this.userModel.findOne({ walletAddress }).exec();
        if (!user) {
            user = new this.userModel({
                username: `apple_aptos_${walletAddress.substring(0, 8)}`,
                email: `${walletAddress.substring(0, 8)}@apple.aptos.user`,
                walletAddress,
                role: role || user_schema_1.UserRole.FREELANCER,
                socialProvider: 'apple',
                password: await bcrypt.hash(Math.random().toString(36), 10)
            });
            await user.save();
            this.logger.log(`New Apple+Aptos user created: ${user.id}`);
        }
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
};
AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        jwt_1.JwtService,
        users_service_1.UsersService,
        config_1.ConfigService,
        aptos_service_1.AptosService])
], AuthService);
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map