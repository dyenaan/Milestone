import { ConfigService } from '@nestjs/config';
export declare class AptosService {
    private configService;
    private readonly logger;
    private readonly aptosNodeUrl;
    private readonly defaultWallet;
    constructor(configService: ConfigService);
    verifyWalletOwnership(walletAddress: string, signedMessage: string, message: string): Promise<boolean>;
    getAccountResources(walletAddress: string): Promise<any>;
    verifyZkProofWithGoogle(googleToken: string, walletAddress: string): Promise<boolean>;
    verifyZkProofWithApple(appleToken: string, walletAddress: string): Promise<boolean>;
}
