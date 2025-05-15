import { Request, Response } from 'express';
import { supabase } from '../utils/supabase';

/**
 * Get all jobs with optional filtering
 */
export const getJobs = async (req: Request, res: Response) => {
    try {
        const { status, category, search, minBudget, maxBudget } = req.query;

        let query = supabase
            .from('jobs')
            .select('*');

        // Apply filters if provided
        if (status && status !== 'all') {
            query = query.eq('status', status);
        }

        if (category && category !== '') {
            query = query.eq('category', category);
        }

        if (search) {
            query = query.ilike('title', `%${search}%`);
        }

        if (minBudget && !isNaN(Number(minBudget))) {
            query = query.gte('budget', Number(minBudget));
        }

        if (maxBudget && !isNaN(Number(maxBudget))) {
            query = query.lte('budget', Number(maxBudget));
        }

        // Order by created_at
        query = query.order('created_at', { ascending: false });

        const { data, error } = await query;

        if (error) {
            console.error('Supabase error in getJobs:', error);
            return res.status(400).json({
                message: error.message
            });
        }

        if (!data || data.length === 0) {
            // If no jobs found, return empty array instead of error
            return res.status(200).json({ jobs: [] });
        }

        return res.status(200).json(data);
    } catch (error: any) {
        console.error('Get jobs error:', error);
        return res.status(500).json({
            message: 'Internal server error'
        });
    }
};

/**
 * Get a job by ID
 */
export const getJobById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Check if the ID is a mock ID (starts with 'mock-')
        if (id.startsWith('mock-')) {
            return res.status(404).json({
                message: 'Job not found'
            });
        }

        const { data, error } = await supabase
            .from('jobs')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Supabase error in getJobById:', error);
            return res.status(404).json({
                message: 'Job not found'
            });
        }

        return res.status(200).json(data);
    } catch (error: any) {
        console.error('Get job by ID error:', error);
        return res.status(500).json({
            message: 'Internal server error'
        });
    }
};

/**
 * Create a new job
 */
export const createJob = async (req: Request, res: Response) => {
    try {
        const { user } = req;
        const { title, description, budget, category, deadline } = req.body;

        // Validate required fields
        if (!title || !description || !budget || !category) {
            return res.status(400).json({
                message: 'Missing required fields: title, description, budget, category'
            });
        }

        // Get creator ID from user object or request body
        // Now handling wallet addresses as primary identifier
        let creatorId = user?.accountAddress || user?.id || req.body.creator_id;

        if (!creatorId) {
            return res.status(400).json({
                message: 'Creator ID or wallet address is required'
            });
        }

        // Validate that creatorId is a string, not an object
        if (typeof creatorId !== 'string') {
            // If creator_id is an object, try to extract the ID or address
            if (typeof creatorId === 'object' && creatorId !== null) {
                if (creatorId.accountAddress) {
                    // Extract wallet address if available
                    creatorId = creatorId.accountAddress;
                } else if (creatorId.id) {
                    // Fallback to id property
                    creatorId = creatorId.id;
                } else if (creatorId.data) {
                    // Use a default wallet-like format if we have a complex object
                    console.warn('Received complex creator_id object:', creatorId);
                    creatorId = '0x123456789abcdef123456789abcdef123456789abcdef';
                }
            } else {
                return res.status(400).json({
                    message: 'Invalid creator_id format'
                });
            }
        }

        // For old UUID format, convert to wallet-like format for consistency
        if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(creatorId)) {
            // Convert UUID to wallet-like format
            creatorId = '0x' + creatorId.replace(/-/g, '');
        }

        const jobData = {
            title,
            description,
            budget: parseFloat(budget.toString()),
            category,
            deadline,
            creator_id: creatorId,
            status: 'open'
        };

        console.log('Creating job with creator:', creatorId);

        const { data, error } = await supabase
            .from('jobs')
            .insert(jobData)
            .select();

        if (error) {
            console.error('Supabase error in createJob:', error);
            return res.status(400).json({
                message: error.message
            });
        }

        return res.status(201).json({
            message: 'Job created successfully',
            job: data[0]
        });
    } catch (error: any) {
        console.error('Create job error:', error);
        return res.status(500).json({
            message: 'Internal server error'
        });
    }
};

/**
 * Update a job
 */
export const updateJob = async (req: Request, res: Response) => {
    try {
        const { user } = req;
        const { id } = req.params;
        const { title, description, budget, category, deadline, status } = req.body;

        // Check if the job exists
        const { data: existingJob, error: fetchError } = await supabase
            .from('jobs')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError || !existingJob) {
            return res.status(404).json({
                message: 'Job not found'
            });
        }

        const creatorId = user?.id || user?.accountAddress || null;

        // Check if user is authorized to update this job (only if user info is available)
        if (creatorId && existingJob.creator_id !== creatorId) {
            return res.status(403).json({
                message: 'You are not authorized to update this job'
            });
        }

        // Update the job
        const { data, error } = await supabase
            .from('jobs')
            .update({
                title,
                description,
                budget,
                category,
                deadline,
                status,
                updated_at: new Date()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Supabase error in updateJob:', error);
            return res.status(400).json({
                message: error.message
            });
        }

        return res.status(200).json({
            message: 'Job updated successfully',
            job: data
        });
    } catch (error: any) {
        console.error('Update job error:', error);
        return res.status(500).json({
            message: 'Internal server error'
        });
    }
};

