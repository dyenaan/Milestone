import { IsNotEmpty, IsString } from 'class-validator';

export class SubmitMilestoneDto {
    @IsNotEmpty()
    @IsString()
    workerAddress: string;

    @IsNotEmpty()
    @IsString()
    evidence: string;
} 