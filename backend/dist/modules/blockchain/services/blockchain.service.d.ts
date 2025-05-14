import { ConfigService } from '@nestjs/config';
interface EscrowCreationParams {
    clientAddress: string;
    freelancerAddress: string;
    milestones: Array<{
        title: string;
        amount: number;
    }>;
}
interface SubmitWorkParams {
    escrowId: string;
    milestoneId: number;
    evidenceHash: string;
}
interface AssignReviewersParams {
    escrowId: string;
    milestoneId: number;
    reviewerAddresses: string[];
}
interface VoteParams {
    escrowId: string;
    milestoneId: number;
    vote: boolean;
    reviewerAddress: string;
}
interface ReleaseParams {
    escrowId: string;
    milestoneId: number;
}
interface UpdateReputationParams {
    reviewerAddress: string;
    change: number;
}
export declare class BlockchainService {
    private configService;
    private readonly logger;
    private aptosClient;
    private stellarServer;
    private aptosContractAddress;
    constructor(configService: ConfigService);
    createEscrow(params: EscrowCreationParams): Promise<string>;
    submitWork(params: SubmitWorkParams): Promise<boolean>;
    assignReviewers(params: AssignReviewersParams): Promise<boolean>;
    voteOnMilestone(params: VoteParams): Promise<boolean>;
    releaseFunds(params: ReleaseParams): Promise<string>;
    updateReputation(params: UpdateReputationParams): Promise<boolean>;
    sendStellarPayment(sourceSecretKey: string, destinationPublicKey: string, amount: string, asset?: 'USDC' | 'XLM'): Promise<string>;
    getAptosBalance(address: string): Promise<string>;
    getStellarBalance(publicKey: string, asset?: 'USDC' | 'XLM'): Promise<string>;
}
export {};
