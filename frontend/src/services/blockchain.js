import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";

// Constants
const MODULE_ADDRESS = '0x4821c48de763368f2e7aeef5cfe101c9215289401eef61eb0ae5e5c38f9f3034';
const ESCROW_MODULE = `${MODULE_ADDRESS}::escrow`;
const NODE_URL = 'https://fullnode.testnet.aptoslabs.com/v1';

// Initialize Aptos client
const createAptosClient = () => {
    const aptosConfig = new AptosConfig({
        network: Network.TESTNET,
        fullnodeUrl: NODE_URL
    });
    return new Aptos(aptosConfig);
};

// Blockchain operations
export const blockchainService = {
    // Connect to wallet
    connectWallet: async () => {
        try {
            // Check if wallet adapter is available
            if (!window.aptos) {
                throw new Error('Aptos wallet adapter not found. Please install a compatible wallet extension.');
            }

            // Request connection
            const response = await window.aptos.connect();

            // Format the response
            return {
                address: response.address,
                publicKey: response.publicKey,
                isConnected: true
            };
        } catch (error) {
            console.error('Wallet connection error:', error);
            throw error;
        }
    },

    // Disconnect wallet
    disconnectWallet: async () => {
        try {
            if (window.aptos) {
                await window.aptos.disconnect();
            }
            return true;
        } catch (error) {
            console.error('Disconnect error:', error);
            throw error;
        }
    },

    // Create a new job with escrow funds
    createJob: async (walletAddress, jobData) => {
        try {
            const { freelancerAddress, milestoneAmounts, platform_address = MODULE_ADDRESS } = jobData;

            if (!walletAddress || !freelancerAddress || !milestoneAmounts || milestoneAmounts.length === 0) {
                throw new Error('Missing required job data');
            }

            // Convert amounts to u64 strings
            const milestone_amounts = milestoneAmounts.map(amount => amount.toString());

            // Create the transaction payload
            const payload = {
                function: `${ESCROW_MODULE}::create_job_with_funds`,
                type_arguments: ["0x1::aptos_coin::AptosCoin"],
                arguments: [
                    freelancerAddress,
                    milestone_amounts,
                    platform_address,
                    "3" // min_votes_required (default to 3)
                ]
            };

            // Send the transaction using the wallet adapter
            const transaction = await window.aptos.signAndSubmitTransaction(payload);

            // Wait for transaction confirmation
            const client = createAptosClient();
            const txnResult = await client.waitForTransaction({ txnHash: transaction.hash });

            return {
                success: true,
                transaction_hash: transaction.hash,
                result: txnResult
            };
        } catch (error) {
            console.error('Create job error:', error);
            throw error;
        }
    },

    // Submit work for a milestone
    submitWork: async (walletAddress, jobData) => {
        try {
            const { clientAddress, milestoneIndex, evidence } = jobData;

            if (!walletAddress || !clientAddress || milestoneIndex === undefined || !evidence) {
                throw new Error('Missing required submission data');
            }

            // Create the transaction payload
            const payload = {
                function: `${ESCROW_MODULE}::submit_work`,
                type_arguments: [],
                arguments: [
                    clientAddress,
                    milestoneIndex.toString(),
                    evidence
                ]
            };

            // Send the transaction
            const transaction = await window.aptos.signAndSubmitTransaction(payload);

            // Wait for transaction confirmation
            const client = createAptosClient();
            const txnResult = await client.waitForTransaction({ txnHash: transaction.hash });

            return {
                success: true,
                transaction_hash: transaction.hash,
                result: txnResult
            };
        } catch (error) {
            console.error('Submit work error:', error);
            throw error;
        }
    },

    // Approve a milestone
    approveMilestone: async (walletAddress, jobData) => {
        try {
            const { freelancerAddress, milestoneIndex } = jobData;

            if (!walletAddress || !freelancerAddress || milestoneIndex === undefined) {
                throw new Error('Missing required approval data');
            }

            // Create the transaction payload
            const payload = {
                function: `${ESCROW_MODULE}::approve_milestone`,
                type_arguments: [],
                arguments: [
                    freelancerAddress,
                    milestoneIndex.toString()
                ]
            };

            // Send the transaction
            const transaction = await window.aptos.signAndSubmitTransaction(payload);

            // Wait for transaction confirmation
            const client = createAptosClient();
            const txnResult = await client.waitForTransaction({ txnHash: transaction.hash });

            return {
                success: true,
                transaction_hash: transaction.hash,
                result: txnResult
            };
        } catch (error) {
            console.error('Approve milestone error:', error);
            throw error;
        }
    },

    // Start a dispute for a milestone
    startDispute: async (walletAddress, jobData) => {
        try {
            const { freelancerAddress, milestoneIndex } = jobData;

            if (!walletAddress || !freelancerAddress || milestoneIndex === undefined) {
                throw new Error('Missing required dispute data');
            }

            // Create the transaction payload
            const payload = {
                function: `${ESCROW_MODULE}::start_dispute`,
                type_arguments: [],
                arguments: [
                    freelancerAddress,
                    milestoneIndex.toString()
                ]
            };

            // Send the transaction
            const transaction = await window.aptos.signAndSubmitTransaction(payload);

            // Wait for transaction confirmation
            const client = createAptosClient();
            const txnResult = await client.waitForTransaction({ txnHash: transaction.hash });

            return {
                success: true,
                transaction_hash: transaction.hash,
                result: txnResult
            };
        } catch (error) {
            console.error('Start dispute error:', error);
            throw error;
        }
    },

    // Assign reviewers to a disputed milestone
    assignReviewers: async (walletAddress, jobData) => {
        try {
            const { clientAddress, milestoneIndex, reviewers } = jobData;

            if (!walletAddress || !clientAddress || milestoneIndex === undefined || !reviewers || reviewers.length < 5) {
                throw new Error('Missing required reviewer data (need 5 reviewers)');
            }

            // Create the transaction payload
            const payload = {
                function: `${ESCROW_MODULE}::assign_five_reviewers`,
                type_arguments: [],
                arguments: [
                    clientAddress,
                    milestoneIndex.toString(),
                    reviewers[0],
                    reviewers[1],
                    reviewers[2],
                    reviewers[3],
                    reviewers[4]
                ]
            };

            // Send the transaction
            const transaction = await window.aptos.signAndSubmitTransaction(payload);

            // Wait for transaction confirmation
            const client = createAptosClient();
            const txnResult = await client.waitForTransaction({ txnHash: transaction.hash });

            return {
                success: true,
                transaction_hash: transaction.hash,
                result: txnResult
            };
        } catch (error) {
            console.error('Assign reviewers error:', error);
            throw error;
        }
    },

    // Cast a vote as a reviewer
    castVote: async (walletAddress, jobData) => {
        try {
            const { clientAddress, milestoneIndex, vote } = jobData;

            if (!walletAddress || !clientAddress || milestoneIndex === undefined || vote === undefined) {
                throw new Error('Missing required vote data');
            }

            // Vote options: 1 = approve, 2 = reject
            if (vote !== 1 && vote !== 2) {
                throw new Error('Invalid vote option (must be 1 for approve or 2 for reject)');
            }

            // Create the transaction payload
            const payload = {
                function: `${ESCROW_MODULE}::cast_vote`,
                type_arguments: [],
                arguments: [
                    clientAddress,
                    milestoneIndex.toString(),
                    vote.toString()
                ]
            };

            // Send the transaction
            const transaction = await window.aptos.signAndSubmitTransaction(payload);

            // Wait for transaction confirmation
            const client = createAptosClient();
            const txnResult = await client.waitForTransaction({ txnHash: transaction.hash });

            return {
                success: true,
                transaction_hash: transaction.hash,
                result: txnResult
            };
        } catch (error) {
            console.error('Cast vote error:', error);
            throw error;
        }
    },

    // Get job details from the blockchain
    getJobDetails: async (clientAddress) => {
        try {
            if (!clientAddress) {
                throw new Error('Client address is required');
            }

            const client = createAptosClient();

            // Try to get job resources
            try {
                const jobResource = await client.getAccountResource({
                    accountAddress: clientAddress,
                    resourceType: `${ESCROW_MODULE}::Job`
                });

                if (jobResource && jobResource.data) {
                    // Process the job data
                    const jobData = jobResource.data;

                    // Convert numeric values
                    const processedJob = {
                        client: jobData.client,
                        freelancer: jobData.freelancer,
                        current_step: Number(jobData.current_step),
                        is_active: jobData.is_active,
                        platform_address: jobData.platform_address,
                        min_votes_required: Number(jobData.min_votes_required),
                        total_milestones: Number(jobData.total_milestones),
                        escrow_address: jobData.escrow_address,
                        total_fee_reserved: Number(jobData.total_fee_reserved),
                        had_dispute: jobData.had_dispute,
                        milestones: []
                    };

                    // Process milestones
                    if (jobData.milestones && Array.isArray(jobData.milestones)) {
                        processedJob.milestones = jobData.milestones.map(m => ({
                            description: m.description,
                            amount: Number(m.amount),
                            status: Number(m.status),
                            submission_evidence: m.submission_evidence,
                            reviewers: m.reviewers || [],
                            votes: (m.votes || []).map(v => ({
                                reviewer: v.reviewer,
                                vote: Number(v.vote)
                            })),
                            was_disputed: m.was_disputed
                        }));
                    }

                    return processedJob;
                }
            } catch (resourceError) {
                console.error('Error getting job resource:', resourceError);
                // Job not found
            }

            // Try view function approach as a fallback
            try {
                const viewResponse = await client.view({
                    payload: {
                        function: `${ESCROW_MODULE}::get_job_details`,
                        typeArguments: [],
                        functionArguments: [clientAddress]
                    }
                });

                if (viewResponse && viewResponse.length >= 7) {
                    const jobClient = viewResponse[0];
                    const jobFreelancer = viewResponse[1];

                    // Create a job object from the view function results
                    const job = {
                        client: jobClient,
                        freelancer: jobFreelancer,
                        current_step: Number(viewResponse[2]),
                        total_milestones: Number(viewResponse[3]),
                        is_active: viewResponse[4],
                        platform_address: viewResponse[5],
                        escrow_address: viewResponse[6],
                        milestones: []
                    };

                    // Now fetch milestone details for each milestone
                    for (let i = 0; i < job.total_milestones; i++) {
                        try {
                            const milestoneResult = await client.view({
                                payload: {
                                    function: `${ESCROW_MODULE}::get_milestone_details`,
                                    typeArguments: [],
                                    functionArguments: [jobClient, i.toString()]
                                }
                            });

                            if (milestoneResult && milestoneResult.length >= 4) {
                                job.milestones.push({
                                    description: milestoneResult[0],
                                    amount: Number(milestoneResult[1]),
                                    status: Number(milestoneResult[2]),
                                    submission_evidence: milestoneResult[3],
                                    reviewers: milestoneResult[4] || [],
                                    votes: (milestoneResult[5] || []).map(v => ({
                                        reviewer: v[0],
                                        vote: Number(v[1])
                                    })),
                                    was_disputed: milestoneResult[6] || false
                                });
                            }
                        } catch (milestoneErr) {
                            console.error(`Error fetching milestone ${i}:`, milestoneErr);
                        }
                    }

                    return job;
                }
            } catch (viewError) {
                console.error('Error using view functions:', viewError);
            }

            // If we get here, we couldn't find the job
            return null;
        } catch (error) {
            console.error('Get job details error:', error);
            throw error;
        }
    }
};

export default blockchainService; 