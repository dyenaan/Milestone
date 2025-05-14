import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    AptosClient,
    AptosAccount,
    CoinClient,
    TokenClient,
    HexString,
    Types
} from 'aptos';

@Injectable()
export class AptosService {
    private client: AptosClient;
    private coinClient: CoinClient;
    private tokenClient: TokenClient;
    private account: AptosAccount;
    private escrowModuleAddress: string;
    private tokenModuleAddress: string;

    constructor(private configService: ConfigService) {
        // Initialize Aptos client
        const nodeUrl = this.configService.get<string>('BLOCKCHAIN_PROVIDER_URL');
        this.client = new AptosClient(nodeUrl);
        this.coinClient = new CoinClient(this.client);
        this.tokenClient = new TokenClient(this.client);

        // Get module addresses
        this.escrowModuleAddress = this.configService.get<string>('MQ3K_ESCROW_ADDRESS');
        this.tokenModuleAddress = this.configService.get<string>('MQ3K_TOKEN_ADDRESS');

        // Initialize account if private key is available
        const privateKey = this.configService.get<string>('BLOCKCHAIN_PRIVATE_KEY');
        if (privateKey) {
            this.account = new AptosAccount(HexString.ensure(privateKey).toUint8Array());
        }
    }

    /**
     * Get the Aptos client
     */
    getClient(): AptosClient {
        return this.client;
    }

    /**
     * Get the coin client
     */
    getCoinClient(): CoinClient {
        return this.coinClient;
    }

    /**
     * Get the token client
     */
    getTokenClient(): TokenClient {
        return this.tokenClient;
    }

    /**
     * Get account address
     */
    getAccountAddress(): string {
        return this.account ? this.account.address().hex() : null;
    }

    /**
     * Create a project
     */
    async createProject(clientAddress: string, workerAddress: string, deadline: number): Promise<string> {
        try {
            const payload: Types.EntryFunctionPayload = {
                function: `${this.escrowModuleAddress}::escrow::create_project`,
                type_arguments: [],
                arguments: [workerAddress, deadline.toString(), this.escrowModuleAddress],
            };

            return this.submitTransaction(clientAddress, payload);
        } catch (error) {
            console.error('Error creating project:', error);
            throw error;
        }
    }

