"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobMapper = void 0;
class JobMapper {
    static toDto(job) {
        var _a, _b, _c;
        if (!job)
            return null;
        const milestones = ((_a = job.milestones) === null || _a === void 0 ? void 0 : _a.map(milestone => ({
            title: milestone.title,
            description: milestone.description,
            amount: milestone.amount,
            dueDate: milestone.dueDate,
            isCompleted: milestone.isCompleted,
            completedDate: milestone.completedDate,
            evidenceUrls: milestone.evidenceUrls || [],
            reviewers: Array.isArray(milestone.reviewers)
                ? milestone.reviewers.map(reviewer => ({
                    id: reviewer.toString(),
                }))
                : [],
            reviews: Array.isArray(milestone.reviews)
                ? milestone.reviews.map(review => ({
                    reviewer: {
                        id: review.reviewer.toString(),
                    },
                    approved: review.approved,
                    feedback: review.feedback,
                    timestamp: review.timestamp,
                }))
                : [],
            transactionHash: milestone.transactionHash,
        }))) || [];
        return {
            id: job._id.toString(),
            title: job.title,
            description: job.description,
            client: job.client ? {
                id: typeof job.client === 'string' ? job.client : (_b = job.client._id) === null || _b === void 0 ? void 0 : _b.toString(),
                name: typeof job.client === 'object' ? job.client.name : undefined,
                email: typeof job.client === 'object' ? job.client.email : undefined,
                walletAddress: typeof job.client === 'object' ? job.client.walletAddress : undefined,
                reputation: typeof job.client === 'object' ? job.client.reputation : undefined,
            } : null,
            freelancer: job.freelancer ? {
                id: typeof job.freelancer === 'string' ? job.freelancer : (_c = job.freelancer._id) === null || _c === void 0 ? void 0 : _c.toString(),
                name: typeof job.freelancer === 'object' ? job.freelancer.name : undefined,
                email: typeof job.freelancer === 'object' ? job.freelancer.email : undefined,
                walletAddress: typeof job.freelancer === 'object' ? job.freelancer.walletAddress : undefined,
                reputation: typeof job.freelancer === 'object' ? job.freelancer.reputation : undefined,
            } : null,
            status: job.status,
            milestones: milestones,
            escrowAddress: job.escrowAddress,
            contractAddress: job.contractAddress,
            totalAmount: job.totalAmount,
            totalPaid: job.totalPaid || 0,
            skills: job.skills || [],
            createdAt: job.createdAt,
            updatedAt: job.updatedAt,
        };
    }
    static toDtoList(jobs) {
        return jobs.map(job => this.toDto(job));
    }
}
exports.JobMapper = JobMapper;
//# sourceMappingURL=job.mapper.js.map