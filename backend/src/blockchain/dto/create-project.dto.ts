import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateProjectDto {
    @IsNotEmpty()
    @IsString()
    clientAddress: string;

    @IsNotEmpty()
    @IsString()
    workerAddress: string;

    @IsNotEmpty()
    @IsNumber()
    deadline: number;
} 