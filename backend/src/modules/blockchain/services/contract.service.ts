import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';
import * as MQ3KEscrowABI from '../abi/MQ3KEscrow.json';
import * as MQ3KTokenABI from '../abi/MQ3KToken.json';

@Injectable()
export class ContractService {
    private readonly logger = new Logger(ContractService.name);
    private web3: Web3;
    private escrowContract: Contract;
    private tokenContract: Contract;

    constructor(private configService: ConfigService) {
        this.initWeb3();
    }

    private async initWeb3() {
        try {
            const providerUrl = this.configService.get<string>('BLOCKCHAIN_PROVIDER_URL');
            this.web3 = new Web3(providerUrl);

            const escrowAddress = this.configService.get<string>('MQ3K_ESCROW_ADDRESS');
            const tokenAddress = this.configService.get<string>('MQ3K_TOKEN_ADDRESS');

            this.escrowContract = new this.web3.eth.Contract(
                MQ3KEscrowABI as any,
                escrowAddress
            );

            this.tokenContract = new this.web3.eth.Contract(
                MQ3KTokenABI as any,
                tokenAddress
            );

            this.logger.log('Web3 and contracts initialized successfully');
        } catch (error) {
            this.logger.error(`Failed to initialize Web3: ${error.message}`);
            throw error;
        }
    }

    async createProject(client: string, worker: string, deadline: number) {
        try {
            const tx = await this.escrowContract.methods
                .createProject(worker, deadline)
                .send({ from: client });

            return tx;
        } catch (error) {
            this.logger.error(`Failed to create project: ${error.message}`);
            throw error;
        }
    }

    async addMilestone(client: string, projectId: number, description: string, amount: string, deadline: number) {
        try {
            const amountWei = this.web3.utils.toWei(amount, 'ether');
            const tx = await this.escrowContract.methods
                .addMilestone(projectId, description, amountWei, deadline)
                .send({ from: client });

            return tx;
        } catch (error) {
            this.logger.error(`Failed to add milestone: ${error.message}`);
            throw error;
        }
    }

    async fundProject(client: string, projectId: number, amount: string) {
        try {
            const tx = await this.escrowContract.methods
                .fundProject(projectId)
                .send({ from: client, value: this.web3.utils.toWei(amount, 'ether') });

            return tx;
        } catch (error) {
            this.logger.error(`Failed to fund project: ${error.message}`);
            throw error;
        }
    }

    async startWork(worker: string, projectId: number) {
        try {
            const tx = await this.escrowContract.methods
                .startWork(projectId)
                .send({ from: worker });

            return tx;
        } catch (error) {
            this.logger.error(`Failed to start work: ${error.message}`);
            throw error;
        }
    }

    async submitMilestone(worker: string, projectId: number, milestoneId: number, evidence: string) {
        try {
            const tx = await this.escrowContract.methods
                .submitMilestone(projectId, milestoneId, evidence)
                .send({ from: worker });

            return tx;
        } catch (error) {
            this.logger.error(`Failed to submit milestone: ${error.message}`);
            throw error;
        }
    }

    async registerAsReviewer(address: string) {
        try {
            const tx = await this.escrowContract.methods
                .registerAsReviewer()
                .send({ from: address });

            return tx;
        } catch (error) {
            this.logger.error(`Failed to register as reviewer: ${error.message}`);
            throw error;
        }
    }

    async voteOnMilestone(reviewer: string, projectId: number, milestoneId: number, approved: boolean) {
        try {
            const tx = await this.escrowContract.methods
                .voteOnMilestone(projectId, milestoneId, approved)
                .send({ from: reviewer });

            return tx;
        } catch (error) {
            this.logger.error(`Failed to vote on milestone: ${error.message}`);
            throw error;
        }
    }

    async disputeMilestone(address: string, projectId: number, milestoneId: number) {
        try {
            const tx = await this.escrowContract.methods
                .disputeMilestone(projectId, milestoneId)
                .send({ from: address });

            return tx;
        } catch (error) {
            this.logger.error(`Failed to dispute milestone: ${error.message}`);
            throw error;
        }
    }

    async resolveMilestoneDispute(admin: string, projectId: number, milestoneId: number, approveWork: boolean) {
        try {
            const tx = await this.escrowContract.methods
                .resolveMilestoneDispute(projectId, milestoneId, approveWork)
                .send({ from: admin });

            return tx;
        } catch (error) {
            this.logger.error(`Failed to resolve milestone dispute: ${error.message}`);
            throw error;
        }
    }

