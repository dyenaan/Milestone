import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JobsController } from './controllers/jobs.controller';
import { JobsService } from './services/jobs.service';
import { Job, JobSchema } from './schemas/job.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { AuthModule } from '../auth/auth.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { BlockchainModule } from '../blockchain/blockchain.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Job.name, schema: JobSchema },
            { name: User.name, schema: UserSchema },
        ]),
        AuthModule,
        NotificationsModule,
        BlockchainModule,
    ],
    controllers: [JobsController],
    providers: [JobsService],
    exports: [JobsService],
})
export class JobsModule { } 