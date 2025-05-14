import { IsNotEmpty, IsString, IsBoolean } from 'class-validator';

export class ReviewMilestoneDto {
    @IsNotEmpty()
    @IsString()
    reviewerAddress: string;

    @IsNotEmpty()
    @IsBoolean()
    approved: boolean;
} 