module mq3k::escrow {
    use std::signer;
    use std::string::{Self, String};
    use std::vector;
    use aptos_framework::account;
    use aptos_framework::coin;
    use aptos_framework::timestamp;
    use mq3k::token::{Self, MQ3KToken};

    //
    // Errors
    //
    const E_NOT_INITIALIZED: u64 = 1;
    const E_ALREADY_INITIALIZED: u64 = 2;
    const E_NOT_AUTHORIZED: u64 = 3;
    const E_PROJECT_NOT_FOUND: u64 = 4;
    const E_MILESTONE_NOT_FOUND: u64 = 5;
    const E_INVALID_STATE: u64 = 6;
    const E_INSUFFICIENT_FUNDS: u64 = 7;
    const E_DEADLINE_PASSED: u64 = 8;
    const E_INVALID_AMOUNT: u64 = 9;
    const E_NOT_ENOUGH_APPROVALS: u64 = 10;
    const E_ALREADY_VOTED: u64 = 11;
    const E_NOT_A_REVIEWER: u64 = 12;

    //
    // Project and milestone status constants
    //
    const PROJECT_STATUS_CREATED: u8 = 0;
    const PROJECT_STATUS_FUNDED: u8 = 1;
    const PROJECT_STATUS_IN_PROGRESS: u8 = 2;
    const PROJECT_STATUS_COMPLETED: u8 = 3;
    const PROJECT_STATUS_CANCELLED: u8 = 4;

    const MILESTONE_STATUS_CREATED: u8 = 0;
    const MILESTONE_STATUS_IN_PROGRESS: u8 = 1;
    const MILESTONE_STATUS_SUBMITTED: u8 = 2;
    const MILESTONE_STATUS_APPROVED: u8 = 3;
    const MILESTONE_STATUS_REJECTED: u8 = 4;
    const MILESTONE_STATUS_PAID: u8 = 5;

    //
    // Structs
    //
    struct ProjectConfig has key {
        admin: address,
        next_project_id: u64,
        min_approvals: u8,
        platform_fee_percentage: u8,
        reviewers: vector<address>,
    }

    struct Project has store {
        id: u64,
        client: address,
        worker: address,
        deadline: u64,
        status: u8,
        milestones: vector<Milestone>,
        total_amount: u64,
        funded_amount: u64,
        creation_time: u64,
    }

    struct Milestone has store, drop, copy {
        id: u64,
        description: String,
        amount: u64,
        deadline: u64,
        status: u8,
        evidence: String,
        approvals: vector<address>,
        rejections: vector<address>,
    }

    struct Projects has key {
        projects: vector<Project>,
    }

    struct ReviewerRegistry has key {
        reviewers: vector<address>,
    }

    //
    // Public functions
    //

    /// Initialize the escrow module
    public entry fun initialize(admin: &signer, min_approvals: u8, platform_fee_percentage: u8) {
        let admin_addr = signer::address_of(admin);
        
        assert!(!exists<ProjectConfig>(admin_addr), E_ALREADY_INITIALIZED);
        
        move_to(admin, ProjectConfig {
            admin: admin_addr,
            next_project_id: 0,
            min_approvals,
            platform_fee_percentage,
            reviewers: vector::empty<address>(),
        });
        
        move_to(admin, Projects {
            projects: vector::empty<Project>(),
        });
        
        move_to(admin, ReviewerRegistry {
            reviewers: vector::empty<address>(),
        });
    }

    /// Create a new project
    public entry fun create_project(
        client: &signer,
        worker_address: address,
        deadline: u64,
        module_address: address,
    ) acquires ProjectConfig, Projects {
        let client_address = signer::address_of(client);
        
        assert!(exists<ProjectConfig>(module_address), E_NOT_INITIALIZED);
        assert!(exists<Projects>(module_address), E_NOT_INITIALIZED);
        
        let project_config = borrow_global_mut<ProjectConfig>(module_address);
        let projects = borrow_global_mut<Projects>(module_address);
        
        let project_id = project_config.next_project_id;
        project_config.next_project_id = project_id + 1;
        
        let project = Project {
            id: project_id,
            client: client_address,
            worker: worker_address,
            deadline,
            status: PROJECT_STATUS_CREATED,
            milestones: vector::empty<Milestone>(),
            total_amount: 0,
            funded_amount: 0,
            creation_time: timestamp::now_seconds(),
        };
        
        vector::push_back(&mut projects.projects, project);
    }

