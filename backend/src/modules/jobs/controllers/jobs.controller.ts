import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Param,
    Body,
    Query,
    UseGuards,
    Req,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { JobsService } from '../services/jobs.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { JobStatus } from '../schemas/job.schema';
import {
    CreateJobDto,
    UpdateJobDto,
    JobResponseDto,
    CreateMilestoneDto,
    UpdateMilestoneDto,
    SubmitMilestoneDto,
    AssignReviewersDto,
    VoteMilestoneDto,
    ReleaseMilestoneDto,
} from '../dto/job.dto';
import { Request } from 'express';
import { UserRole } from '../../users/schemas/user.schema';
import { JobMapper } from '../mappers/job.mapper';

@Controller('jobs')
export class JobsController {
    constructor(private readonly jobsService: JobsService) { }

    @Get()
    async findAll(
        @Query('status') status?: JobStatus,
        @Query('skills') skills?: string,
    ): Promise<JobResponseDto[]> {
        const skillsArray = skills ? skills.split(',') : undefined;
        const jobs = await this.jobsService.findAll(status, skillsArray);
        return JobMapper.toDtoList(jobs);
    }

    @Get('client')
    @UseGuards(JwtAuthGuard)
    async findByClient(@Req() req: Request): Promise<JobResponseDto[]> {
        const clientId = req.user['userId'];
        const jobs = await this.jobsService.findByClient(clientId);
        return JobMapper.toDtoList(jobs);
    }

    @Get('freelancer')
    @UseGuards(JwtAuthGuard)
    async findByFreelancer(@Req() req: Request): Promise<JobResponseDto[]> {
        const freelancerId = req.user['userId'];
        const jobs = await this.jobsService.findByFreelancer(freelancerId);
        return JobMapper.toDtoList(jobs);
    }

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<JobResponseDto> {
        const job = await this.jobsService.findById(id);
        return JobMapper.toDto(job);
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createJobDto: CreateJobDto, @Req() req: Request): Promise<JobResponseDto> {
        const clientId = req.user['userId'];
        const role = req.user['role'];

        if (role !== UserRole.CLIENT) {
            throw new Error('Only clients can create jobs');
        }

        const job = await this.jobsService.create(createJobDto, clientId);
        return JobMapper.toDto(job);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    async update(
        @Param('id') id: string,
        @Body() updateJobDto: UpdateJobDto,
        @Req() req: Request,
    ): Promise<JobResponseDto> {
        const userId = req.user['userId'];
        const role = req.user['role'];

        // Verify ownership or admin role
        const job = await this.jobsService.findById(id);

        if (job.client.toString() !== userId && role !== UserRole.CLIENT) {
            throw new Error('Unauthorized to update this job');
        }

        const updatedJob = await this.jobsService.update(id, updateJobDto);
        return JobMapper.toDto(updatedJob);
    }

    @Post('milestone')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.CREATED)
    async addMilestone(
        @Body() createMilestoneDto: CreateMilestoneDto,
        @Req() req: Request,
    ): Promise<JobResponseDto> {
        const userId = req.user['userId'];
        const role = req.user['role'];

        // Verify ownership or admin role
        const job = await this.jobsService.findById(createMilestoneDto.jobId);

        if (job.client.toString() !== userId && role !== UserRole.CLIENT) {
            throw new Error('Unauthorized to add milestones to this job');
        }

        const updatedJob = await this.jobsService.addMilestone(createMilestoneDto);
        return JobMapper.toDto(updatedJob);
    }

    @Put(':jobId/milestone/:milestoneIndex')
    @UseGuards(JwtAuthGuard)
    async updateMilestone(
        @Param('jobId') jobId: string,
        @Param('milestoneIndex') milestoneIndex: number,
        @Body() updateMilestoneDto: UpdateMilestoneDto,
        @Req() req: Request,
    ): Promise<JobResponseDto> {
        const userId = req.user['userId'];
        const role = req.user['role'];

        // Verify ownership or admin role
        const job = await this.jobsService.findById(jobId);

        if (job.client.toString() !== userId && role !== UserRole.CLIENT) {
            throw new Error('Unauthorized to update milestones for this job');
        }

        const updatedJob = await this.jobsService.updateMilestone(jobId, milestoneIndex, updateMilestoneDto);
        return JobMapper.toDto(updatedJob);
    }

    @Post('submit')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async submitMilestone(
        @Body() submitMilestoneDto: SubmitMilestoneDto,
        @Req() req: Request,
    ): Promise<JobResponseDto> {
        const freelancerId = req.user['userId'];
        const updatedJob = await this.jobsService.submitMilestone(submitMilestoneDto, freelancerId);
        return JobMapper.toDto(updatedJob);
    }

    @Post('assignReviewers')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async assignReviewers(
        @Body() assignReviewersDto: AssignReviewersDto,
        @Req() req: Request,
    ): Promise<JobResponseDto> {
        const clientId = req.user['userId'];
        const updatedJob = await this.jobsService.assignReviewers(assignReviewersDto, clientId);
        return JobMapper.toDto(updatedJob);
    }

    @Post('vote')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async voteMilestone(
        @Body() voteMilestoneDto: VoteMilestoneDto,
        @Req() req: Request,
    ): Promise<JobResponseDto> {
        const reviewerId = req.user['userId'];
        const role = req.user['role'];

        if (role !== UserRole.REVIEWER) {
            throw new Error('Only reviewers can vote on milestones');
        }

        const updatedJob = await this.jobsService.voteMilestone(voteMilestoneDto, reviewerId);
        return JobMapper.toDto(updatedJob);
    }

    @Post('release')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async releaseMilestone(
        @Body() releaseMilestoneDto: ReleaseMilestoneDto,
        @Req() req: Request,
    ): Promise<JobResponseDto> {
        const clientId = req.user['userId'];
        const role = req.user['role'];

        if (role !== UserRole.CLIENT) {
            throw new Error('Only clients can release payments');
        }

        const updatedJob = await this.jobsService.releaseMilestone(releaseMilestoneDto, clientId);
        return JobMapper.toDto(updatedJob);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id') id: string, @Req() req: Request): Promise<void> {
        const userId = req.user['userId'];
        const role = req.user['role'];

        // Verify ownership or admin role
        const job = await this.jobsService.findById(id);

        if (job.client.toString() !== userId && role !== UserRole.CLIENT) {
            throw new Error('Unauthorized to delete this job');
        }

        return this.jobsService.remove(id);
    }
} 