import { Controller, Get, Post, Body, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { NotificationsService } from '../services/notifications.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreateNotificationDto, NotificationResponseDto } from '../dto/notification.dto';
import { Request } from 'express';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @Get()
    async findAll(@Req() req: Request): Promise<NotificationResponseDto[]> {
        const userId = req.user['userId'];
        return this.notificationsService.findAllForUser(userId);
    }

    @Get('unread')
    async findUnread(@Req() req: Request): Promise<NotificationResponseDto[]> {
        const userId = req.user['userId'];
        return this.notificationsService.findUnreadForUser(userId);
    }

    @Post(':id/read')
    async markAsRead(@Param('id') id: string): Promise<NotificationResponseDto> {
        return this.notificationsService.markAsRead(id);
    }

    @Post('read-all')
    async markAllAsRead(@Req() req: Request): Promise<void> {
        const userId = req.user['userId'];
        await this.notificationsService.markAllAsRead(userId);
    }

    @Delete(':id')
    async remove(@Param('id') id: string): Promise<void> {
        await this.notificationsService.delete(id);
    }

    // Admin endpoint for testing - would be removed or secured in production
    @Post()
    @UseGuards(JwtAuthGuard) // Add more specific admin guard in production
    async create(@Body() createNotificationDto: CreateNotificationDto): Promise<NotificationResponseDto> {
        return this.notificationsService.create(createNotificationDto);
    }
} 