    /// Add a milestone to a project
    public entry fun add_milestone(
        client: &signer,
        project_id: u64,
        description: vector<u8>,
        amount: u64,
        deadline: u64,
        module_address: address,
    ) acquires Projects {
        let client_address = signer::address_of(client);
        
        assert!(exists<Projects>(module_address), E_NOT_INITIALIZED);
        
        // Find the project
        let projects = borrow_global_mut<Projects>(module_address);
        let project_opt = find_project_mut(projects, project_id);
        assert!(option::is_some(&project_opt), E_PROJECT_NOT_FOUND);
        
        let project = option::borrow_mut(&mut project_opt);
        
        // Verify client is the project owner
        assert!(project.client == client_address, E_NOT_AUTHORIZED);
        
        // Verify project is in created state
        assert!(project.status == PROJECT_STATUS_CREATED, E_INVALID_STATE);
        
        // Create new milestone
        let milestone_id = vector::length(&project.milestones);
        let milestone = Milestone {
            id: milestone_id,
            description: string::utf8(description),
            amount,
            deadline,
            status: MILESTONE_STATUS_CREATED,
            evidence: string::utf8(b""),
            approvals: vector::empty<address>(),
            rejections: vector::empty<address>(),
        };
        
        // Add milestone to project
        vector::push_back(&mut project.milestones, milestone);
        
        // Update project total amount
        project.total_amount = project.total_amount + amount;
    }

    /// Fund a project
    public entry fun fund_project<CoinType>(
        client: &signer,
        project_id: u64,
        amount: u64,
        module_address: address,
    ) acquires Projects {
        let client_address = signer::address_of(client);
        
        assert!(exists<Projects>(module_address), E_NOT_INITIALIZED);
        
        // Find the project
        let projects = borrow_global_mut<Projects>(module_address);
        let project_opt = find_project_mut(projects, project_id);
        assert!(option::is_some(&project_opt), E_PROJECT_NOT_FOUND);
        
        let project = option::borrow_mut(&mut project_opt);
        
        // Verify client is the project owner
        assert!(project.client == client_address, E_NOT_AUTHORIZED);
        
        // Verify project is in created state
        assert!(project.status == PROJECT_STATUS_CREATED, E_INVALID_STATE);
        
        // Transfer funds from client to module
        coin::transfer<CoinType>(client, module_address, amount);
        
        // Update project funded amount
        project.funded_amount = project.funded_amount + amount;
        
        // If fully funded, change status
        if (project.funded_amount >= project.total_amount) {
            project.status = PROJECT_STATUS_FUNDED;
        };
    }

    /// Start working on a project
    public entry fun start_work(
        worker: &signer,
        project_id: u64,
        module_address: address,
    ) acquires Projects {
        let worker_address = signer::address_of(worker);
        
        assert!(exists<Projects>(module_address), E_NOT_INITIALIZED);
        
        // Find the project
        let projects = borrow_global_mut<Projects>(module_address);
        let project_opt = find_project_mut(projects, project_id);
        assert!(option::is_some(&project_opt), E_PROJECT_NOT_FOUND);
        
        let project = option::borrow_mut(&mut project_opt);
        
        // Verify worker is the assigned worker
        assert!(project.worker == worker_address, E_NOT_AUTHORIZED);
        
        // Verify project is in funded state
        assert!(project.status == PROJECT_STATUS_FUNDED, E_INVALID_STATE);
        
        // Update project status
        project.status = PROJECT_STATUS_IN_PROGRESS;
        
        // Set all milestones to in progress
        let i = 0;
        let len = vector::length(&project.milestones);
        while (i < len) {
            let milestone = vector::borrow_mut(&mut project.milestones, i);
            milestone.status = MILESTONE_STATUS_IN_PROGRESS;
            i = i + 1;
        };
    }

