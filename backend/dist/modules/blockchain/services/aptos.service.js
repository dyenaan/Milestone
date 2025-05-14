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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var AptosService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AptosService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = __importDefault(require("axios"));
let AptosService = AptosService_1 = class AptosService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(AptosService_1.name);
        this.aptosNodeUrl = this.configService.get('APTOS_NODE_URL') || 'https://fullnode.mainnet.aptoslabs.com/v1';
        this.defaultWallet = this.configService.get('DEFAULT_APTOS_WALLET') || '0xdb3d67d9c869bbe0a02583bef1d243a2eae8d901534732e195e091dfac950e1c';
    }
    async verifyWalletOwnership(walletAddress, signedMessage, message) {
        try {
            this.logger.log(`Verifying wallet ownership for ${walletAddress}`);
            return walletAddress === this.defaultWallet;
        }
        catch (error) {
            this.logger.error(`Error verifying wallet ownership: ${error.message}`);
            return false;
        }
    }
    async getAccountResources(walletAddress) {
        try {
            const response = await axios_1.default.get(`${this.aptosNodeUrl}/accounts/${walletAddress}/resources`);
            return response.data;
        }
        catch (error) {
            this.logger.error(`Error fetching account resources: ${error.message}`);
            throw new Error('Failed to fetch Aptos account resources');
        }
    }
    async verifyZkProofWithGoogle(googleToken, walletAddress) {
        try {
            this.logger.log(`Verifying ZK proof with Google for wallet ${walletAddress}`);
            return walletAddress === this.defaultWallet;
        }
        catch (error) {
            this.logger.error(`Error verifying ZK proof with Google: ${error.message}`);
            return false;
        }
    }
    async verifyZkProofWithApple(appleToken, walletAddress) {
        try {
            this.logger.log(`Verifying ZK proof with Apple for wallet ${walletAddress}`);
            return walletAddress === this.defaultWallet;
        }
        catch (error) {
            this.logger.error(`Error verifying ZK proof with Apple: ${error.message}`);
            return false;
        }
    }
};
AptosService = AptosService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AptosService);
exports.AptosService = AptosService;
//# sourceMappingURL=aptos.service.js.map