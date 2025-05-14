import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { BlockchainModule } from './modules/blockchain/blockchain.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ReviewersModule } from './modules/reviewers/reviewers.module';
import { WebSocketGateway } from './gateways/websocket.gateway';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => ({
                uri: configService.get<string>('MONGODB_URI'),
            }),
        }),
        AuthModule,
        UsersModule,
        JobsModule,
        ReviewsModule,
        NotificationsModule,
        BlockchainModule,
        PaymentsModule,
        ReviewersModule,
    ],
    providers: [WebSocketGateway],
})
export class AppModule { } 