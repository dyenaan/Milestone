import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { AptosService } from './aptos.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateProjectDto } from './dto/create-project.dto';
import { AddMilestoneDto } from './dto/add-milestone.dto';
import { FundProjectDto } from './dto/fund-project.dto';
import { SubmitMilestoneDto } from './dto/submit-milestone.dto';
import { ReviewMilestoneDto } from './dto/review-milestone.dto';

@Controller('blockchain')
export class BlockchainController {
    constructor(private readonly aptosService: AptosService) { }

    @UseGuards(JwtAuthGuard)
    @Post('project')
    async createProject(@Body() createProjectDto: CreateProjectDto): Promise<{ txHash: string }> {
        const txHash = await this.aptosService.createProject(
            createProjectDto.clientAddress,
            createProjectDto.workerAddress,
            createProjectDto.deadline
        );
        return { txHash };
    }

    @UseGuards(JwtAuthGuard)
    @Post('project/:projectId/milestone')
    async addMilestone(
        @Param('projectId') projectId: number,
        @Body() addMilestoneDto: AddMilestoneDto
    ): Promise<{ txHash: string }> {
        const txHash = await this.aptosService.addMilestone(
            addMilestoneDto.clientAddress,
            projectId,
            addMilestoneDto.description,
            addMilestoneDto.amount,
            addMilestoneDto.deadline
        );
        return { txHash };
    }

    @UseGuards(JwtAuthGuard)
    @Post('project/:projectId/fund')
    async fundProject(
        @Param('projectId') projectId: number,
        @Body() fundProjectDto: FundProjectDto
    ): Promise<{ txHash: string }> {
        const txHash = await this.aptosService.fundProject(
            fundProjectDto.clientAddress,
            projectId,
            fundProjectDto.amount
        );
        return { txHash };
    }

    @UseGuards(JwtAuthGuard)
    @Post('project/:projectId/start')
    async startWork(
        @Param('projectId') projectId: number,
        @Body() body: { workerAddress: string }
    ): Promise<{ txHash: string }> {
        const txHash = await this.aptosService.startWork(
            body.workerAddress,
            projectId
        );
        return { txHash };
    }

    @UseGuards(JwtAuthGuard)
    @Post('project/:projectId/milestone/:milestoneId/submit')
    async submitMilestone(
        @Param('projectId') projectId: number,
        @Param('milestoneId') milestoneId: number,
        @Body() submitMilestoneDto: SubmitMilestoneDto
    ): Promise<{ txHash: string }> {
        const txHash = await this.aptosService.submitMilestone(
            submitMilestoneDto.workerAddress,
            projectId,
            milestoneId,
            submitMilestoneDto.evidence
        );
        return { txHash };
    }

    @UseGuards(JwtAuthGuard)
    @Post('reviewer/register')
    async registerAsReviewer(@Body() body: { reviewerAddress: string }): Promise<{ txHash: string }> {
        const txHash = await this.aptosService.registerAsReviewer(body.reviewerAddress);
        return { txHash };
    }

    @UseGuards(JwtAuthGuard)
    @Post('project/:projectId/milestone/:milestoneId/review')
    async reviewMilestone(
        @Param('projectId') projectId: number,
        @Param('milestoneId') milestoneId: number,
        @Body() reviewMilestoneDto: ReviewMilestoneDto
    ): Promise<{ txHash: string }> {
        const txHash = await this.aptosService.reviewMilestone(
            reviewMilestoneDto.reviewerAddress,
            projectId,
            milestoneId,
            reviewMilestoneDto.approved
        );
        return { txHash };
    }

    @UseGuards(JwtAuthGuard)
    @Post('project/:projectId/milestone/:milestoneId/complete')
    async completeMilestone(
        @Param('projectId') projectId: number,
        @Param('milestoneId') milestoneId: number
    ): Promise<{ txHash: string }> {
        const txHash = await this.aptosService.completeMilestone(
            projectId,
            milestoneId
        );
        return { txHash };
    }

    @UseGuards(JwtAuthGuard)
    @Post('project/:projectId/cancel')
    async cancelProject(
        @Param('projectId') projectId: number,
        @Body() body: { clientAddress: string }
    ): Promise<{ txHash: string }> {
        const txHash = await this.aptosService.cancelProject(
            body.clientAddress,
            projectId
        );
        return { txHash };
    }

    @Get('project/:projectId/status')
    async getProjectStatus(@Param('projectId') projectId: number): Promise<{ status: number }> {
        const status = await this.aptosService.getProjectStatus(projectId);
        return { status };
    }

    @Get('project/:projectId/milestone/:milestoneId/status')
    async getMilestoneStatus(
        @Param('projectId') projectId: number,
        @Param('milestoneId') milestoneId: number
    ): Promise<{ status: number }> {
        const status = await this.aptosService.getMilestoneStatus(projectId, milestoneId);
        return { status };
    }

    @Get('reviewer/:address')
    async isReviewer(@Param('address') address: string): Promise<{ isReviewer: boolean }> {
        const result = await this.aptosService.isReviewer(address);
        return { isReviewer: result };
    }
} 