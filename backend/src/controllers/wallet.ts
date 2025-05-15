import { Request, Response } from 'express';
import { supabase } from '../utils/supabase';

/**
 * Get jobs and milestones for a specific wallet address
 */
export const getWalletJobs = async (req: Request, res: Response) => {
    try {
        const { walletAddress } = req.params;

        if (!walletAddress) {
            return res.status(400).json({
                message: 'Wallet address is required'
            });
        }

        // Get jobs by wallet address
        const { data: jobs, error: jobsError } = await supabase.rpc(
            'get_jobs_by_wallet',
            { wallet_addr: walletAddress }
        );

        if (jobsError) {
            console.error('Error getting wallet jobs:', jobsError);
            return res.status(400).json({
                message: jobsError.message
            });
        }

        return res.status(200).json({ jobs });
    } catch (error: any) {
        console.error('Get wallet jobs error:', error);
        return res.status(500).json({
            message: 'Internal server error'
        });
    }
};

/**
 * Get milestones for a specific wallet address
 */
export const getWalletMilestones = async (req: Request, res: Response) => {
    try {
        const { walletAddress } = req.params;

        if (!walletAddress) {
            return res.status(400).json({
                message: 'Wallet address is required'
            });
        }

        // Get milestones by wallet address
        const { data: milestones, error: milestonesError } = await supabase.rpc(
            'get_milestones_by_wallet',
            { wallet_addr: walletAddress }
        );

        if (milestonesError) {
            console.error('Error getting wallet milestones:', milestonesError);
            return res.status(400).json({
                message: milestonesError.message
            });
        }

        return res.status(200).json({ milestones });
    } catch (error: any) {
        console.error('Get wallet milestones error:', error);
        return res.status(500).json({
            message: 'Internal server error'
        });
    }
};

/**
 * Get wallet transactions history
 */
export const getWalletTransactions = async (req: Request, res: Response) => {
    try {
        const { walletAddress } = req.params;

        if (!walletAddress) {
            return res.status(400).json({
                message: 'Wallet address is required'
            });
        }

        // Get transactions where wallet is sender or receiver
        const { data: transactions, error: transactionsError } = await supabase
            .from('transactions')
            .select('*')
            .or(`from_address.eq.${walletAddress},to_address.eq.${walletAddress}`)
            .order('created_at', { ascending: false });

        if (transactionsError) {
            console.error('Error getting wallet transactions:', transactionsError);
            return res.status(400).json({
                message: transactionsError.message
            });
        }

        return res.status(200).json({ transactions });
    } catch (error: any) {
        console.error('Get wallet transactions error:', error);
        return res.status(500).json({
            message: 'Internal server error'
        });
    }
};

/**
 * Process a milestone payment
 */
export const processMilestonePayment = async (req: Request, res: Response) => {
    try {
        const { milestoneId } = req.params;
        const { transactionHash, fromAddress, toAddress } = req.body;

        if (!milestoneId || !transactionHash || !fromAddress || !toAddress) {
            return res.status(400).json({
                message: 'Missing required fields: milestoneId, transactionHash, fromAddress, toAddress'
            });
        }

        // Get milestone details
        const { data: milestone, error: milestoneError } = await supabase
            .from('milestones')
            .select('*, job:jobs(creator_id, assignee_id)')
            .eq('id', milestoneId)
            .single();

        if (milestoneError || !milestone) {
            console.error('Error getting milestone:', milestoneError);
            return res.status(404).json({
                message: 'Milestone not found'
            });
        }

        // Verify that the fromAddress matches the job creator
        if (milestone.job.creator_id !== fromAddress) {
            return res.status(403).json({
                message: 'Transaction sender must be the job creator'
            });
        }

        // Create transaction record
        const { data: transaction, error: transactionError } = await supabase
            .from('transactions')
            .insert({
                milestone_id: milestoneId,
                from_address: fromAddress,
                to_address: toAddress,
                amount: milestone.amount,
                transaction_hash: transactionHash,
                status: 'completed'
            })
            .select()
            .single();

        if (transactionError) {
            console.error('Error creating transaction:', transactionError);
            return res.status(400).json({
                message: transactionError.message
            });
        }

        // Update milestone status to paid
        const { error: updateError } = await supabase
            .from('milestones')
            .update({
                status: 'paid',
                transaction_hash: transactionHash
            })
            .eq('id', milestoneId);

        if (updateError) {
            console.error('Error updating milestone status:', updateError);
            return res.status(400).json({
                message: updateError.message
            });
        }

        return res.status(200).json({
            message: 'Payment processed successfully',
            transaction
        });
    } catch (error: any) {
        console.error('Process payment error:', error);
        return res.status(500).json({
            message: 'Internal server error'
        });
    }
};

/**
 * Link wallet address to a user
 */
export const linkWalletToUser = async (req: Request, res: Response) => {
    try {
        const { user } = req;
        const { walletAddress } = req.body;

        if (!walletAddress) {
            return res.status(400).json({
                message: 'Wallet address is required'
            });
        }

        // Check if wallet is already linked to another user
        const { data: existingWallet, error: walletError } = await supabase
            .from('profiles')
            .select('user_id')
            .eq('wallet_address', walletAddress)
            .not('user_id', 'eq', user.id)
            .single();

        if (existingWallet) {
            return res.status(400).json({
                message: 'Wallet address is already linked to another user'
            });
        }

        // Get user profile
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (profileError && profileError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
            console.error('Error getting user profile:', profileError);
            return res.status(400).json({
                message: profileError.message
            });
        }

        let result;

        if (profile) {
            // Update existing profile
            const { data, error } = await supabase
                .from('profiles')
                .update({ wallet_address: walletAddress })
                .eq('user_id', user.id)
                .select()
                .single();

            if (error) {
                console.error('Error updating profile with wallet:', error);
                return res.status(400).json({
                    message: error.message
                });
            }

            result = data;
        } else {
            // Create new profile
            const { data, error } = await supabase
                .from('profiles')
                .insert({
                    user_id: user.id,
                    wallet_address: walletAddress
                })
                .select()
                .single();

            if (error) {
                console.error('Error creating profile with wallet:', error);
                return res.status(400).json({
                    message: error.message
                });
            }

            result = data;
        }

        return res.status(200).json({
            message: 'Wallet linked successfully',
            profile: result
        });
    } catch (error: any) {
        console.error('Link wallet error:', error);
        return res.status(500).json({
            message: 'Internal server error'
        });
    }
}; 