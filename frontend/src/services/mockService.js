import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import api from './api';

// Create a mock adapter for the axios instance used in your API service
const mock = new MockAdapter(api, { delayResponse: 800 });

// Enhanced mock data for authentication with complete profile
const mockUser = {
    id: "mockuser123",
    username: "Alex Johnson",
    firstName: "Alex",
    lastName: "Johnson",
    email: "alex@example.com",
    wallet_address: "0x123456789abcdef",
    accountAddress: "0x123456789abcdef",
    bio: "Experienced blockchain developer with expertise in smart contract development and web3 integration. Passionate about creating decentralized solutions for real-world problems.",
    role: "Senior Blockchain Engineer",
    location: "San Francisco, CA",
    skills: ["Solidity", "React", "Node.js", "Aptos", "Move", "Web3.js", "TypeScript", "Blockchain"],
    portfolio: [
        {
            id: 1,
            title: "Decentralized Marketplace",
            description: "Built a fully decentralized marketplace using Aptos blockchain",
            url: "https://github.com/alexj/defi-marketplace"
        },
        {
            id: 2,
            title: "Smart Contract Library",
            description: "Created reusable smart contract templates for various business use cases",
            url: "https://github.com/alexj/smart-contract-lib"
        }
    ],
    education: [
        {
            institution: "Stanford University",
            degree: "Master of Computer Science",
            year: "2020"
        },
        {
            institution: "University of California, Berkeley",
            degree: "Bachelor of Science in Computer Engineering",
            year: "2018"
        }
    ],
    experience: [
        {
            company: "Blockchain Innovations Inc.",
            position: "Lead Developer",
            duration: "2021 - Present",
            description: "Leading development of blockchain-based payment solutions"
        },
        {
            company: "Tech Solutions Group",
            position: "Software Engineer",
            duration: "2018 - 2021",
            description: "Developed web applications with blockchain integration"
        }
    ],
    stats: {
        completedJobs: 24,
        inProgressJobs: 3,
        successRate: 96,
        totalEarned: 45750,
        averageRating: 4.8,
        reviewCount: 19
    },
    certifications: [
        "Aptos Certified Developer",
        "Blockchain Architecture Professional",
        "Web3 Security Specialist"
    ]
};

// Enhanced mock data for milestones with improved descriptions and details
const mockMilestones = [
    {
        id: 1,
        job_id: 101,
        job_title: "E-commerce Platform Development",
        title: "User Interface Implementation",
        description: "Develop responsive user interface components for the client dashboard and product catalog.",
        amount: 2500,
        deadline: "2025-05-30T00:00:00Z",
        status: "completed",
        completion_date: "2025-05-28T14:30:00Z",
        transaction_hash: "0x3a21b547c8901fd456789a012345678901234567",
        attachments: ["ui-components.zip", "design-implementation-report.pdf"],
        feedback: "Excellent work! The interface is intuitive and matches our brand guidelines perfectly.",
        client: {
            id: 201,
            name: "NorthStar Retail"
        }
    },
    {
        id: 2,
        job_id: 101,
        job_title: "E-commerce Platform Development",
        title: "API & Integration Development",
        description: "Implement backend APIs for inventory management and payment gateway integration.",
        amount: 3500,
        deadline: "2025-06-15T00:00:00Z",
        status: "in_progress",
        completion_date: null,
        transaction_hash: null,
        attachments: ["api-documentation.pdf"],
        feedback: null,
        client: {
            id: 201,
            name: "NorthStar Retail"
        }
    },
    {
        id: 3,
        job_id: 102,
        job_title: "Healthcare Mobile App",
        title: "UX Design & Prototyping",
        description: "Create user experience designs and interactive prototypes for patient-facing features.",
        amount: 1500,
        deadline: "2025-06-05T00:00:00Z",
        status: "pending",
        completion_date: null,
        transaction_hash: null,
        attachments: [],
        feedback: null,
        client: {
            id: 202,
            name: "MediConnect Solutions"
        }
    },
    {
        id: 4,
        job_id: 102,
        job_title: "Healthcare Mobile App",
        title: "Core Application Development",
        description: "Implement appointment scheduling, medical records access, and secure messaging features.",
        amount: 4000,
        deadline: "2025-07-10T00:00:00Z",
        status: "pending",
        completion_date: null,
        transaction_hash: null,
        attachments: [],
        feedback: null,
        client: {
            id: 202,
            name: "MediConnect Solutions"
        }
    },
    {
        id: 5,
        job_id: 103,
        job_title: "Enterprise Content Platform",
        title: "Database Architecture & Implementation",
        description: "Design and implement scalable database architecture with data migration strategy.",
        amount: 1800,
        deadline: "2025-05-25T00:00:00Z",
        status: "paid",
        completion_date: "2025-05-20T09:45:00Z",
        transaction_hash: "0x8c4b23f79a134567890123456789012345678901",
        attachments: ["database-schema.sql", "entity-relationship-diagram.pdf"],
        feedback: "Outstanding work. The database design is efficient and will scale well with our growth plans.",
        client: {
            id: 203,
            name: "GlobalMedia Group"
        }
    }
];

