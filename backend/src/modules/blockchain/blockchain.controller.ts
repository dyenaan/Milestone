import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ContractService } from './services/contract.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('blockchain')
export class BlockchainController {
    constructor(private readonly contractService: ContractService) { }

    @Get('project/:id')
    async getProject(@Param('id') id: string) {
        return this.contractService.getProject(Number(id));
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.CLIENT)
    @Post('project/create')
    async createProject(@Body() body: { worker: string; deadline: number }) {
        const { worker, deadline } = body;
        // Note: In a real implementation, we would get the client address from the authenticated user
        const client = '0x123'; // Placeholder, would be replaced with actual client address
        return this.contractService.createProject(client, worker, deadline);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.CLIENT)
    @Post('project/fund')
    async fundProject(@Body() body: { projectId: number; amount: string }) {
        const { projectId, amount } = body;
        // Note: In a real implementation, we would get the client address from the authenticated user
        const client = '0x123'; // Placeholder, would be replaced with actual client address
        return this.contractService.fundProject(client, projectId, amount);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.FREELANCER)
    @Post('project/start')
    async startWork(@Body() body: { projectId: number }) {
        const { projectId } = body;
        // Note: In a real implementation, we would get the worker address from the authenticated user
        const worker = '0x456'; // Placeholder, would be replaced with actual worker address
        return this.contractService.startWork(worker, projectId);
    }

    @UseGuards(JwtAuthGuard)
    @Post('project/approve')
    async approveCompletion(@Body() body: { projectId: number }) {
        const { projectId } = body;
        // Note: In a real implementation, we would get the address from the authenticated user
        const address = '0x123'; // Placeholder, would be replaced with actual user address
        return this.contractService.approveCompletion(address, projectId);
    }

    @UseGuards(JwtAuthGuard)
    @Post('project/dispute')
    async disputeProject(@Body() body: { projectId: number }) {
        const { projectId } = body;
        // Note: In a real implementation, we would get the address from the authenticated user
        const address = '0x123'; // Placeholder, would be replaced with actual user address
        return this.contractService.disputeProject(address, projectId);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Post('project/resolve-dispute')
    async resolveDispute(
        @Body()
        body: {
            projectId: number;
            recipient: string;
            clientAmount: string;
            workerAmount: string;
        },
    ) {
        const { projectId, recipient, clientAmount, workerAmount } = body;
        // Note: In a real implementation, we would get the admin address from the authenticated user
        const admin = '0x789'; // Placeholder, would be replaced with actual admin address
        return this.contractService.resolveDispute(
            admin,
            projectId,
            recipient,
            clientAmount,
            workerAmount,
        );
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Post('project/refund')
    async refundProject(@Body() body: { projectId: number }) {
        const { projectId } = body;
        // Note: In a real implementation, we would get the admin address from the authenticated user
        const admin = '0x789'; // Placeholder, would be replaced with actual admin address
        return this.contractService.refundProject(admin, projectId);
    }

    @Get('project/:projectId/milestones')
    async getProjectMilestones(@Param('projectId') projectId: string) {
        return this.contractService.getProjectMilestones(Number(projectId));
    }

    @Get('project/:projectId/milestone/:milestoneId')
    async getMilestone(
        @Param('projectId') projectId: string,
        @Param('milestoneId') milestoneId: string
    ) {
        return this.contractService.getMilestone(Number(projectId), Number(milestoneId));
    }

    @Get('project/:projectId/milestone/:milestoneId/reviewers')
    async getMilestoneReviewers(
        @Param('projectId') projectId: string,
        @Param('milestoneId') milestoneId: string
    ) {
        return this.contractService.getMilestoneReviewers(Number(projectId), Number(milestoneId));
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.CLIENT)
    @Post('project/milestone/add')
    async addMilestone(
        @Body() body: { projectId: number; description: string; amount: string; deadline: number }
    ) {
        const { projectId, description, amount, deadline } = body;
        // Note: In a real implementation, we would get the client address from the authenticated user
        const client = '0x123'; // Placeholder, would be replaced with actual client address
        return this.contractService.addMilestone(client, projectId, description, amount, deadline);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.FREELANCER)
    @Post('project/milestone/submit')
    async submitMilestone(
        @Body() body: { projectId: number; milestoneId: number; evidence: string }
    ) {
        const { projectId, milestoneId, evidence } = body;
        // Note: In a real implementation, we would get the worker address from the authenticated user
        const worker = '0x456'; // Placeholder, would be replaced with actual worker address
        return this.contractService.submitMilestone(worker, projectId, milestoneId, evidence);
    }

    @UseGuards(JwtAuthGuard)
    @Post('project/milestone/dispute')
    async disputeMilestone(
        @Body() body: { projectId: number; milestoneId: number }
    ) {
        const { projectId, milestoneId } = body;
        // Note: In a real implementation, we would get the address from the authenticated user
        const address = '0x123'; // Placeholder, would be replaced with actual user address
        return this.contractService.disputeMilestone(address, projectId, milestoneId);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Post('project/milestone/resolve-dispute')
    async resolveMilestoneDispute(
        @Body() body: { projectId: number; milestoneId: number; approveWork: boolean }
    ) {
        const { projectId, milestoneId, approveWork } = body;
        // Note: In a real implementation, we would get the admin address from the authenticated user
        const admin = '0x789'; // Placeholder, would be replaced with actual admin address
        return this.contractService.resolveMilestoneDispute(admin, projectId, milestoneId, approveWork);
    }

    @UseGuards(JwtAuthGuard)
    @Post('reviewer/register')
    async registerAsReviewer() {
        // Note: In a real implementation, we would get the address from the authenticated user
        const address = '0x123'; // Placeholder, would be replaced with actual user address
        return this.contractService.registerAsReviewer(address);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.REVIEWER)
    @Post('reviewer/vote')
    async voteOnMilestone(
        @Body() body: { projectId: number; milestoneId: number; approved: boolean }
    ) {
        const { projectId, milestoneId, approved } = body;
        // Note: In a real implementation, we would get the reviewer address from the authenticated user
        const reviewer = '0xabc'; // Placeholder, would be replaced with actual reviewer address
        return this.contractService.voteOnMilestone(reviewer, projectId, milestoneId, approved);
    }

    @Get('reviewer/:address/reputation')
    async getReviewerReputation(@Param('address') address: string) {
        return this.contractService.getReviewerReputation(address);
    }

    @Get('token/balance/:address')
    async getTokenBalance(@Param('address') address: string) {
        return this.contractService.getTokenBalance(address);
    }

    @UseGuards(JwtAuthGuard)
    @Post('token/transfer')
    async transferTokens(@Body() body: { to: string; amount: string }) {
        const { to, amount } = body;
        // Note: In a real implementation, we would get the from address from the authenticated user
        const from = '0x123'; // Placeholder, would be replaced with actual user address
        return this.contractService.transferTokens(from, to, amount);
    }
} 