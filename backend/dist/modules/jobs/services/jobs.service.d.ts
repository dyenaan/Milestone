import { Model } from 'mongoose';
import { Job, JobStatus } from '../schemas/job.schema';
import { User } from '../../users/schemas/user.schema';
import { NotificationsService } from '../../notifications/services/notifications.service';
import { BlockchainService } from '../../blockchain/services/blockchain.service';
import { CreateJobDto, UpdateJobDto, CreateMilestoneDto, UpdateMilestoneDto, SubmitMilestoneDto, AssignReviewersDto, VoteMilestoneDto, ReleaseMilestoneDto } from '../dto/job.dto';
export declare class JobsService {
    private jobModel;
    private userModel;
    private notificationsService;
    private blockchainService;
    private readonly logger;
    constructor(jobModel: Model<Job>, userModel: Model<User>, notificationsService: NotificationsService, blockchainService: BlockchainService);
    findAll(status?: JobStatus, skills?: string[]): Promise<Job[]>;
    findByClient(clientId: string): Promise<Job[]>;
    findByFreelancer(freelancerId: string): Promise<Job[]>;
    findById(id: string): Promise<Job>;
    create(createJobDto: CreateJobDto, clientId: string): Promise<Job>;
    update(id: string, updateJobDto: UpdateJobDto): Promise<Job>;
    addMilestone(createMilestoneDto: CreateMilestoneDto): Promise<Job>;
    updateMilestone(jobId: string, milestoneIndex: number, updateMilestoneDto: UpdateMilestoneDto): Promise<Job>;
    submitMilestone(submitMilestoneDto: SubmitMilestoneDto, freelancerId: string): Promise<Job>;
    assignReviewers(assignReviewersDto: AssignReviewersDto, clientId: string): Promise<Job>;
    voteMilestone(voteMilestoneDto: VoteMilestoneDto, reviewerId: string): Promise<Job>;
    releaseMilestone(releaseMilestoneDto: ReleaseMilestoneDto, clientId: string): Promise<Job>;
    remove(id: string): Promise<void>;
}