// Enhanced mock data for wallet with more detailed transaction info
const mockWalletData = {
    balance: 12450,
    pendingPayments: 3500,
    recentTransactions: [
        {
            id: 1,
            type: 'payment_received',
            amount: 1500,
            date: '2025-05-15T14:30:00Z',
            description: 'Project Milestone Completion: UX Design for Healthcare App',
            status: 'confirmed',
            txHash: '0x3a21b547c8901fd89012345678901234567890123',
            client: 'MediConnect Solutions',
            job_title: 'Healthcare Mobile App'
        },
        {
            id: 2,
            type: 'payment_sent',
            amount: 750,
            date: '2025-05-12T09:15:00Z',
            description: 'Smart Contract Execution: License Renewal',
            status: 'confirmed',
            txHash: '0x8c4b23f79a134567890123456789012345678901',
            recipient: 'Blockchain Service Provider'
        },
        {
            id: 3,
            type: 'payment_received',
            amount: 2000,
            date: '2025-05-05T11:45:00Z',
            description: 'Project Initiation: Enterprise Content Platform',
            status: 'confirmed',
            txHash: '0x5f2d9c3e7b4a8f6d2e1c0b9a8f7e6d5c4b3a2190',
            client: 'GlobalMedia Group',
            job_title: 'Enterprise Content Platform'
        },
        {
            id: 4,
            type: 'payment_pending',
            amount: 3500,
            date: '2025-05-20T00:00:00Z',
            description: 'Final Milestone: E-commerce API Development',
            status: 'pending',
            txHash: null,
            client: 'NorthStar Retail',
            job_title: 'E-commerce Platform Development'
        }
    ]
};

// Enhanced mock data for jobs with more details and realistic descriptions
const mockJobs = [
    {
        id: 101,
        title: "E-commerce Platform Development",
        description: "Build a complete e-commerce platform with user authentication, product management, and payment processing. The system will use Aptos blockchain for secure transactions and will include a mobile-responsive design.",
        budget: 12000,
        deadline: "2025-07-30T00:00:00Z",
        status: "in_progress",
        created_at: "2025-04-10T08:00:00Z",
        progress: 65,
        client: {
            id: 201,
            name: "NorthStar Retail",
            industry: "Retail",
            location: "New York, NY"
        },
        skills_required: ["React", "Node.js", "Aptos", "MongoDB", "Payment Integration"],
        attachments: ["project_requirements.pdf", "design_mockups.zip"]
    },
    {
        id: 102,
        title: "Healthcare Mobile App",
        description: "Develop a mobile application for healthcare providers to manage patient appointments and records. The app will use blockchain for secure data sharing between healthcare institutions while maintaining HIPAA compliance.",
        budget: 9000,
        deadline: "2025-08-15T00:00:00Z",
        status: "in_progress",
        created_at: "2025-04-25T10:30:00Z",
        progress: 40,
        client: {
            id: 202,
            name: "MediConnect Solutions",
            industry: "Healthcare",
            location: "Boston, MA"
        },
        skills_required: ["React Native", "Aptos", "HIPAA Compliance", "Firebase", "UI/UX Design"],
        attachments: ["functional_specs.docx", "compliance_requirements.pdf"]
    },
    {
        id: 103,
        title: "Enterprise Content Platform",
        description: "Create a scalable content management system for a large media organization. The platform will use blockchain for digital rights management and content verification, with automated workflows for content creators.",
        budget: 15000,
        deadline: "2025-06-30T00:00:00Z",
        status: "completed",
        created_at: "2025-03-15T09:15:00Z",
        progress: 100,
        client: {
            id: 203,
            name: "GlobalMedia Group",
            industry: "Media & Entertainment",
            location: "Los Angeles, CA"
        },
        skills_required: ["React", "Node.js", "PostgreSQL", "Aptos", "AWS", "Content Management"],
        attachments: ["technical_specifications.pdf", "workflow_diagrams.jpg"]
    }
];

// Add mock data for dashboard stats
const mockDashboardStats = {
    earnings: {
        total: 45750,
        thisMonth: 7800,
        pending: 3500
    },
    projects: {
        total: 27,
        active: 3,
        completed: 24
    },
    milestones: {
        total: 84,
        completed: 72,
        inProgress: 6,
        pending: 6
    },
    blockchain: {
        totalTransactions: 76,
        gasSpent: 0.45,
        avgConfirmationTime: "2m 14s"
    }
};

