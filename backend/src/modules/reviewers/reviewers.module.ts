import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { ReviewersController } from './reviewers.controller';
import { ReviewersService } from './reviewers.service';
import { UsersModule } from '../users/users.module';
import { User, UserSchema } from '../users/schemas/user.schema';
import { ReviewerApplication, ReviewerApplicationSchema } from './schemas/reviewer-application.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: ReviewerApplication.name, schema: ReviewerApplicationSchema },
        ]),
        BlockchainModule,
        UsersModule,
    ],
    controllers: [ReviewersController],
    providers: [ReviewersService],
    exports: [ReviewersService],
})
export class ReviewersModule { } 