    /// Submit a milestone
    public entry fun submit_milestone(
        worker: &signer,
        project_id: u64,
        milestone_id: u64,
        evidence: vector<u8>,
        module_address: address,
    ) acquires Projects {
        let worker_address = signer::address_of(worker);
        
        assert!(exists<Projects>(module_address), E_NOT_INITIALIZED);
        
        // Find the project
        let projects = borrow_global_mut<Projects>(module_address);
        let project_opt = find_project_mut(projects, project_id);
        assert!(option::is_some(&project_opt), E_PROJECT_NOT_FOUND);
        
        let project = option::borrow_mut(&mut project_opt);
        
        // Verify worker is the assigned worker
        assert!(project.worker == worker_address, E_NOT_AUTHORIZED);
        
        // Verify project is in progress
        assert!(project.status == PROJECT_STATUS_IN_PROGRESS, E_INVALID_STATE);
        
        // Get milestone
        assert!(milestone_id < vector::length(&project.milestones), E_MILESTONE_NOT_FOUND);
        let milestone = vector::borrow_mut(&mut project.milestones, milestone_id);
        
        // Verify milestone is in progress
        assert!(milestone.status == MILESTONE_STATUS_IN_PROGRESS, E_INVALID_STATE);
        
        // Update milestone
        milestone.status = MILESTONE_STATUS_SUBMITTED;
        milestone.evidence = string::utf8(evidence);
    }

    /// Register as a reviewer
    public entry fun register_as_reviewer(
        reviewer: &signer,
        module_address: address,
    ) acquires ReviewerRegistry {
        let reviewer_address = signer::address_of(reviewer);
        
        assert!(exists<ReviewerRegistry>(module_address), E_NOT_INITIALIZED);
        
        let reviewer_registry = borrow_global_mut<ReviewerRegistry>(module_address);
        
        // Check if already a reviewer
        let i = 0;
        let len = vector::length(&reviewer_registry.reviewers);
        let already_reviewer = false;
        while (i < len) {
            if (*vector::borrow(&reviewer_registry.reviewers, i) == reviewer_address) {
                already_reviewer = true;
                break
            };
            i = i + 1;
        };
        
        if (!already_reviewer) {
            vector::push_back(&mut reviewer_registry.reviewers, reviewer_address);
        };
    }

    /// Review a milestone
    public entry fun review_milestone(
        reviewer: &signer,
        project_id: u64,
        milestone_id: u64,
        approved: bool,
        module_address: address,
    ) acquires Projects, ReviewerRegistry, ProjectConfig {
        let reviewer_address = signer::address_of(reviewer);
        
        assert!(exists<Projects>(module_address), E_NOT_INITIALIZED);
        assert!(exists<ReviewerRegistry>(module_address), E_NOT_INITIALIZED);
        assert!(exists<ProjectConfig>(module_address), E_NOT_INITIALIZED);
        
        // Verify reviewer is a registered reviewer
        let reviewer_registry = borrow_global<ReviewerRegistry>(module_address);
        assert!(is_reviewer(reviewer_registry, reviewer_address), E_NOT_A_REVIEWER);
        
        // Find the project
        let projects = borrow_global_mut<Projects>(module_address);
        let project_opt = find_project_mut(projects, project_id);
        assert!(option::is_some(&project_opt), E_PROJECT_NOT_FOUND);
        
        let project = option::borrow_mut(&mut project_opt);
        
        // Verify project is in progress
        assert!(project.status == PROJECT_STATUS_IN_PROGRESS, E_INVALID_STATE);
        
        // Get milestone
        assert!(milestone_id < vector::length(&project.milestones), E_MILESTONE_NOT_FOUND);
        let milestone = vector::borrow_mut(&mut project.milestones, milestone_id);
        
        // Verify milestone is submitted
        assert!(milestone.status == MILESTONE_STATUS_SUBMITTED, E_INVALID_STATE);
        
        // Check if reviewer already voted
        let i = 0;
        let len = vector::length(&milestone.approvals);
        while (i < len) {
            assert!(*vector::borrow(&milestone.approvals, i) != reviewer_address, E_ALREADY_VOTED);
            i = i + 1;
        };
        
        i = 0;
        len = vector::length(&milestone.rejections);
        while (i < len) {
            assert!(*vector::borrow(&milestone.rejections, i) != reviewer_address, E_ALREADY_VOTED);
            i = i + 1;
        };
        
        // Record vote
        if (approved) {
            vector::push_back(&mut milestone.approvals, reviewer_address);
        } else {
            vector::push_back(&mut milestone.rejections, reviewer_address);
        };
        
        // Check if milestone is approved or rejected
        let project_config = borrow_global<ProjectConfig>(module_address);
        let min_approvals = project_config.min_approvals;
        
        if (vector::length(&milestone.approvals) >= (min_approvals as u64)) {
            milestone.status = MILESTONE_STATUS_APPROVED;
        } else if (vector::length(&milestone.rejections) >= (min_approvals as u64)) {
            milestone.status = MILESTONE_STATUS_REJECTED;
        };
    }

