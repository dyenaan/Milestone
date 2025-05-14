"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var ContractService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const web3_1 = __importDefault(require("web3"));
const MQ3KEscrowABI = __importStar(require("../abi/MQ3KEscrow.json"));
const MQ3KTokenABI = __importStar(require("../abi/MQ3KToken.json"));
let ContractService = ContractService_1 = class ContractService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(ContractService_1.name);
        this.initWeb3();
    }
    async initWeb3() {
        try {
            const providerUrl = this.configService.get('BLOCKCHAIN_PROVIDER_URL');
            this.web3 = new web3_1.default(providerUrl);
            const escrowAddress = this.configService.get('MQ3K_ESCROW_ADDRESS');
            const tokenAddress = this.configService.get('MQ3K_TOKEN_ADDRESS');
            this.escrowContract = new this.web3.eth.Contract(MQ3KEscrowABI, escrowAddress);
            this.tokenContract = new this.web3.eth.Contract(MQ3KTokenABI, tokenAddress);
            this.logger.log('Web3 and contracts initialized successfully');
        }
        catch (error) {
            this.logger.error(`Failed to initialize Web3: ${error.message}`);
            throw error;
        }
    }
    async createProject(client, worker, deadline) {
        try {
            const tx = await this.escrowContract.methods
                .createProject(worker, deadline)
                .send({ from: client });
            return tx;
        }
        catch (error) {
            this.logger.error(`Failed to create project: ${error.message}`);
            throw error;
        }
    }
    async addMilestone(client, projectId, description, amount, deadline) {
        try {
            const amountWei = this.web3.utils.toWei(amount, 'ether');
            const tx = await this.escrowContract.methods
                .addMilestone(projectId, description, amountWei, deadline)
                .send({ from: client });
            return tx;
        }
        catch (error) {
            this.logger.error(`Failed to add milestone: ${error.message}`);
            throw error;
        }
    }
    async fundProject(client, projectId, amount) {
        try {
            const tx = await this.escrowContract.methods
                .fundProject(projectId)
                .send({ from: client, value: this.web3.utils.toWei(amount, 'ether') });
            return tx;
        }
        catch (error) {
            this.logger.error(`Failed to fund project: ${error.message}`);
            throw error;
        }
    }
    async startWork(worker, projectId) {
        try {
            const tx = await this.escrowContract.methods
                .startWork(projectId)
                .send({ from: worker });
            return tx;
        }
        catch (error) {
            this.logger.error(`Failed to start work: ${error.message}`);
            throw error;
        }
    }
    async submitMilestone(worker, projectId, milestoneId, evidence) {
        try {
            const tx = await this.escrowContract.methods
                .submitMilestone(projectId, milestoneId, evidence)
                .send({ from: worker });
            return tx;
        }
        catch (error) {
            this.logger.error(`Failed to submit milestone: ${error.message}`);
            throw error;
        }
    }
    async registerAsReviewer(address) {
        try {
            const tx = await this.escrowContract.methods
                .registerAsReviewer()
                .send({ from: address });
            return tx;
        }
        catch (error) {
            this.logger.error(`Failed to register as reviewer: ${error.message}`);
            throw error;
        }
    }
    async voteOnMilestone(reviewer, projectId, milestoneId, approved) {
        try {
            const tx = await this.escrowContract.methods
                .voteOnMilestone(projectId, milestoneId, approved)
                .send({ from: reviewer });
            return tx;
        }
        catch (error) {
            this.logger.error(`Failed to vote on milestone: ${error.message}`);
            throw error;
        }
    }
    async disputeMilestone(address, projectId, milestoneId) {
        try {
            const tx = await this.escrowContract.methods
                .disputeMilestone(projectId, milestoneId)
                .send({ from: address });
            return tx;
        }
        catch (error) {
            this.logger.error(`Failed to dispute milestone: ${error.message}`);
            throw error;
        }
    }
    async resolveMilestoneDispute(admin, projectId, milestoneId, approveWork) {
        try {
            const tx = await this.escrowContract.methods
                .resolveMilestoneDispute(projectId, milestoneId, approveWork)
                .send({ from: admin });
            return tx;
        }
        catch (error) {
            this.logger.error(`Failed to resolve milestone dispute: ${error.message}`);
            throw error;
        }
    }
    async disputeProject(address, projectId) {
        try {
            const tx = await this.escrowContract.methods
                .disputeProject(projectId)
                .send({ from: address });
            return tx;
        }
        catch (error) {
            this.logger.error(`Failed to dispute project: ${error.message}`);
            throw error;
        }
    }
    async resolveDispute(admin, projectId, recipient, clientAmount, workerAmount) {
        try {
            const clientAmountWei = this.web3.utils.toWei(clientAmount, 'ether');
            const workerAmountWei = this.web3.utils.toWei(workerAmount, 'ether');
            const tx = await this.escrowContract.methods
                .resolveDispute(projectId, recipient, clientAmountWei, workerAmountWei)
                .send({ from: admin });
            return tx;
        }
        catch (error) {
            this.logger.error(`Failed to resolve dispute: ${error.message}`);
            throw error;
        }
    }
    async refundProject(admin, projectId) {
        try {
            const tx = await this.escrowContract.methods
                .refundProject(projectId)
                .send({ from: admin });
            return tx;
        }
        catch (error) {
            this.logger.error(`Failed to refund project: ${error.message}`);
            throw error;
        }
    }
    async getProject(projectId) {
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
        }
        catch (error) {
            this.logger.error(`Failed to get project: ${error.message}`);
            throw error;
        }
    }
    async getMilestone(projectId, milestoneId) {
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
        }
        catch (error) {
            this.logger.error(`Failed to get milestone: ${error.message}`);
            throw error;
        }
    }
    async getMilestoneReviewers(projectId, milestoneId) {
        try {
            return await this.escrowContract.methods
                .getMilestoneReviewers(projectId, milestoneId)
                .call();
        }
        catch (error) {
            this.logger.error(`Failed to get milestone reviewers: ${error.message}`);
            throw error;
        }
    }
    async getProjectMilestones(projectId) {
        try {
            return await this.escrowContract.methods
                .getProjectMilestones(projectId)
                .call();
        }
        catch (error) {
            this.logger.error(`Failed to get project milestones: ${error.message}`);
            throw error;
        }
    }
    async getReviewerReputation(address) {
        try {
            return await this.escrowContract.methods
                .reviewerReputation(address)
                .call();
        }
        catch (error) {
            this.logger.error(`Failed to get reviewer reputation: ${error.message}`);
            throw error;
        }
    }
    async getTokenBalance(address) {
        try {
            const balance = await this.tokenContract.methods
                .balanceOf(address)
                .call();
            return this.web3.utils.fromWei(balance, 'ether');
        }
        catch (error) {
            this.logger.error(`Failed to get token balance: ${error.message}`);
            throw error;
        }
    }
    async transferTokens(from, to, amount) {
        try {
            const amountWei = this.web3.utils.toWei(amount, 'ether');
            const tx = await this.tokenContract.methods
                .transfer(to, amountWei)
                .send({ from });
            return tx;
        }
        catch (error) {
            this.logger.error(`Failed to transfer tokens: ${error.message}`);
            throw error;
        }
    }
    convertProjectStatus(status) {
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
    convertMilestoneStatus(status) {
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
};
ContractService = ContractService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], ContractService);
exports.ContractService = ContractService;
//# sourceMappingURL=contract.service.js.map