    async disputeProject(address: string, projectId: number) {
        try {
            const tx = await this.escrowContract.methods
                .disputeProject(projectId)
                .send({ from: address });

            return tx;
        } catch (error) {
            this.logger.error(`Failed to dispute project: ${error.message}`);
            throw error;
        }
    }

    async resolveDispute(
        admin: string,
        projectId: number,
        recipient: string,
        clientAmount: string,
        workerAmount: string
    ) {
        try {
            const clientAmountWei = this.web3.utils.toWei(clientAmount, 'ether');
            const workerAmountWei = this.web3.utils.toWei(workerAmount, 'ether');

            const tx = await this.escrowContract.methods
                .resolveDispute(projectId, recipient, clientAmountWei, workerAmountWei)
                .send({ from: admin });

            return tx;
        } catch (error) {
            this.logger.error(`Failed to resolve dispute: ${error.message}`);
            throw error;
        }
    }

    async refundProject(admin: string, projectId: number) {
        try {
            const tx = await this.escrowContract.methods
                .refundProject(projectId)
                .send({ from: admin });

            return tx;
        } catch (error) {
            this.logger.error(`Failed to refund project: ${error.message}`);
            throw error;
        }
    }

    async getProject(projectId: number) {
        try {
            const project = await this.escrowContract.methods
                .getProject(projectId)
                .call();

            return {
                id: project.id,
                client: project.client,
                worker: project.worker,
                totalAmount: this.web3.utils.fromWei(project.totalAmount, 'ether'),
                deadline: project.deadline,
                status: this.convertProjectStatus(parseInt(project.status)),
                clientApproved: project.clientApproved,
                workerApproved: project.workerApproved,
                completedMilestones: project.completedMilestones,
                totalMilestones: project.totalMilestones
            };
        } catch (error) {
            this.logger.error(`Failed to get project: ${error.message}`);
            throw error;
        }
    }

    async getMilestone(projectId: number, milestoneId: number) {
        try {
            const milestone = await this.escrowContract.methods
                .getMilestone(projectId, milestoneId)
                .call();

            return {
                id: milestone.id,
                description: milestone.description,
                amount: this.web3.utils.fromWei(milestone.amount, 'ether'),
                deadline: milestone.deadline,
                status: this.convertMilestoneStatus(parseInt(milestone.status)),
                evidence: milestone.evidence,
                positiveVotes: milestone.positiveVotes,
                negativeVotes: milestone.negativeVotes,
                paid: milestone.paid
            };
        } catch (error) {
            this.logger.error(`Failed to get milestone: ${error.message}`);
            throw error;
        }
    }

    async getMilestoneReviewers(projectId: number, milestoneId: number) {
        try {
            return await this.escrowContract.methods
                .getMilestoneReviewers(projectId, milestoneId)
                .call();
        } catch (error) {
            this.logger.error(`Failed to get milestone reviewers: ${error.message}`);
            throw error;
        }
    }

    async getProjectMilestones(projectId: number) {
        try {
            return await this.escrowContract.methods
                .getProjectMilestones(projectId)
                .call();
        } catch (error) {
            this.logger.error(`Failed to get project milestones: ${error.message}`);
            throw error;
        }
    }

    async getReviewerReputation(address: string) {
        try {
            return await this.escrowContract.methods
                .reviewerReputation(address)
                .call();
        } catch (error) {
            this.logger.error(`Failed to get reviewer reputation: ${error.message}`);
            throw error;
        }
    }

    async getTokenBalance(address: string) {
        try {
            const balance = await this.tokenContract.methods
                .balanceOf(address)
                .call();

            return this.web3.utils.fromWei(balance, 'ether');
        } catch (error) {
            this.logger.error(`Failed to get token balance: ${error.message}`);
            throw error;
        }
    }

    async transferTokens(from: string, to: string, amount: string) {
        try {
            const amountWei = this.web3.utils.toWei(amount, 'ether');

            const tx = await this.tokenContract.methods
                .transfer(to, amountWei)
                .send({ from });

            return tx;
        } catch (error) {
            this.logger.error(`Failed to transfer tokens: ${error.message}`);
            throw error;
        }
    }

    private convertProjectStatus(status: number): string {
        const statuses = [
            'Created',
            'Funded',
            'InProgress',
            'Completed',
            'Disputed',
            'Refunded'
        ];

        return statuses[status] || 'Unknown';
    }

    private convertMilestoneStatus(status: number): string {
        const statuses = [
            'Created',
            'InProgress',
            'Submitted',
            'UnderReview',
            'Approved',
            'Rejected',
            'Disputed'
        ];

        return statuses[status] || 'Unknown';
    }
} 