import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AptosService } from './aptos.service';
import { BlockchainController } from './blockchain.controller';

@Module({
    imports: [ConfigModule],
    providers: [AptosService],
    controllers: [BlockchainController],
    exports: [AptosService],
})
export class BlockchainModule { } 