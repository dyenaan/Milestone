module escrow::escrow {
    // Import required modules
    use std::signer;         // For account address operations
    use std::vector;         // For array operations
    use aptos_framework::event;    // For event handling
    use aptos_framework::account;  // For account operations and event handle creation
    use std::error;          // For custom error codes
    
    // ----------------- CONSTANTS -----------------
    
    /// Vote options for reviewers
    const VOTE_APPROVE: u8 = 1;
    const VOTE_REJECT: u8 = 2;
    
    /// Status constants for milestones
    const STATUS_PENDING: u8 = 0;
    const STATUS_SUBMITTED: u8 = 1;
    const STATUS_APPROVED: u8 = 2;
    const STATUS_REJECTED: u8 = 3;
    const STATUS_IN_DISPUTE: u8 = 4;
    
    /// Dispute constants
    const NUM_REVIEWERS_REQUIRED: u64 = 5; // Always require 5 reviewers
    const MIN_VOTES_REQUIRED: u64 = 3;     // 3/5 majority rule
    
    /// Error codes
    const ERROR_NOT_FREELANCER: u64 = 1;
    const ERROR_INVALID_MILESTONE: u64 = 2;
    const ERROR_INVALID_STATUS: u64 = 3;
    const ERROR_NOT_PLATFORM: u64 = 4;
    const ERROR_NOT_REVIEWER: u64 = 5;
    const ERROR_ALREADY_VOTED: u64 = 6;
    const ERROR_JOB_NOT_FOUND: u64 = 7;
    const ERROR_MILESTONE_NOT_IN_DISPUTE: u64 = 8;
    const ERROR_JOB_EXISTS: u64 = 9;
    const ERROR_INVALID_REVIEWER_COUNT: u64 = 10;
    
    // ----------------- DATA STRUCTURES -----------------
    
    /// Represents a reviewer's vote
    struct Vote has store, drop, copy {
        reviewer: address,
        vote: u8,  // 1 = approve, 2 = reject
    }
    
    /// Represents an individual milestone in the job
    struct Milestone has store, drop, copy {
        description: vector<u8>,
        amount: u64,
        status: u8,  // Use status constants
        submission_evidence: vector<u8>,  // Evidence URL or hash
        reviewers: vector<address>,  // List of assigned reviewers
        votes: vector<Vote>,  // Votes from reviewers
    }
    
    /// Main job structure stored on-chain under the client's account
    struct Job has key, store {
        client: address,
        freelancer: address,
        milestones: vector<Milestone>,
        current_step: u64,
        is_active: bool,
        platform_address: address,  // Address of your platform
        min_votes_required: u64,    // Votes needed for decision (typically 3)
        total_milestones: u64,      // Total number of milestones
    }
    
    /// Event payload emitted when a milestone is approved
    struct MilestoneApprovedEvent has drop, store {
        client: address,
        freelancer: address,
        milestone_index: u64,
        amount: u64,
    }
    
    /// Event payload emitted when work is submitted
    struct WorkSubmittedEvent has drop, store {
        client: address,
        freelancer: address,
        milestone_index: u64,
        evidence: vector<u8>,
    }
    
    /// Event payload emitted when a dispute is started
    struct DisputeStartedEvent has drop, store {
        client: address,
        freelancer: address,
        milestone_index: u64,
    }
    
    /// Event payload emitted when reviewers are assigned
    struct ReviewersAssignedEvent has drop, store {
        client: address,
        freelancer: address,
        milestone_index: u64,
        reviewers: vector<address>,
    }
    
    /// Event payload emitted when a vote is cast
    struct VoteCastEvent has drop, store {
        client: address,
        freelancer: address,
        milestone_index: u64,
        reviewer: address,
        vote: u8,
    }
    
    /// Event payload emitted when a job is completed
    struct JobCompletedEvent has drop, store {
        client: address,
        freelancer: address,
        total_amount: u64,
    }
    
    /// Resource for storing event handles
    struct EscrowEvents has key {
        milestone_approved: event::EventHandle<MilestoneApprovedEvent>,
        work_submitted: event::EventHandle<WorkSubmittedEvent>,
        dispute_started: event::EventHandle<DisputeStartedEvent>,
        reviewers_assigned: event::EventHandle<ReviewersAssignedEvent>,
        vote_cast: event::EventHandle<VoteCastEvent>,
        job_completed: event::EventHandle<JobCompletedEvent>,
    }
    
    // ----------------- PUBLIC FUNCTIONS -----------------
    
    // Add a simple test function to directly create a job
    public entry fun test_create_job(
        account: &signer, 
        freelancer: address,
        platform_address: address,
        min_votes_required: u64
    ) {
        let sender_addr = signer::address_of(account);
        
        // Check if Job already exists
        assert!(!exists<Job>(sender_addr), error::already_exists(ERROR_JOB_EXISTS));
        
        // Create three milestones with amount 100 each
        let milestones = vector::empty<Milestone>();
        
        // Add milestones
        vector::push_back(&mut milestones, Milestone {
            description: b"Step 1",
            amount: 100,
            status: STATUS_PENDING,
            submission_evidence: vector::empty<u8>(),
            reviewers: vector::empty<address>(),
            votes: vector::empty<Vote>(),
        });
        
        vector::push_back(&mut milestones, Milestone {
            description: b"Step 2",
            amount: 100,
            status: STATUS_PENDING,
            submission_evidence: vector::empty<u8>(),
            reviewers: vector::empty<address>(),
            votes: vector::empty<Vote>(),
        });
        
        vector::push_back(&mut milestones, Milestone {
            description: b"Step 3",
            amount: 100,
            status: STATUS_PENDING,
            submission_evidence: vector::empty<u8>(),
            reviewers: vector::empty<address>(),
            votes: vector::empty<Vote>(),
        });
        
        // Create and store the job
        let job = Job {
            client: sender_addr,
            freelancer,
            milestones,
            current_step: 0,
            is_active: true,
            platform_address,
            min_votes_required,
            total_milestones: 3,
        };
        
        move_to(account, job);
    }
    
    /// Initializes event storage for an account
    /// Must be called once before approving milestones
    public entry fun init_events(account: &signer) {
        if (!exists<EscrowEvents>(signer::address_of(account))) {
            move_to(account, EscrowEvents {
                milestone_approved: account::new_event_handle<MilestoneApprovedEvent>(account),
                work_submitted: account::new_event_handle<WorkSubmittedEvent>(account),
                dispute_started: account::new_event_handle<DisputeStartedEvent>(account),
                reviewers_assigned: account::new_event_handle<ReviewersAssignedEvent>(account),
                vote_cast: account::new_event_handle<VoteCastEvent>(account),
                job_completed: account::new_event_handle<JobCompletedEvent>(account),
            });
        }
    }
    
    /// Creates a new job with specified milestones
    public entry fun create_job(
        account: &signer,
        freelancer: address,
        milestone_amounts: vector<u64>,
        platform_address: address,
        min_votes_required: u64
    ) {
        let sender_addr = signer::address_of(account);
        
        // Check if Job already exists
        assert!(!exists<Job>(sender_addr), error::already_exists(ERROR_JOB_EXISTS));
        
        // Create an empty vector to store milestones
        let milestones = vector::empty<Milestone>();
        let i = 0;
        let total_milestones = vector::length(&milestone_amounts);
        
        // Iterate through milestone amounts and create milestone objects
        while (i < total_milestones) {
            let amount = *vector::borrow(&milestone_amounts, i);
            vector::push_back(&mut milestones, Milestone {
                description: b"Step",  // Default description
                amount,
                status: STATUS_PENDING,
                submission_evidence: vector::empty<u8>(),
                reviewers: vector::empty<address>(),
                votes: vector::empty<Vote>(),
            });
            i = i + 1;
        };
        
        // Create the job structure
        let job = Job {
            client: sender_addr,
            freelancer,
            milestones,
            current_step: 0,  // Start with the first milestone
            is_active: true,
            platform_address,  // Explicitly use the provided platform address
            min_votes_required,
            total_milestones,
        };
        
        // Store the job in the client's account storage
        move_to(account, job);
    }
    
    /// Function for freelancer to submit work for a milestone
    public entry fun submit_work(
        account: &signer,
        client: address,
        milestone_index: u64,
        evidence: vector<u8>
    ) acquires Job, EscrowEvents {
        let freelancer_addr = signer::address_of(account);
        
        // Get job from client's address
        assert!(exists<Job>(client), error::not_found(ERROR_JOB_NOT_FOUND));
        let job = borrow_global_mut<Job>(client);
        
        // Verify the sender is the freelancer
        assert!(job.freelancer == freelancer_addr, error::permission_denied(ERROR_NOT_FREELANCER));
        
        // Verify milestone index is valid
        assert!(milestone_index < vector::length(&job.milestones), error::invalid_argument(ERROR_INVALID_MILESTONE));
        
        // Get the milestone and update it
        let milestone = vector::borrow_mut(&mut job.milestones, milestone_index);
        assert!(milestone.status == STATUS_PENDING, error::invalid_state(ERROR_INVALID_STATUS));
        
        milestone.status = STATUS_SUBMITTED;
        milestone.submission_evidence = evidence;
        
        // Emit work submitted event
        let events = borrow_global_mut<EscrowEvents>(client);
        event::emit_event(
            &mut events.work_submitted,
            WorkSubmittedEvent {
                client,
                freelancer: freelancer_addr,
                milestone_index,
                evidence,
            }
        );
    }
    
    /// Function for client to directly approve a milestone (no dispute)
    public entry fun approve_milestone(account: &signer) acquires Job, EscrowEvents {
        // Get the account address
        let addr = signer::address_of(account);
        
        // Retrieve the job from global storage
        let job = borrow_global_mut<Job>(addr);
        let i = job.current_step;
        
        // Get the milestone
        let milestone = vector::borrow_mut(&mut job.milestones, i);
        
        // Update the milestone status
        milestone.status = STATUS_APPROVED;
        
        // Move to the next milestone
        job.current_step = i + 1;
        
        // Get the events resource
        let events = borrow_global_mut<EscrowEvents>(addr);
        
        // Emit the milestone approval event
        event::emit_event(
            &mut events.milestone_approved,
            MilestoneApprovedEvent {
                client: job.client,
                freelancer: job.freelancer,
                milestone_index: i,
                amount: milestone.amount,
            }
        );
        
        // Check if this was the last milestone and emit JobCompletedEvent if so
        if (job.current_step == job.total_milestones) {
            // Calculate total amount paid
            let total_amount = 0u64;
            let index = 0u64;
            while (index < job.total_milestones) {
                let milestone = vector::borrow(&job.milestones, index);
                if (milestone.status == STATUS_APPROVED) {
                    total_amount = total_amount + milestone.amount;
                };
                index = index + 1;
            };
            
            // Emit job completed event
            event::emit_event(
                &mut events.job_completed,
                JobCompletedEvent {
                    client: job.client,
                    freelancer: job.freelancer,
                    total_amount,
                }
            );
        };
    }
    
    /// Function for freelancer to initiate a dispute
    public entry fun start_dispute(
        account: &signer,
        client: address,
        milestone_index: u64
    ) acquires Job, EscrowEvents {
        let freelancer_addr = signer::address_of(account);
        
        // Get job from client's address
        assert!(exists<Job>(client), error::not_found(ERROR_JOB_NOT_FOUND));
        let job = borrow_global_mut<Job>(client);
        
        // Verify the sender is the freelancer
        assert!(job.freelancer == freelancer_addr, error::permission_denied(ERROR_NOT_FREELANCER));
        
        // Verify milestone index is valid
        assert!(milestone_index < vector::length(&job.milestones), error::invalid_argument(ERROR_INVALID_MILESTONE));
        
        // Get the milestone
        let milestone = vector::borrow_mut(&mut job.milestones, milestone_index);
        
        // Verify milestone is in submitted state
        assert!(milestone.status == STATUS_SUBMITTED, error::invalid_state(ERROR_INVALID_STATUS));
        
        // Update to in dispute status
        milestone.status = STATUS_IN_DISPUTE;
        
        // Emit dispute started event
        let events = borrow_global_mut<EscrowEvents>(client);
        event::emit_event(
            &mut events.dispute_started,
            DisputeStartedEvent {
                client,
                freelancer: freelancer_addr,
                milestone_index,
            }
        );
    }
    
    /// Function for platform to assign reviewers to a disputed milestone
    public entry fun assign_reviewers(
        account: &signer,
        client: address,
        milestone_index: u64,
        reviewers: vector<address>
    ) acquires Job, EscrowEvents {
        let platform_addr = signer::address_of(account);
        
        // Get job from client's address
        assert!(exists<Job>(client), error::not_found(ERROR_JOB_NOT_FOUND));
        let job = borrow_global_mut<Job>(client);
        
        // Verify the sender is the platform
        assert!(job.platform_address == platform_addr, error::permission_denied(ERROR_NOT_PLATFORM));
        
        // Verify milestone index is valid
        assert!(milestone_index < vector::length(&job.milestones), error::invalid_argument(ERROR_INVALID_MILESTONE));
        
        // Verify we have exactly 5 reviewers
        assert!(vector::length(&reviewers) == NUM_REVIEWERS_REQUIRED, error::invalid_argument(ERROR_INVALID_REVIEWER_COUNT));
        
        // Get the milestone
        let milestone = vector::borrow_mut(&mut job.milestones, milestone_index);
        
        // Verify milestone is in dispute
        assert!(milestone.status == STATUS_IN_DISPUTE, error::invalid_state(ERROR_MILESTONE_NOT_IN_DISPUTE));
        
        // Set reviewers
        milestone.reviewers = reviewers;
        
        // Emit reviewers assigned event
        let events = borrow_global_mut<EscrowEvents>(client);
        event::emit_event(
            &mut events.reviewers_assigned,
            ReviewersAssignedEvent {
                client,
                freelancer: job.freelancer,
                milestone_index,
                reviewers,
            }
        );
    }
    
    /// Function for reviewers to vote on a milestone
    public entry fun cast_vote(
        account: &signer,
        client: address,
        milestone_index: u64,
        vote_value: u8
    ) acquires Job, EscrowEvents {
        let reviewer_addr = signer::address_of(account);
        
        // Get job from client's address
        assert!(exists<Job>(client), error::not_found(ERROR_JOB_NOT_FOUND));
        let job = borrow_global_mut<Job>(client);
        
        // Verify milestone index is valid
        assert!(milestone_index < vector::length(&job.milestones), error::invalid_argument(ERROR_INVALID_MILESTONE));
        
        // Get the milestone
        let milestone = vector::borrow_mut(&mut job.milestones, milestone_index);
        
        // Verify milestone is in dispute
        assert!(milestone.status == STATUS_IN_DISPUTE, error::invalid_state(ERROR_MILESTONE_NOT_IN_DISPUTE));
        
        // Verify reviewer is assigned to this milestone
        let i = 0;
        let is_reviewer = false;
        while (i < vector::length(&milestone.reviewers)) {
            if (*vector::borrow(&milestone.reviewers, i) == reviewer_addr) {
                is_reviewer = true;
                break;
            };
            i = i + 1;
        };
        assert!(is_reviewer, error::permission_denied(ERROR_NOT_REVIEWER));
        
        // Verify reviewer hasn't already voted
        i = 0;
        while (i < vector::length(&milestone.votes)) {
            let existing_vote = vector::borrow(&milestone.votes, i);
            assert!(existing_vote.reviewer != reviewer_addr, error::invalid_state(ERROR_ALREADY_VOTED));
            i = i + 1;
        };
        
        // Add the vote
        vector::push_back(&mut milestone.votes, Vote {
            reviewer: reviewer_addr,
            vote: vote_value
        });
        
        // Emit vote cast event
        let events = borrow_global_mut<EscrowEvents>(client);
        event::emit_event(
            &mut events.vote_cast,
            VoteCastEvent {
                client,
                freelancer: job.freelancer,
                milestone_index,
                reviewer: reviewer_addr,
                vote: vote_value
            }
        );
        
        // Check if we have enough votes for decision
        if (vector::length(&milestone.votes) >= job.min_votes_required) {
            // Count votes
            let approve_count = 0;
            let reject_count = 0;
            i = 0;
            while (i < vector::length(&milestone.votes)) {
                let vote = vector::borrow(&milestone.votes, i);
                if (vote.vote == VOTE_APPROVE) {
                    approve_count = approve_count + 1;
                } else if (vote.vote == VOTE_REJECT) {
                    reject_count = reject_count + 1;
                };
                i = i + 1;
            };
            
            // Make decision based on majority rule (3/5)
            if (approve_count >= MIN_VOTES_REQUIRED) {
                milestone.status = STATUS_APPROVED;
                
                // Emit milestone approved event to trigger payment
                event::emit_event(
                    &mut events.milestone_approved,
                    MilestoneApprovedEvent {
                        client,
                        freelancer: job.freelancer,
                        milestone_index,
                        amount: milestone.amount
                    }
                );
                
                // Move to next milestone if this is the current one
                if (milestone_index == job.current_step) {
                    job.current_step = job.current_step + 1;
                    
                    // Check if this completes the job
                    if (job.current_step == job.total_milestones) {
                        // Calculate total amount paid
                        let total_amount = 0u64;
                        let index = 0u64;
                        while (index < job.total_milestones) {
                            let milestone = vector::borrow(&job.milestones, index);
                            if (milestone.status == STATUS_APPROVED) {
                                total_amount = total_amount + milestone.amount;
                            };
                            index = index + 1;
                        };
                        
                        // Emit job completed event
                        event::emit_event(
                            &mut events.job_completed,
                            JobCompletedEvent {
                                client,
                                freelancer: job.freelancer,
                                total_amount,
                            }
                        );
                    };
                };
            } else if (reject_count >= MIN_VOTES_REQUIRED) {
                milestone.status = STATUS_REJECTED;
                // No payment event emitted
            };
            // If neither reaches MIN_VOTES_REQUIRED votes, keep in dispute status
        };
    }
    
    /// Remove a completed job
    /// Remove a completed job
    public entry fun remove_job(account: &signer) acquires Job {
        let sender_addr = signer::address_of(account);
        
        // Verify Job exists
        assert!(exists<Job>(sender_addr), error::not_found(ERROR_JOB_NOT_FOUND));
        
        // Get the job
        let job = borrow_global<Job>(sender_addr);
        
        // Verify all milestones are completed
        assert!(job.current_step >= job.total_milestones, error::invalid_state(ERROR_INVALID_STATUS));
        
        // Remove the job and explicitly drop all its fields
        let Job { 
            client: _,
            freelancer: _,
            milestones: _,
            current_step: _,
            is_active: _,
            platform_address: _,
            min_votes_required: _,
            total_milestones: _
        } = move_from<Job>(sender_addr);
        
        // We don't need to do anything with the fields, they will be dropped
    }
    
    /// Get job details
    public fun get_job_details(addr: address): (
        address,  // client
        address,  // freelancer
        u64,      // current_step
        u64,      // total_milestones
        bool,     // is_active
        address   // platform_address
    ) acquires Job {
        // Verify Job exists
        assert!(exists<Job>(addr), error::not_found(ERROR_JOB_NOT_FOUND));
        
        // Get the job
        let job = borrow_global<Job>(addr);
        
        (
            job.client,
            job.freelancer,
            job.current_step,
            job.total_milestones,
            job.is_active,
            job.platform_address
        )
    }
    
    /// Get milestone details
    public fun get_milestone_details(
        addr: address,
        milestone_index: u64
    ): (
        vector<u8>,  // description
        u64,         // amount
        u8,          // status
        vector<u8>   // submission_evidence
    ) acquires Job {
        // Verify Job exists
        assert!(exists<Job>(addr), error::not_found(ERROR_JOB_NOT_FOUND));
        
        // Get the job
        let job = borrow_global<Job>(addr);
        
        // Verify milestone index is valid
        assert!(milestone_index < vector::length(&job.milestones), error::invalid_argument(ERROR_INVALID_MILESTONE));
        
        // Get the milestone
        let milestone = vector::borrow(&job.milestones, milestone_index);
        
        (
            milestone.description,
            milestone.amount,
            milestone.status,
            milestone.submission_evidence
        )
    }
}