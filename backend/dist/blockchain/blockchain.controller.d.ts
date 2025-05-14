import { AptosService } from './aptos.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { AddMilestoneDto } from './dto/add-milestone.dto';
import { FundProjectDto } from './dto/fund-project.dto';
import { SubmitMilestoneDto } from './dto/submit-milestone.dto';
import { ReviewMilestoneDto } from './dto/review-milestone.dto';
export declare class BlockchainController {
    private readonly aptosService;
    constructor(aptosService: AptosService);
    createProject(createProjectDto: CreateProjectDto): Promise<{
        txHash: string;
    }>;
    addMilestone(projectId: number, addMilestoneDto: AddMilestoneDto): Promise<{
        txHash: string;
    }>;
    fundProject(projectId: number, fundProjectDto: FundProjectDto): Promise<{
        txHash: string;
    }>;
    startWork(projectId: number, body: {
        workerAddress: string;
    }): Promise<{
        txHash: string;
    }>;
    submitMilestone(projectId: number, milestoneId: number, submitMilestoneDto: SubmitMilestoneDto): Promise<{
        txHash: string;
    }>;
    registerAsReviewer(body: {
        reviewerAddress: string;
    }): Promise<{
        txHash: string;
    }>;
    reviewMilestone(projectId: number, milestoneId: number, reviewMilestoneDto: ReviewMilestoneDto): Promise<{
        txHash: string;
    }>;
    completeMilestone(projectId: number, milestoneId: number): Promise<{
        txHash: string;
    }>;
    cancelProject(projectId: number, body: {
        clientAddress: string;
    }): Promise<{
        txHash: string;
    }>;
    getProjectStatus(projectId: number): Promise<{
        status: number;
    }>;
    getMilestoneStatus(projectId: number, milestoneId: number): Promise<{
        status: number;
    }>;
    isReviewer(address: string): Promise<{
        isReviewer: boolean;
    }>;
}
