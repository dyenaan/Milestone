import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BlockchainController } from './blockchain.controller';
import { BlockchainService } from './services/blockchain.service';
import { ContractService } from './services/contract.service';
import { AptosService } from './services/aptos.service';

@Module({
    imports: [ConfigModule],
    controllers: [BlockchainController],
    providers: [BlockchainService, ContractService, AptosService],
    exports: [BlockchainService, ContractService, AptosService]
})
export class BlockchainModule { } 