import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    UseGuards,
    Req,
    HttpCode,
    HttpStatus,
    Query,
    Patch
} from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreateUserDto, UpdateUserDto, UserResponseDto, ConnectWalletDto, UpdateReputationDto } from '../dto/user.dto';
import { Request } from 'express';
import { UserRole } from '../schemas/user.schema';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    async getCurrentUser(@Request() req) {
        return this.usersService.findById(req.user.userId);
    }

    @Get()
    async findAll() {
        return this.usersService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.usersService.findById(id);
    }

    @Get('role/:role')
    async findByRole(@Param('role') role: UserRole) {
        return this.usersService.findByRole(role);
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() updateUserDto: any) {
        return this.usersService.update(id, updateUserDto);
    }

    @Patch('profile')
    @UseGuards(JwtAuthGuard)
    async updateProfile(@Request() req, @Body() updateData: any) {
        return this.usersService.update(req.user.userId, updateData);
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    // In a production environment, you would add admin-only guard
    async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
        return this.usersService.create(createUserDto);
    }

    @Post('wallet')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async connectWallet(
        @Body() connectWalletDto: ConnectWalletDto,
        @Req() req: Request,
    ): Promise<UserResponseDto> {
        const userId = req.user['userId'];
        return this.usersService.connectWallet(userId, connectWalletDto);
    }

    @Post('reputation')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    // In a production environment, you would add validation to ensure only authorized users can update reputation
    async updateReputation(@Body() updateReputationDto: UpdateReputationDto): Promise<UserResponseDto> {
        return this.usersService.updateReputation(updateReputationDto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id') id: string, @Req() req: Request): Promise<void> {
        // Allow users to delete only their own profile, or admins can delete any
        if (req.user['userId'] !== id && req.user['role'] !== UserRole.CLIENT) {
            throw new Error('Unauthorized to delete this user');
        }
        return this.usersService.remove(id);
    }
} 