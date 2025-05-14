import { AuthService } from '../services/auth.service';
import { RegisterDto, LoginDto, SocialLoginDto, TokenResponseDto } from '../dto/auth.dto';
import { AptosLoginDto, AptosGoogleLoginDto, AptosAppleLoginDto } from '../dto/aptos-auth.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<TokenResponseDto>;
    login(loginDto: LoginDto): Promise<TokenResponseDto>;
    socialLogin(socialLoginDto: SocialLoginDto): Promise<TokenResponseDto>;
    aptosLogin(aptosLoginDto: AptosLoginDto): Promise<TokenResponseDto>;
    aptosGoogleLogin(aptosGoogleLoginDto: AptosGoogleLoginDto): Promise<TokenResponseDto>;
    aptosAppleLogin(aptosAppleLoginDto: AptosAppleLoginDto): Promise<TokenResponseDto>;
    getProfile(req: any): any;
}
