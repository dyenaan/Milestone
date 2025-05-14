import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Get, Request } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { RegisterDto, LoginDto, SocialLoginDto, TokenResponseDto } from '../dto/auth.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { AptosLoginDto, AptosGoogleLoginDto, AptosAppleLoginDto } from '../dto/aptos-auth.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    async register(@Body() registerDto: RegisterDto): Promise<TokenResponseDto> {
        return this.authService.register(registerDto);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() loginDto: LoginDto): Promise<TokenResponseDto> {
        return this.authService.login(loginDto);
    }

    @Post('social')
    @HttpCode(HttpStatus.OK)
    async socialLogin(@Body() socialLoginDto: SocialLoginDto): Promise<TokenResponseDto> {
        return this.authService.socialLogin(socialLoginDto);
    }

    @Post('aptos')
    @HttpCode(HttpStatus.OK)
    async aptosLogin(@Body() aptosLoginDto: AptosLoginDto): Promise<TokenResponseDto> {
        return this.authService.loginWithAptos(aptosLoginDto);
    }

    @Post('aptos-google')
    @HttpCode(HttpStatus.OK)
    async aptosGoogleLogin(@Body() aptosGoogleLoginDto: AptosGoogleLoginDto): Promise<TokenResponseDto> {
        return this.authService.loginWithGoogleAptos(aptosGoogleLoginDto);
    }

    @Post('aptos-apple')
    @HttpCode(HttpStatus.OK)
    async aptosAppleLogin(@Body() aptosAppleLoginDto: AptosAppleLoginDto): Promise<TokenResponseDto> {
        return this.authService.loginWithAppleAptos(aptosAppleLoginDto);
    }

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    getProfile(@Request() req) {
        return req.user;
    }
} 