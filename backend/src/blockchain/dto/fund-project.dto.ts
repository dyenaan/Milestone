import { IsNotEmpty, IsString } from 'class-validator';

export class FundProjectDto {
    @IsNotEmpty()
    @IsString()
    clientAddress: string;

    @IsNotEmpty()
    @IsString()
    amount: string;
} 