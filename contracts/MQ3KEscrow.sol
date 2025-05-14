// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title MQ3KEscrow
 * @dev Smart contract for secure escrow transactions in the MQ3K platform
 */
contract MQ3KEscrow {
    enum ProjectStatus { Created, Funded, InProgress, Completed, Disputed, Refunded }
    enum MilestoneStatus { Created, InProgress, Submitted, UnderReview, Approved, Rejected, Disputed }
    
    struct Milestone {
        uint256 id;
        string description;
        uint256 amount;
        uint256 deadline;
        MilestoneStatus status;
        string evidence;
        address[] reviewers;
        mapping(address => bool) reviewerVotes;
        uint256 positiveVotes;
        uint256 negativeVotes;
        bool paid;
    }
    
    struct Project {
        uint256 id;
        address client;
        address worker;
        uint256 totalAmount;
        uint256 deadline;
        ProjectStatus status;
        bool clientApproved;
        bool workerApproved;
        uint256[] milestoneIds;
        uint256 completedMilestones;
    }
    
    mapping(uint256 => Project) public projects;
    mapping(uint256 => mapping(uint256 => Milestone)) public milestones;
    uint256 public projectCounter;
    uint256 public milestoneCounter;
    uint256 public platformFee = 2; // 2% platform fee
    address public owner;
    
    // Reviewer pool and reputation
    mapping(address => bool) public isReviewer;
    mapping(address => uint256) public reviewerReputation;
    address[] public reviewerPool;
    uint256 public minReviewersPerMilestone = 3;
    uint256 public reviewerRewardPercentage = 1; // 1% of milestone amount
    
    event ProjectCreated(uint256 indexed projectId, address indexed client, address indexed worker, uint256 amount, uint256 deadline);
    event ProjectFunded(uint256 indexed projectId, uint256 amount);
    event WorkStarted(uint256 indexed projectId);
    event ProjectCompleted(uint256 indexed projectId);
    event ProjectDisputed(uint256 indexed projectId);
    event ProjectRefunded(uint256 indexed projectId);
    
    event MilestoneCreated(uint256 indexed projectId, uint256 indexed milestoneId, string description, uint256 amount, uint256 deadline);
    event MilestoneSubmitted(uint256 indexed projectId, uint256 indexed milestoneId, string evidence);
    event ReviewersAssigned(uint256 indexed projectId, uint256 indexed milestoneId, address[] reviewers);
    event MilestoneVoted(uint256 indexed projectId, uint256 indexed milestoneId, address reviewer, bool approved);
    event MilestoneCompleted(uint256 indexed projectId, uint256 indexed milestoneId);
    event MilestoneRejected(uint256 indexed projectId, uint256 indexed milestoneId);
    event MilestoneDisputed(uint256 indexed projectId, uint256 indexed milestoneId);
    event ReviewerReputationUpdated(address indexed reviewer, uint256 newReputation);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier onlyClient(uint256 _projectId) {
        require(msg.sender == projects[_projectId].client, "Only project client can call this function");
        _;
    }
    
    modifier onlyWorker(uint256 _projectId) {
        require(msg.sender == projects[_projectId].worker, "Only project worker can call this function");
        _;
    }
    
    modifier onlyReviewer(uint256 _projectId, uint256 _milestoneId) {
        bool isValidReviewer = false;
        Milestone storage milestone = milestones[_projectId][_milestoneId];
        
        for (uint i = 0; i < milestone.reviewers.length; i++) {
            if (milestone.reviewers[i] == msg.sender) {
                isValidReviewer = true;
                break;
            }
        }
        
        require(isValidReviewer, "Only assigned reviewers can call this function");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    function registerAsReviewer() external {
        require(!isReviewer[msg.sender], "Already registered as reviewer");
        
        isReviewer[msg.sender] = true;
        reviewerPool.push(msg.sender);
        reviewerReputation[msg.sender] = 100; // Initial reputation score
        
        emit ReviewerReputationUpdated(msg.sender, 100);
    }
    
    function createProject(address _worker, uint256 _deadline) external returns (uint256) {
        uint256 projectId = projectCounter++;
        
        projects[projectId].id = projectId;
        projects[projectId].client = msg.sender;
        projects[projectId].worker = _worker;
        projects[projectId].totalAmount = 0;
        projects[projectId].deadline = _deadline;
        projects[projectId].status = ProjectStatus.Created;
        projects[projectId].clientApproved = false;
        projects[projectId].workerApproved = false;
        projects[projectId].completedMilestones = 0;
        
        emit ProjectCreated(projectId, msg.sender, _worker, 0, _deadline);
        return projectId;
    }
    
    function addMilestone(
        uint256 _projectId,
        string memory _description,
        uint256 _amount,
        uint256 _deadline
    ) external onlyClient(_projectId) returns (uint256) {
        require(projects[_projectId].status == ProjectStatus.Created, "Can only add milestones to new projects");
        
        uint256 milestoneId = milestoneCounter++;
        
        Milestone storage milestone = milestones[_projectId][milestoneId];
        milestone.id = milestoneId;
        milestone.description = _description;
        milestone.amount = _amount;
        milestone.deadline = _deadline;
        milestone.status = MilestoneStatus.Created;
        
        projects[_projectId].milestoneIds.push(milestoneId);
        projects[_projectId].totalAmount += _amount;
        
        emit MilestoneCreated(_projectId, milestoneId, _description, _amount, _deadline);
        return milestoneId;
    }
    
    function fundProject(uint256 _projectId) external payable onlyClient(_projectId) {
        Project storage project = projects[_projectId];
        require(project.status == ProjectStatus.Created, "Project must be in Created status");
        require(msg.value == project.totalAmount, "Amount must match total milestone amounts");
        require(project.milestoneIds.length > 0, "Project must have at least one milestone");
        
        project.status = ProjectStatus.Funded;
        
        emit ProjectFunded(_projectId, msg.value);
    }
    
    function startWork(uint256 _projectId) external onlyWorker(_projectId) {
        Project storage project = projects[_projectId];
        require(project.status == ProjectStatus.Funded, "Project must be in Funded status");
        
        project.status = ProjectStatus.InProgress;
        
        // Set all milestones to InProgress status
        for (uint i = 0; i < project.milestoneIds.length; i++) {
            uint256 milestoneId = project.milestoneIds[i];
            milestones[_projectId][milestoneId].status = MilestoneStatus.InProgress;
        }
        
        emit WorkStarted(_projectId);
    }
    
    function submitMilestone(
        uint256 _projectId,
        uint256 _milestoneId,
        string memory _evidence
    ) external onlyWorker(_projectId) {
        Milestone storage milestone = milestones[_projectId][_milestoneId];
        require(milestone.status == MilestoneStatus.InProgress, "Milestone must be in progress");
        
        milestone.status = MilestoneStatus.Submitted;
        milestone.evidence = _evidence;
        
        emit MilestoneSubmitted(_projectId, _milestoneId, _evidence);
        
        // Auto-assign reviewers
        assignReviewers(_projectId, _milestoneId);
    }
    
    function assignReviewers(uint256 _projectId, uint256 _milestoneId) internal {
        require(reviewerPool.length >= minReviewersPerMilestone, "Not enough reviewers in the pool");
        
        Milestone storage milestone = milestones[_projectId][_milestoneId];
        milestone.status = MilestoneStatus.UnderReview;
        
        // Select random reviewers (simplified version for demo)
        // In production, would use a more sophisticated selection algorithm based on reputation
        address[] memory selectedReviewers = new address[](minReviewersPerMilestone);
        
        for (uint i = 0; i < minReviewersPerMilestone; i++) {
            // This is a simplified random selection and not secure for production
            uint256 randomIndex = uint256(keccak256(abi.encodePacked(block.timestamp, i))) % reviewerPool.length;
            selectedReviewers[i] = reviewerPool[randomIndex];
            milestone.reviewers.push(reviewerPool[randomIndex]);
        }
        
        emit ReviewersAssigned(_projectId, _milestoneId, selectedReviewers);
    }
    
    function voteOnMilestone(
        uint256 _projectId,
        uint256 _milestoneId,
        bool _approved
    ) external onlyReviewer(_projectId, _milestoneId) {
        Milestone storage milestone = milestones[_projectId][_milestoneId];
        require(milestone.status == MilestoneStatus.UnderReview, "Milestone is not under review");
        require(!milestone.reviewerVotes[msg.sender], "Already voted on this milestone");
        
        milestone.reviewerVotes[msg.sender] = true;
        
        if (_approved) {
            milestone.positiveVotes++;
        } else {
            milestone.negativeVotes++;
        }
        
        emit MilestoneVoted(_projectId, _milestoneId, msg.sender, _approved);
        
        // Check if we have enough votes to make a decision
        uint256 totalVotes = milestone.positiveVotes + milestone.negativeVotes;
        
        if (totalVotes >= minReviewersPerMilestone) {
            if (milestone.positiveVotes > milestone.negativeVotes) {
                completeMilestone(_projectId, _milestoneId);
            } else {
                rejectMilestone(_projectId, _milestoneId);
            }
        }
    }
    
    function completeMilestone(uint256 _projectId, uint256 _milestoneId) internal {
        Milestone storage milestone = milestones[_projectId][_milestoneId];
        Project storage project = projects[_projectId];
        
        milestone.status = MilestoneStatus.Approved;
        milestone.paid = true;
        project.completedMilestones++;
        
        // Calculate payment amounts
        uint256 fee = (milestone.amount * platformFee) / 100;
        uint256 reviewerReward = (milestone.amount * reviewerRewardPercentage) / 100;
        uint256 workerAmount = milestone.amount - fee - reviewerReward;
        
        // Pay the worker
        payable(project.worker).transfer(workerAmount);
        
        // Pay platform fee
        payable(owner).transfer(fee);
        
        // Pay reviewers (equally split)
        uint256 rewardPerReviewer = reviewerReward / milestone.reviewers.length;
        for (uint i = 0; i < milestone.reviewers.length; i++) {
            address reviewer = milestone.reviewers[i];
            payable(reviewer).transfer(rewardPerReviewer);
            
            // Update reviewer reputation
            if (milestone.reviewerVotes[reviewer]) {
                if ((milestone.positiveVotes > milestone.negativeVotes && milestone.reviewerVotes[reviewer]) || 
                    (milestone.positiveVotes < milestone.negativeVotes && !milestone.reviewerVotes[reviewer])) {
                    // Voted with majority - increase reputation
                    reviewerReputation[reviewer] += 1;
                    emit ReviewerReputationUpdated(reviewer, reviewerReputation[reviewer]);
                }
            }
        }
        
        emit MilestoneCompleted(_projectId, _milestoneId);
        
        // Check if all milestones are completed to mark project as complete
        if (project.completedMilestones == project.milestoneIds.length) {
            project.status = ProjectStatus.Completed;
            emit ProjectCompleted(_projectId);
        }
    }
    
    function rejectMilestone(uint256 _projectId, uint256 _milestoneId) internal {
        Milestone storage milestone = milestones[_projectId][_milestoneId];
        
        milestone.status = MilestoneStatus.Rejected;
        
        // Update reviewer reputation
        for (uint i = 0; i < milestone.reviewers.length; i++) {
            address reviewer = milestone.reviewers[i];
            if (milestone.reviewerVotes[reviewer]) {
                if ((milestone.positiveVotes < milestone.negativeVotes && !milestone.reviewerVotes[reviewer]) || 
                    (milestone.positiveVotes > milestone.negativeVotes && milestone.reviewerVotes[reviewer])) {
                    // Voted with majority - increase reputation
                    reviewerReputation[reviewer] += 1;
                    emit ReviewerReputationUpdated(reviewer, reviewerReputation[reviewer]);
                }
            }
        }
        
        emit MilestoneRejected(_projectId, _milestoneId);
    }
    
    function disputeMilestone(uint256 _projectId, uint256 _milestoneId) external {
        Project storage project = projects[_projectId];
        Milestone storage milestone = milestones[_projectId][_milestoneId];
        
        require(msg.sender == project.client || msg.sender == project.worker, "Only client or worker can dispute");
        require(
            milestone.status == MilestoneStatus.Rejected || 
            milestone.status == MilestoneStatus.UnderReview,
            "Milestone must be rejected or under review to dispute"
        );
        
        milestone.status = MilestoneStatus.Disputed;
        
        emit MilestoneDisputed(_projectId, _milestoneId);
    }
    
    function resolveMilestoneDispute(
        uint256 _projectId, 
        uint256 _milestoneId, 
        bool _approveWork
    ) external onlyOwner {
        Milestone storage milestone = milestones[_projectId][_milestoneId];
        require(milestone.status == MilestoneStatus.Disputed, "Milestone must be disputed");
        
        if (_approveWork) {
            completeMilestone(_projectId, _milestoneId);
        } else {
            rejectMilestone(_projectId, _milestoneId);
        }
    }
    
    function disputeProject(uint256 _projectId) external {
        Project storage project = projects[_projectId];
        require(msg.sender == project.client || msg.sender == project.worker, "Only client or worker can dispute");
        require(project.status == ProjectStatus.InProgress, "Project must be in InProgress status");
        
        project.status = ProjectStatus.Disputed;
        
        emit ProjectDisputed(_projectId);
    }
    
    function resolveDispute(
        uint256 _projectId, 
        address _recipient, 
        uint256 _clientAmount, 
        uint256 _workerAmount
    ) external onlyOwner {
        Project storage project = projects[_projectId];
        require(project.status == ProjectStatus.Disputed, "Project must be in Disputed status");
        
        uint256 remainingAmount = project.totalAmount;
        
        // Subtract completed milestone amounts
        for (uint i = 0; i < project.milestoneIds.length; i++) {
            uint256 milestoneId = project.milestoneIds[i];
            if (milestones[_projectId][milestoneId].paid) {
                remainingAmount -= milestones[_projectId][milestoneId].amount;
            }
        }
        
        require(_clientAmount + _workerAmount <= remainingAmount, "Sum of amounts exceeds remaining project amount");
        
        project.status = ProjectStatus.Completed;
        
        if (_clientAmount > 0) {
            payable(project.client).transfer(_clientAmount);
        }
        
        if (_workerAmount > 0) {
            payable(project.worker).transfer(_workerAmount);
        }
        
        uint256 fee = remainingAmount - _clientAmount - _workerAmount;
        if (fee > 0) {
            payable(owner).transfer(fee);
        }
        
        emit ProjectCompleted(_projectId);
    }
    
    function refundProject(uint256 _projectId) external onlyOwner {
        Project storage project = projects[_projectId];
        require(
            project.status == ProjectStatus.Funded || 
            project.status == ProjectStatus.InProgress, 
            "Project must be in Funded or InProgress status"
        );
        
        uint256 remainingAmount = project.totalAmount;
        
        // Subtract completed milestone amounts
        for (uint i = 0; i < project.milestoneIds.length; i++) {
            uint256 milestoneId = project.milestoneIds[i];
            if (milestones[_projectId][milestoneId].paid) {
                remainingAmount -= milestones[_projectId][milestoneId].amount;
            }
        }
        
        if (remainingAmount > 0) {
            project.status = ProjectStatus.Refunded;
            payable(project.client).transfer(remainingAmount);
            
            emit ProjectRefunded(_projectId);
        }
    }
    
    function getProject(uint256 _projectId) external view returns (
        uint256 id,
        address client,
        address worker,
        uint256 totalAmount,
        uint256 deadline,
        ProjectStatus status,
        bool clientApproved,
        bool workerApproved,
        uint256 completedMilestones,
        uint256 totalMilestones
    ) {
        Project storage project = projects[_projectId];
        return (
            project.id,
            project.client,
            project.worker,
            project.totalAmount,
            project.deadline,
            project.status,
            project.clientApproved,
            project.workerApproved,
            project.completedMilestones,
            project.milestoneIds.length
        );
    }
    
    function getMilestone(uint256 _projectId, uint256 _milestoneId) external view returns (
        uint256 id,
        string memory description,
        uint256 amount,
        uint256 deadline,
        MilestoneStatus status,
        string memory evidence,
        uint256 positiveVotes,
        uint256 negativeVotes,
        bool paid
    ) {
        Milestone storage milestone = milestones[_projectId][_milestoneId];
        return (
            milestone.id,
            milestone.description,
            milestone.amount,
            milestone.deadline,
            milestone.status,
            milestone.evidence,
            milestone.positiveVotes,
            milestone.negativeVotes,
            milestone.paid
        );
    }
    
    function getMilestoneReviewers(uint256 _projectId, uint256 _milestoneId) external view returns (
        address[] memory
    ) {
        return milestones[_projectId][_milestoneId].reviewers;
    }
    
    function getProjectMilestones(uint256 _projectId) external view returns (
        uint256[] memory
    ) {
        return projects[_projectId].milestoneIds;
    }
    
    function setPlatformFee(uint256 _fee) external onlyOwner {
        require(_fee <= 10, "Fee cannot exceed 10%");
        platformFee = _fee;
    }
    
    function setReviewerRewardPercentage(uint256 _percentage) external onlyOwner {
        require(_percentage <= 5, "Percentage cannot exceed 5%");
        reviewerRewardPercentage = _percentage;
    }
    
    function setMinReviewersPerMilestone(uint256 _count) external onlyOwner {
        require(_count >= 1 && _count <= 10, "Reviewer count must be between 1 and 10");
        minReviewersPerMilestone = _count;
    }
} 