/**
 * Delete a job
 */
export const deleteJob = async (req: Request, res: Response) => {
    try {
        const { user } = req;
        const { id } = req.params;

        // Check if the job exists
        const { data: existingJob, error: fetchError } = await supabase
            .from('jobs')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError || !existingJob) {
            return res.status(404).json({
                message: 'Job not found'
            });
        }

        const creatorId = user?.id || user?.accountAddress || null;

        // Check if user is authorized to delete this job (only if user info is available)
        if (creatorId && existingJob.creator_id !== creatorId) {
            return res.status(403).json({
                message: 'You are not authorized to delete this job'
            });
        }

        // Delete the job
        const { error } = await supabase
            .from('jobs')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Supabase error in deleteJob:', error);
            return res.status(400).json({
                message: error.message
            });
        }

        return res.status(200).json({
            message: 'Job deleted successfully'
        });
    } catch (error: any) {
        console.error('Delete job error:', error);
        return res.status(500).json({
            message: 'Internal server error'
        });
    }
};

/**
 * Get milestones for a job
 */
export const getMilestones = async (req: Request, res: Response) => {
    try {
        const { jobId } = req.params;

        const { data, error } = await supabase
            .from('milestones')
            .select('*')
            .eq('job_id', jobId)
            .order('created_at', { ascending: true });

        if (error) {
            return res.status(400).json({
                message: error.message
            });
        }

        return res.status(200).json({ milestones: data });
    } catch (error) {
        console.error('Get milestones error:', error);
        return res.status(500).json({
            message: 'Internal server error'
        });
    }
};

/**
 * Create a milestone for a job
 */
export const createMilestone = async (req: Request, res: Response) => {
    try {
        const { user } = req;
        const { jobId } = req.params;
        const { title, description, amount, deadline } = req.body;

        // Validate required fields
        if (!title || !description || !amount) {
            return res.status(400).json({
                message: 'Missing required fields: title, description, amount'
            });
        }

        // Check if the job exists and belongs to the user
        const { data: existingJob, error: fetchError } = await supabase
            .from('jobs')
            .select('*')
            .eq('id', jobId)
            .single();

        if (fetchError || !existingJob) {
            return res.status(404).json({
                message: 'Job not found'
            });
        }

        if (existingJob.creator_id !== user.id) {
            return res.status(403).json({
                message: 'You are not authorized to create milestones for this job'
            });
        }

        const { data, error } = await supabase
            .from('milestones')
            .insert({
                title,
                description,
                amount,
                deadline,
                job_id: jobId,
                status: 'pending'
            })
            .select()
            .single();

        if (error) {
            return res.status(400).json({
                message: error.message
            });
        }

        return res.status(201).json({
            message: 'Milestone created successfully',
            milestone: data
        });
    } catch (error) {
        console.error('Create milestone error:', error);
        return res.status(500).json({
            message: 'Internal server error'
        });
    }
};

/**
 * Update a milestone
 */
export const updateMilestone = async (req: Request, res: Response) => {
    try {
        const { user } = req;
        const { id } = req.params;
        const { title, description, amount, deadline, status } = req.body;

        // Get the milestone and job info
        const { data: milestone, error: fetchError } = await supabase
            .from('milestones')
            .select('*, job:jobs(creator_id)')
            .eq('id', id)
            .single();

        if (fetchError || !milestone) {
            return res.status(404).json({
                message: 'Milestone not found'
            });
        }

        if (milestone.job.creator_id !== user.id) {
            return res.status(403).json({
                message: 'You are not authorized to update this milestone'
            });
        }

        // Update the milestone
        const { data, error } = await supabase
            .from('milestones')
            .update({
                title,
                description,
                amount,
                deadline,
                status,
                updated_at: new Date()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            return res.status(400).json({
                message: error.message
            });
        }

        return res.status(200).json({
            message: 'Milestone updated successfully',
            milestone: data
        });
    } catch (error) {
        console.error('Update milestone error:', error);
        return res.status(500).json({
            message: 'Internal server error'
        });
    }
};

/**
 * Delete a milestone
 */
export const deleteMilestone = async (req: Request, res: Response) => {
    try {
        const { user } = req;
        const { id } = req.params;

        // Get the milestone and job info
        const { data: milestone, error: fetchError } = await supabase
            .from('milestones')
            .select('*, job:jobs(creator_id)')
            .eq('id', id)
            .single();

        if (fetchError || !milestone) {
            return res.status(404).json({
                message: 'Milestone not found'
            });
        }

        if (milestone.job.creator_id !== user.id) {
            return res.status(403).json({
                message: 'You are not authorized to delete this milestone'
            });
        }

        // Delete the milestone
        const { error } = await supabase
            .from('milestones')
            .delete()
            .eq('id', id);

        if (error) {
            return res.status(400).json({
                message: error.message
            });
        }

        return res.status(200).json({
            message: 'Milestone deleted successfully'
        });
    } catch (error) {
        console.error('Delete milestone error:', error);
        return res.status(500).json({
            message: 'Internal server error'
        });
    }
}; 