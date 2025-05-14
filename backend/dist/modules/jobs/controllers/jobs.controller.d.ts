import { JobsService } from '../services/jobs.service';
import { JobStatus } from '../schemas/job.schema';
import { CreateJobDto, UpdateJobDto, JobResponseDto, CreateMilestoneDto, UpdateMilestoneDto, SubmitMilestoneDto, AssignReviewersDto, VoteMilestoneDto, ReleaseMilestoneDto } from '../dto/job.dto';
import { Request } from 'express';
export declare class JobsController {
    private readonly jobsService;
    constructor(jobsService: JobsService);
    findAll(status?: JobStatus, skills?: string): Promise<JobResponseDto[]>;
    findByClient(req: Request): Promise<JobResponseDto[]>;
    findByFreelancer(req: Request): Promise<JobResponseDto[]>;
    findOne(id: string): Promise<JobResponseDto>;
    create(createJobDto: CreateJobDto, req: Request): Promise<JobResponseDto>;
    update(id: string, updateJobDto: UpdateJobDto, req: Request): Promise<JobResponseDto>;
    addMilestone(createMilestoneDto: CreateMilestoneDto, req: Request): Promise<JobResponseDto>;
    updateMilestone(jobId: string, milestoneIndex: number, updateMilestoneDto: UpdateMilestoneDto, req: Request): Promise<JobResponseDto>;
    submitMilestone(submitMilestoneDto: SubmitMilestoneDto, req: Request): Promise<JobResponseDto>;
    assignReviewers(assignReviewersDto: AssignReviewersDto, req: Request): Promise<JobResponseDto>;
    voteMilestone(voteMilestoneDto: VoteMilestoneDto, req: Request): Promise<JobResponseDto>;
    releaseMilestone(releaseMilestoneDto: ReleaseMilestoneDto, req: Request): Promise<JobResponseDto>;
    remove(id: string, req: Request): Promise<void>;
}
