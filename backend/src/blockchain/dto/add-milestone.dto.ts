import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class AddMilestoneDto {
    @IsNotEmpty()
    @IsString()
    clientAddress: string;

    @IsNotEmpty()
    @IsString()
    description: string;

    @IsNotEmpty()
    @IsString()
    amount: string;

    @IsNotEmpty()
    @IsNumber()
    deadline: number;
} 