    /// Complete a milestone and release funds
    public entry fun complete_milestone<CoinType>(
        project_id: u64,
        milestone_id: u64,
        module_address: address,
    ) acquires Projects, ProjectConfig {
        assert!(exists<Projects>(module_address), E_NOT_INITIALIZED);
        assert!(exists<ProjectConfig>(module_address), E_NOT_INITIALIZED);
        
        // Find the project
        let projects = borrow_global_mut<Projects>(module_address);
        let project_opt = find_project_mut(projects, project_id);
        assert!(option::is_some(&project_opt), E_PROJECT_NOT_FOUND);
        
        let project = option::borrow_mut(&mut project_opt);
        
        // Verify project is in progress
        assert!(project.status == PROJECT_STATUS_IN_PROGRESS, E_INVALID_STATE);
        
        // Get milestone
        assert!(milestone_id < vector::length(&project.milestones), E_MILESTONE_NOT_FOUND);
        let milestone = vector::borrow_mut(&mut project.milestones, milestone_id);
        
        // Verify milestone is approved
        assert!(milestone.status == MILESTONE_STATUS_APPROVED, E_INVALID_STATE);
        
        // Get config for fee calculation
        let config = borrow_global<ProjectConfig>(module_address);
        let platform_fee_percentage = config.platform_fee_percentage;
        
        // Calculate platform fee
        let platform_fee = (milestone.amount * (platform_fee_percentage as u64)) / 100;
        let worker_amount = milestone.amount - platform_fee;
        
        // Transfer funds
        let module_signer = account::create_signer_with_capability(
            &account::create_signer_capability(module_address)
        );
        
        coin::transfer<CoinType>(&module_signer, project.worker, worker_amount);
        
        if (platform_fee > 0) {
            coin::transfer<CoinType>(&module_signer, config.admin, platform_fee);
        };
        
        // Update milestone status
        milestone.status = MILESTONE_STATUS_PAID;
        
        // Check if all milestones are completed
        let all_completed = true;
        let i = 0;
        let len = vector::length(&project.milestones);
        while (i < len) {
            let m = vector::borrow(&project.milestones, i);
            if (m.status != MILESTONE_STATUS_PAID) {
                all_completed = false;
                break
            };
            i = i + 1;
        };
        
        // If all milestones completed, mark project as completed
        if (all_completed) {
            project.status = PROJECT_STATUS_COMPLETED;
        };
    }

