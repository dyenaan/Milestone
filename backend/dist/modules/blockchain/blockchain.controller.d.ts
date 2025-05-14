import { ContractService } from './services/contract.service';
export declare class BlockchainController {
    private readonly contractService;
    constructor(contractService: ContractService);
    getProject(id: string): Promise<{
        id: any;
        client: any;
        worker: any;
        totalAmount: string;
        deadline: any;
        status: string;
        clientApproved: any;
        workerApproved: any;
        completedMilestones: any;
        totalMilestones: any;
    }>;
    createProject(body: {
        worker: string;
        deadline: number;
    }): Promise<any>;
    fundProject(body: {
        projectId: number;
        amount: string;
    }): Promise<any>;
    startWork(body: {
        projectId: number;
    }): Promise<any>;
    approveCompletion(body: {
        projectId: number;
    }): Promise<any>;
    disputeProject(body: {
        projectId: number;
    }): Promise<any>;
    resolveDispute(body: {
        projectId: number;
        recipient: string;
        clientAmount: string;
        workerAmount: string;
    }): Promise<any>;
    refundProject(body: {
        projectId: number;
    }): Promise<any>;
    getProjectMilestones(projectId: string): Promise<any>;
    getMilestone(projectId: string, milestoneId: string): Promise<{
        id: any;
        description: any;
        amount: string;
        deadline: any;
        status: string;
        evidence: any;
        positiveVotes: any;
        negativeVotes: any;
        paid: any;
    }>;
    getMilestoneReviewers(projectId: string, milestoneId: string): Promise<any>;
    addMilestone(body: {
        projectId: number;
        description: string;
        amount: string;
        deadline: number;
    }): Promise<any>;
    submitMilestone(body: {
        projectId: number;
        milestoneId: number;
        evidence: string;
    }): Promise<any>;
    disputeMilestone(body: {
        projectId: number;
        milestoneId: number;
    }): Promise<any>;
    resolveMilestoneDispute(body: {
        projectId: number;
        milestoneId: number;
        approveWork: boolean;
    }): Promise<any>;
    registerAsReviewer(): Promise<any>;
    voteOnMilestone(body: {
        projectId: number;
        milestoneId: number;
        approved: boolean;
    }): Promise<any>;
    getReviewerReputation(address: string): Promise<any>;
    getTokenBalance(address: string): Promise<string>;
    transferTokens(body: {
        to: string;
        amount: string;
    }): Promise<any>;
}
