import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { RegisterDto, LoginDto, SocialLoginDto, TokenResponseDto, JwtPayload } from '../dto/auth.dto';
import { UsersService } from '../../users/services/users.service';
import { ConfigService } from '@nestjs/config';
import { AptosService } from '../../blockchain/services/aptos.service';
import { AptosLoginDto, AptosGoogleLoginDto, AptosAppleLoginDto } from '../dto/aptos-auth.dto';
export declare class AuthService {
    private userModel;
    private jwtService;
    private usersService;
    private configService;
    private aptosService;
    private readonly logger;
    constructor(userModel: Model<User>, jwtService: JwtService, usersService: UsersService, configService: ConfigService, aptosService: AptosService);
    register(registerDto: RegisterDto): Promise<TokenResponseDto>;
    login(loginDto: LoginDto): Promise<TokenResponseDto>;
    socialLogin(socialLoginDto: SocialLoginDto): Promise<TokenResponseDto>;
    validateUser(payload: JwtPayload): Promise<User>;
    private generateToken;
    private generateTokens;
    private hashPassword;
    private comparePasswords;
    loginWithAptos(aptosLoginDto: AptosLoginDto): Promise<TokenResponseDto>;
    loginWithGoogleAptos(aptosGoogleLoginDto: AptosGoogleLoginDto): Promise<TokenResponseDto>;
    loginWithAppleAptos(aptosAppleLoginDto: AptosAppleLoginDto): Promise<TokenResponseDto>;
}