    /// Cancel a project
    public entry fun cancel_project<CoinType>(
        client: &signer,
        project_id: u64,
        module_address: address,
    ) acquires Projects {
        let client_address = signer::address_of(client);
        
        assert!(exists<Projects>(module_address), E_NOT_INITIALIZED);
        
        // Find the project
        let projects = borrow_global_mut<Projects>(module_address);
        let project_opt = find_project_mut(projects, project_id);
        assert!(option::is_some(&project_opt), E_PROJECT_NOT_FOUND);
        
        let project = option::borrow_mut(&mut project_opt);
        
        // Verify client is the project owner
        assert!(project.client == client_address, E_NOT_AUTHORIZED);
        
        // Verify project is in created or funded state (not started)
        assert!(
            project.status == PROJECT_STATUS_CREATED || project.status == PROJECT_STATUS_FUNDED,
            E_INVALID_STATE
        );
        
        // Return funds if any
        if (project.funded_amount > 0) {
            let module_signer = account::create_signer_with_capability(
                &account::create_signer_capability(module_address)
            );
            coin::transfer<CoinType>(&module_signer, project.client, project.funded_amount);
            project.funded_amount = 0;
        };
        
        // Update project status
        project.status = PROJECT_STATUS_CANCELLED;
    }

    /// Get project status
    #[view]
    public fun get_project_status(
        project_id: u64,
        module_address: address,
    ): u8 acquires Projects {
        assert!(exists<Projects>(module_address), E_NOT_INITIALIZED);
        
        // Find the project
        let projects = borrow_global<Projects>(module_address);
        let project_opt = find_project(projects, project_id);
        assert!(option::is_some(&project_opt), E_PROJECT_NOT_FOUND);
        
        let project = option::borrow(&project_opt);
        project.status
    }

    /// Get milestone status
    #[view]
    public fun get_milestone_status(
        project_id: u64,
        milestone_id: u64,
        module_address: address,
    ): u8 acquires Projects {
        assert!(exists<Projects>(module_address), E_NOT_INITIALIZED);
        
        // Find the project
        let projects = borrow_global<Projects>(module_address);
        let project_opt = find_project(projects, project_id);
        assert!(option::is_some(&project_opt), E_PROJECT_NOT_FOUND);
        
        let project = option::borrow(&project_opt);
        
        // Get milestone
        assert!(milestone_id < vector::length(&project.milestones), E_MILESTONE_NOT_FOUND);
        let milestone = vector::borrow(&project.milestones, milestone_id);
        
        milestone.status
    }

    /// Check if an address is a reviewer
    #[view]
    public fun is_reviewer(
        reviewer_address: address,
        module_address: address,
    ): bool acquires ReviewerRegistry {
        assert!(exists<ReviewerRegistry>(module_address), E_NOT_INITIALIZED);
        
        let reviewer_registry = borrow_global<ReviewerRegistry>(module_address);
        is_reviewer(reviewer_registry, reviewer_address)
    }

    //
    // Helper functions
    //

    /// Find a project by ID
    fun find_project(projects: &Projects, project_id: u64): option::Option<&Project> {
        let i = 0;
        let len = vector::length(&projects.projects);
        
        while (i < len) {
            let project = vector::borrow(&projects.projects, i);
            if (project.id == project_id) {
                return option::some(project)
            };
            i = i + 1;
        };
        
        option::none<&Project>()
    }

    /// Find a project by ID and return mutable reference
    fun find_project_mut(projects: &mut Projects, project_id: u64): option::Option<&mut Project> {
        let i = 0;
        let len = vector::length(&projects.projects);
        
        while (i < len) {
            let project = vector::borrow_mut(&mut projects.projects, i);
            if (project.id == project_id) {
                return option::some(project)
            };
            i = i + 1;
        };
        
        option::none<&mut Project>()
    }

    /// Check if an address is a reviewer
    fun is_reviewer(reviewer_registry: &ReviewerRegistry, reviewer_address: address): bool {
        let i = 0;
        let len = vector::length(&reviewer_registry.reviewers);
        
        while (i < len) {
            if (*vector::borrow(&reviewer_registry.reviewers, i) == reviewer_address) {
                return true
            };
            i = i + 1;
        };
        
        false
    }
} 