// Add mock data for notifications
const mockNotifications = [
    {
        id: 1,
        type: "milestone_completed",
        title: "Milestone Completed",
        message: "Your milestone \"Database Architecture & Implementation\" has been marked as complete.",
        date: "2025-05-20T09:45:00Z",
        read: false,
        job_id: 103
    },
    {
        id: 2,
        type: "payment_received",
        title: "Payment Received",
        message: "You've received $1,800 for the milestone \"Database Architecture & Implementation\".",
        date: "2025-05-20T10:15:00Z",
        read: false,
        amount: 1800
    },
    {
        id: 3,
        type: "new_message",
        title: "New Message",
        message: "NorthStar Retail has sent you a message regarding the E-commerce project.",
        date: "2025-05-18T14:30:00Z",
        read: true,
        job_id: 101
    },
    {
        id: 4,
        type: "deadline_approaching",
        title: "Deadline Approaching",
        message: "The milestone \"API & Integration Development\" is due in 3 days.",
        date: "2025-05-12T08:00:00Z",
        read: true,
        job_id: 101,
        milestone_id: 2
    }
];

// Setup mock endpoints

// Authentication
mock.onGet('/users/me').reply(200, mockUser);
mock.onPatch('/users/profile').reply(200, mockUser);

// Default login response for various auth methods
mock.onPost(/\/auth\/.*/).reply(200, {
    access_token: 'mock_token_123456',
    user: mockUser
});

// Jobs
mock.onGet('/jobs').reply((config) => {
    const params = config.params || {};
    let filteredJobs = [...mockJobs];

    // Filter by status if provided
    if (params.status) {
        filteredJobs = filteredJobs.filter(job => job.status === params.status);
    }

    return [200, filteredJobs];
});

mock.onGet(/\/jobs\/\d+/).reply((config) => {
    const id = parseInt(config.url.split('/').pop());
    const job = mockJobs.find(job => job.id === id);
    return job ? [200, job] : [404, { message: 'Job not found' }];
});

// Milestones
mock.onGet(/\/milestones.*/).reply(200, mockMilestones);
mock.onGet(/\/jobs\/\d+\/milestones/).reply((config) => {
    const jobId = parseInt(config.url.split('/')[2]);
    const jobMilestones = mockMilestones.filter(milestone => milestone.job_id === jobId);
    return [200, jobMilestones];
});

// Wallet data
mock.onGet('/wallet').reply(200, mockWalletData);

// Dashboard stats
mock.onGet('/dashboard/stats').reply(200, mockDashboardStats);

// Notifications
mock.onGet('/notifications').reply(200, mockNotifications);
mock.onPatch(/\/notifications\/\d+\/read/).reply((config) => {
    const id = parseInt(config.url.split('/')[2]);
    const notification = mockNotifications.find(n => n.id === id);
    if (notification) {
        notification.read = true;
        return [200, notification];
    }
    return [404, { message: 'Notification not found' }];
});

// Process milestone payment
mock.onPost('/wallet/payment').reply((config) => {
    const paymentData = JSON.parse(config.data);
    console.log('Processing payment:', paymentData);

    // Simulate successful payment
    if (paymentData.milestone_id) {
        // Update milestone status to paid
        const milestoneIndex = mockMilestones.findIndex(m => m.id === paymentData.milestone_id);
        if (milestoneIndex !== -1) {
            mockMilestones[milestoneIndex].status = 'paid';
            mockMilestones[milestoneIndex].transaction_hash = '0x' + Math.random().toString(16).substring(2, 30);
        }

        // Add transaction to wallet history
        const milestone = mockMilestones.find(m => m.id === paymentData.milestone_id);
        if (milestone) {
            const newTransaction = {
                id: mockWalletData.recentTransactions.length + 1,
                type: 'payment_sent',
                amount: milestone.amount,
                date: new Date().toISOString(),
                description: `Payment for milestone: ${milestone.title}`,
                status: 'confirmed',
                txHash: '0x' + Math.random().toString(16).substring(2, 30),
                client: milestone.client.name,
                job_title: milestone.job_title
            };

            mockWalletData.recentTransactions.unshift(newTransaction);
            mockWalletData.balance -= milestone.amount;
        }
    }

    return [200, { success: true, message: 'Payment processed successfully' }];
});

// Supabase mock endpoints
mock.onGet('/supabase/profile').reply(200, {
    id: mockUser.id,
    username: mockUser.username,
    first_name: mockUser.firstName,
    last_name: mockUser.lastName,
    email: mockUser.email,
    wallet_address: mockUser.wallet_address,
    bio: mockUser.bio,
    skills: mockUser.skills,
    location: mockUser.location,
    role: mockUser.role,
    created_at: '2025-01-15T10:30:00Z',
    updated_at: '2025-05-10T15:45:00Z'
});

// Allow certain endpoints to pass through to actual API
// mock.onAny().passThrough();

console.log('Enhanced Mock API Service has been initialized');

export default mock; 