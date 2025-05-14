import { Controller, Get, Post, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { ReviewersService } from './reviewers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { ReviewerApplicationStatus } from './schemas/reviewer-application.schema';

@Controller('reviewers')
export class ReviewersController {
    constructor(private readonly reviewersService: ReviewersService) { }

    @UseGuards(JwtAuthGuard)
    @Post('apply')
    async applyAsReviewer(
        @Request() req,
        @Body() applicationData: {
            motivation: string;
            expertiseAreas: string[];
            yearsOfExperience: number;
            portfolioUrl?: string;
            linkedinUrl?: string;
            githubUrl?: string;
            resumeUrl?: string;
        },
    ) {
        return this.reviewersService.submitApplication(req.user.id, applicationData);
    }

    @UseGuards(JwtAuthGuard)
    @Get('application/my')
    async getMyApplication(@Request() req) {
        const applications = await this.reviewersService.getApplications();
        return applications.find(app => app.user._id.toString() === req.user.id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Get('applications')
    async getAllApplications(@Query('status') status?: ReviewerApplicationStatus) {
        return this.reviewersService.getApplications(status);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Get('application/:id')
    async getApplicationById(@Param('id') id: string) {
        return this.reviewersService.getApplicationById(id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Post('application/:id/review')
    async reviewApplication(
        @Request() req,
        @Param('id') id: string,
        @Body() reviewData: { approve: boolean; rejectionReason?: string },
    ) {
        return this.reviewersService.reviewApplication(
            id,
            req.user.id,
            reviewData.approve,
            reviewData.rejectionReason,
        );
    }

    @Get('active')
    async getActiveReviewers() {
        return this.reviewersService.getActiveReviewers();
    }

    @Get('expertise/:area')
    async getReviewersByExpertise(@Param('area') expertise: string) {
        return this.reviewersService.getReviewersByExpertise(expertise);
    }

    @Get('top')
    async getTopReviewers(@Query('limit') limit: number = 10) {
        return this.reviewersService.getTopReviewers(limit);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Post('stats/:id/update')
    async updateReviewerStats(
        @Param('id') id: string,
        @Body() updateData: {
            reviewDone: boolean;
            successful?: boolean;
            reputationChange?: number;
        },
    ) {
        return this.reviewersService.updateReviewerStats(id, updateData);
    }
} 