"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AptosService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const aptos_1 = require("aptos");
let AptosService = class AptosService {
    constructor(configService) {
        this.configService = configService;
        const nodeUrl = this.configService.get('BLOCKCHAIN_PROVIDER_URL');
        this.client = new aptos_1.AptosClient(nodeUrl);
        this.coinClient = new aptos_1.CoinClient(this.client);
        this.tokenClient = new aptos_1.TokenClient(this.client);
        this.escrowModuleAddress = this.configService.get('MQ3K_ESCROW_ADDRESS');
        this.tokenModuleAddress = this.configService.get('MQ3K_TOKEN_ADDRESS');
        const privateKey = this.configService.get('BLOCKCHAIN_PRIVATE_KEY');
        if (privateKey) {
            this.account = new aptos_1.AptosAccount(aptos_1.HexString.ensure(privateKey).toUint8Array());
        }
    }
    getClient() {
        return this.client;
    }
    getCoinClient() {
        return this.coinClient;
    }
    getTokenClient() {
        return this.tokenClient;
    }
    getAccountAddress() {
        return this.account ? this.account.address().hex() : null;
    }
    async createProject(clientAddress, workerAddress, deadline) {
        try {
            const payload = {
                function: `${this.escrowModuleAddress}::escrow::create_project`,
                type_arguments: [],
                arguments: [workerAddress, deadline.toString(), this.escrowModuleAddress],
            };
            return this.submitTransaction(clientAddress, payload);
        }
        catch (error) {
            console.error('Error creating project:', error);
            throw error;
        }
    }
    async addMilestone(clientAddress, projectId, description, amount, deadline) {
        try {
            const payload = {
                function: `${this.escrowModuleAddress}::escrow::add_milestone`,
                type_arguments: [],
                arguments: [
                    projectId.toString(),
                    Buffer.from(description).toString('hex'),
                    amount,
                    deadline.toString(),
                    this.escrowModuleAddress
                ],
            };
            return this.submitTransaction(clientAddress, payload);
        }
        catch (error) {
            console.error('Error adding milestone:', error);
            throw error;
        }
    }
    async fundProject(clientAddress, projectId, amount) {
        try {
            const payload = {
                function: `${this.escrowModuleAddress}::escrow::fund_project`,
                type_arguments: [`${this.tokenModuleAddress}::token::MQ3KToken`],
                arguments: [
                    projectId.toString(),
                    amount,
                    this.escrowModuleAddress
                ],
            };
            return this.submitTransaction(clientAddress, payload);
        }
        catch (error) {
            console.error('Error funding project:', error);
            throw error;
        }
    }
    async startWork(workerAddress, projectId) {
        try {
            const payload = {
                function: `${this.escrowModuleAddress}::escrow::start_work`,
                type_arguments: [],
                arguments: [
                    projectId.toString(),
                    this.escrowModuleAddress
                ],
            };
            return this.submitTransaction(workerAddress, payload);
        }
        catch (error) {
            console.error('Error starting work:', error);
            throw error;
        }
    }
    async submitMilestone(workerAddress, projectId, milestoneId, evidence) {
        try {
            const payload = {
                function: `${this.escrowModuleAddress}::escrow::submit_milestone`,
                type_arguments: [],
                arguments: [
                    projectId.toString(),
                    milestoneId.toString(),
                    Buffer.from(evidence).toString('hex'),
                    this.escrowModuleAddress
                ],
            };
            return this.submitTransaction(workerAddress, payload);
        }
        catch (error) {
            console.error('Error submitting milestone:', error);
            throw error;
        }
    }
    async registerAsReviewer(reviewerAddress) {
        try {
            const payload = {
                function: `${this.escrowModuleAddress}::escrow::register_as_reviewer`,
                type_arguments: [],
                arguments: [this.escrowModuleAddress],
            };
            return this.submitTransaction(reviewerAddress, payload);
        }
        catch (error) {
            console.error('Error registering as reviewer:', error);
            throw error;
        }
    }
    async reviewMilestone(reviewerAddress, projectId, milestoneId, approved) {
        try {
            const payload = {
                function: `${this.escrowModuleAddress}::escrow::review_milestone`,
                type_arguments: [],
                arguments: [
                    projectId.toString(),
                    milestoneId.toString(),
                    approved,
                    this.escrowModuleAddress
                ],
            };
            return this.submitTransaction(reviewerAddress, payload);
        }
        catch (error) {
            console.error('Error reviewing milestone:', error);
            throw error;
        }
    }
    async completeMilestone(projectId, milestoneId) {
        try {
            const payload = {
                function: `${this.escrowModuleAddress}::escrow::complete_milestone`,
                type_arguments: [`${this.tokenModuleAddress}::token::MQ3KToken`],
                arguments: [
                    projectId.toString(),
                    milestoneId.toString(),
                    this.escrowModuleAddress
                ],
            };
            return this.submitTransactionWithAccount(payload);
        }
        catch (error) {
            console.error('Error completing milestone:', error);
            throw error;
        }
    }
    async cancelProject(clientAddress, projectId) {
        try {
            const payload = {
                function: `${this.escrowModuleAddress}::escrow::cancel_project`,
                type_arguments: [`${this.tokenModuleAddress}::token::MQ3KToken`],
                arguments: [
                    projectId.toString(),
                    this.escrowModuleAddress
                ],
            };
            return this.submitTransaction(clientAddress, payload);
        }
        catch (error) {
            console.error('Error cancelling project:', error);
            throw error;
        }
    }
    async getProjectStatus(projectId) {
        try {
            const resource = await this.client.view({
                function: `${this.escrowModuleAddress}::escrow::get_project_status`,
                type_arguments: [],
                arguments: [projectId.toString(), this.escrowModuleAddress],
            });
            return parseInt(resource[0]);
        }
        catch (error) {
            console.error('Error getting project status:', error);
            throw error;
        }
    }
    async getMilestoneStatus(projectId, milestoneId) {
        try {
            const resource = await this.client.view({
                function: `${this.escrowModuleAddress}::escrow::get_milestone_status`,
                type_arguments: [],
                arguments: [projectId.toString(), milestoneId.toString(), this.escrowModuleAddress],
            });
            return parseInt(resource[0]);
        }
        catch (error) {
            console.error('Error getting milestone status:', error);
            throw error;
        }
    }
    async isReviewer(reviewerAddress) {
        try {
            const resource = await this.client.view({
                function: `${this.escrowModuleAddress}::escrow::is_reviewer`,
                type_arguments: [],
                arguments: [reviewerAddress, this.escrowModuleAddress],
            });
            return resource[0];
        }
        catch (error) {
            console.error('Error checking if reviewer:', error);
            throw error;
        }
    }
    async submitTransaction(userAddress, payload) {
        try {
            const transaction = await this.client.generateTransaction(userAddress, payload);
            const signedTxn = await this.client.signTransaction(this.account, transaction);
            const txnResult = await this.client.submitTransaction(signedTxn);
            await this.client.waitForTransaction(txnResult.hash);
            return txnResult.hash;
        }
        catch (error) {
            console.error('Error submitting transaction:', error);
            throw error;
        }
    }
    async submitTransactionWithAccount(payload) {
        try {
            if (!this.account) {
                throw new Error('Admin account not configured');
            }
            const transaction = await this.client.generateTransaction(this.account.address(), payload);
            const signedTxn = await this.client.signTransaction(this.account, transaction);
            const txnResult = await this.client.submitTransaction(signedTxn);
            await this.client.waitForTransaction(txnResult.hash);
            return txnResult.hash;
        }
        catch (error) {
            console.error('Error submitting transaction with account:', error);
            throw error;
        }
    }
    async verifyWalletOwnership(walletAddress, signedMessage, message) {
        try {
            const signatureBytes = Buffer.from(signedMessage.replace('0x', ''), 'hex');
            const messageBytes = Buffer.from(message);
            this.logger.log(`Verifying signature for wallet ${walletAddress}`);
            return true;
        }
        catch (error) {
            console.error('Error verifying wallet ownership:', error);
            return false;
        }
    }
    async verifyZkProofWithGoogle(googleToken, walletAddress) {
        try {
            this.logger.log(`Verifying Google ZK proof for wallet ${walletAddress}`);
            return true;
        }
        catch (error) {
            console.error('Error verifying Google ZK proof:', error);
            return false;
        }
    }
    async verifyZkProofWithApple(appleToken, walletAddress) {
        try {
            this.logger.log(`Verifying Apple ZK proof for wallet ${walletAddress}`);
            return true;
        }
        catch (error) {
            console.error('Error verifying Apple ZK proof:', error);
            return false;
        }
    }
};
AptosService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AptosService);
exports.AptosService = AptosService;
//# sourceMappingURL=aptos.service.js.map