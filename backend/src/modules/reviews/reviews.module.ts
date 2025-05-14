import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReviewsController } from './controllers/reviews.controller';
import { ReviewsService } from './services/reviews.service';
import { Review, ReviewSchema } from './schemas/review.schema';
import { UsersModule } from '../users/users.module';
import { JobsModule } from '../jobs/jobs.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Review.name, schema: ReviewSchema }]),
        UsersModule,
        JobsModule
    ],
    controllers: [ReviewsController],
    providers: [ReviewsService],
    exports: [ReviewsService]
})
export class ReviewsModule { } 