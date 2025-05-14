import { Job } from '../schemas/job.schema';
import { JobResponseDto } from '../dto/job.dto';
export declare class JobMapper {
    static toDto(job: Job): JobResponseDto;
    static toDtoList(jobs: Job[]): JobResponseDto[];
}