    /**
     * Add milestone to a project
     */
    async addMilestone(
        clientAddress: string,
        projectId: number,
        description: string,
        amount: string,
        deadline: number
    ): Promise<string> {
        try {
            const payload: Types.EntryFunctionPayload = {
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
        } catch (error) {
            console.error('Error adding milestone:', error);
            throw error;
        }
    }

    /**
     * Fund a project
     */
    async fundProject(
        clientAddress: string,
        projectId: number,
        amount: string
    ): Promise<string> {
        try {
            const payload: Types.EntryFunctionPayload = {
                function: `${this.escrowModuleAddress}::escrow::fund_project`,
                type_arguments: [`${this.tokenModuleAddress}::token::MQ3KToken`],
                arguments: [
                    projectId.toString(),
                    amount,
                    this.escrowModuleAddress
                ],
            };

            return this.submitTransaction(clientAddress, payload);
        } catch (error) {
            console.error('Error funding project:', error);
            throw error;
        }
    }

    /**
     * Start work on a project
     */
    async startWork(
        workerAddress: string,
        projectId: number
    ): Promise<string> {
        try {
            const payload: Types.EntryFunctionPayload = {
                function: `${this.escrowModuleAddress}::escrow::start_work`,
                type_arguments: [],
                arguments: [
                    projectId.toString(),
                    this.escrowModuleAddress
                ],
            };

            return this.submitTransaction(workerAddress, payload);
        } catch (error) {
            console.error('Error starting work:', error);
            throw error;
        }
    }

    /**
     * Submit milestone
     */
    async submitMilestone(
        workerAddress: string,
        projectId: number,
        milestoneId: number,
        evidence: string
    ): Promise<string> {
        try {
            const payload: Types.EntryFunctionPayload = {
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
        } catch (error) {
            console.error('Error submitting milestone:', error);
            throw error;
        }
    }

    /**
     * Register as reviewer
     */
    async registerAsReviewer(reviewerAddress: string): Promise<string> {
        try {
            const payload: Types.EntryFunctionPayload = {
                function: `${this.escrowModuleAddress}::escrow::register_as_reviewer`,
                type_arguments: [],
                arguments: [this.escrowModuleAddress],
            };

            return this.submitTransaction(reviewerAddress, payload);
        } catch (error) {
            console.error('Error registering as reviewer:', error);
            throw error;
        }
    }

    /**
     * Review milestone
     */
    async reviewMilestone(
        reviewerAddress: string,
        projectId: number,
        milestoneId: number,
        approved: boolean
    ): Promise<string> {
        try {
            const payload: Types.EntryFunctionPayload = {
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
        } catch (error) {
            console.error('Error reviewing milestone:', error);
            throw error;
        }
    }

    /**
     * Complete milestone
     */
    async completeMilestone(
        projectId: number,
        milestoneId: number
    ): Promise<string> {
        try {
            const payload: Types.EntryFunctionPayload = {
                function: `${this.escrowModuleAddress}::escrow::complete_milestone`,
                type_arguments: [`${this.tokenModuleAddress}::token::MQ3KToken`],
                arguments: [
                    projectId.toString(),
                    milestoneId.toString(),
                    this.escrowModuleAddress
                ],
            };

            // Use admin account for this operation
            return this.submitTransactionWithAccount(payload);
        } catch (error) {
            console.error('Error completing milestone:', error);
            throw error;
        }
    }

    /**
     * Cancel project
     */
    async cancelProject(
        clientAddress: string,
        projectId: number
    ): Promise<string> {
        try {
            const payload: Types.EntryFunctionPayload = {
                function: `${this.escrowModuleAddress}::escrow::cancel_project`,
                type_arguments: [`${this.tokenModuleAddress}::token::MQ3KToken`],
                arguments: [
                    projectId.toString(),
                    this.escrowModuleAddress
                ],
            };

            return this.submitTransaction(clientAddress, payload);
        } catch (error) {
            console.error('Error cancelling project:', error);
            throw error;
        }
    }

    /**
     * Get project status
     */
    async getProjectStatus(projectId: number): Promise<number> {
        try {
            const resource = await this.client.view({
                function: `${this.escrowModuleAddress}::escrow::get_project_status`,
                type_arguments: [],
                arguments: [projectId.toString(), this.escrowModuleAddress],
            });

            return parseInt(resource[0] as string);
        } catch (error) {
            console.error('Error getting project status:', error);
            throw error;
        }
    }

    /**
     * Get milestone status
     */
    async getMilestoneStatus(projectId: number, milestoneId: number): Promise<number> {
        try {
            const resource = await this.client.view({
                function: `${this.escrowModuleAddress}::escrow::get_milestone_status`,
                type_arguments: [],
                arguments: [projectId.toString(), milestoneId.toString(), this.escrowModuleAddress],
            });

            return parseInt(resource[0] as string);
        } catch (error) {
            console.error('Error getting milestone status:', error);
            throw error;
        }
    }

    /**
     * Check if an address is a reviewer
     */
    async isReviewer(reviewerAddress: string): Promise<boolean> {
        try {
            const resource = await this.client.view({
                function: `${this.escrowModuleAddress}::escrow::is_reviewer`,
                type_arguments: [],
                arguments: [reviewerAddress, this.escrowModuleAddress],
            });

            return resource[0] as boolean;
        } catch (error) {
            console.error('Error checking if reviewer:', error);
            throw error;
        }
    }

    /**
     * Submit transaction with user signing
     */
    private async submitTransaction(
        userAddress: string,
        payload: Types.EntryFunctionPayload
    ): Promise<string> {
        try {
            const transaction = await this.client.generateTransaction(userAddress, payload);
            // In a real application, you would need to pass this transaction to the user for signing
            // Here we're simulating that the transaction was signed by the user
            // This would typically be handled by a wallet integration
            const signedTxn = await this.client.signTransaction(this.account, transaction);
            const txnResult = await this.client.submitTransaction(signedTxn);
            await this.client.waitForTransaction(txnResult.hash);
            return txnResult.hash;
        } catch (error) {
            console.error('Error submitting transaction:', error);
            throw error;
        }
    }

    /**
     * Submit transaction with admin account
     */
    private async submitTransactionWithAccount(payload: Types.EntryFunctionPayload): Promise<string> {
        try {
            if (!this.account) {
                throw new Error('Admin account not configured');
            }

            const transaction = await this.client.generateTransaction(this.account.address(), payload);
            const signedTxn = await this.client.signTransaction(this.account, transaction);
            const txnResult = await this.client.submitTransaction(signedTxn);
            await this.client.waitForTransaction(txnResult.hash);
            return txnResult.hash;
        } catch (error) {
            console.error('Error submitting transaction with account:', error);
            throw error;
        }
    }

    /**
     * Verify wallet ownership
     */
    async verifyWalletOwnership(
        walletAddress: string,
        signedMessage: string,
        message: string
    ): Promise<boolean> {
        try {
            // In a real implementation, this would verify the signature against the message
            // For demonstration, we're returning true to simulate successful verification
            
            // 1. Convert the signed message from hex to Uint8Array
            const signatureBytes = Buffer.from(signedMessage.replace('0x', ''), 'hex');
            
            // 2. Create the original message bytes
            const messageBytes = Buffer.from(message);
            
            // 3. Verify the signature
            // This is a mock implementation - in production, use Aptos SDK's verification
            this.logger.log(`Verifying signature for wallet ${walletAddress}`);
            
            // For development, always return true
            // In production, this would use proper signature verification
            return true;
        } catch (error) {
            console.error('Error verifying wallet ownership:', error);
            return false;
        }
    }

    /**
     * Verify ZK proof with Google authentication
     */
    async verifyZkProofWithGoogle(googleToken: string, walletAddress: string): Promise<boolean> {
        try {
            // In a real implementation, this would:
            // 1. Verify the Google token is valid
            // 2. Verify the ZK proof connects the Google identity to the Aptos wallet
            
            this.logger.log(`Verifying Google ZK proof for wallet ${walletAddress}`);
            
            // For development, always return true
            // In production, this would validate the Google token and ZK proof
            return true;
        } catch (error) {
            console.error('Error verifying Google ZK proof:', error);
            return false;
        }
    }

    /**
     * Verify ZK proof with Apple authentication
     */
    async verifyZkProofWithApple(appleToken: string, walletAddress: string): Promise<boolean> {
        try {
            // In a real implementation, this would:
            // 1. Verify the Apple token is valid
            // 2. Verify the ZK proof connects the Apple identity to the Aptos wallet
            
            this.logger.log(`Verifying Apple ZK proof for wallet ${walletAddress}`);
            
            // For development, always return true
            // In production, this would validate the Apple token and ZK proof
            return true;
        } catch (error) {
            console.error('Error verifying Apple ZK proof:', error);
            return false;
        }
    }
} 