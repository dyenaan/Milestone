import React, { useState, useEffect } from 'react';
import { AptosClient } from 'aptos';
import Navbar from './components/Navbar';
import WalletConnector from './components/WalletConnector';
import CreateJob from './components/CreateJob';
import JobDetails from './components/JobDetails';
import SubmitWork from './components/SubmitWork';
import ApproveMilestone from './components/ApproveMilestone';
import DisputePanel from './components/DisputePanel';
import PlatformDashboard from './components/PlatformDashboard';
import ReviewerDashboard from './components/ReviewerDashboard';


// Constants - UPDATED WITH NEW CONTRACT ADDRESS
const MODULE_ADDRESS = '0x066f058a8662986ca69e272d91e4a119ff26adb7fe2eace3902a7769e8b396b2';
const ESCROW_MODULE = `${MODULE_ADDRESS}::escrow`;
const NODE_URL = 'https://fullnode.testnet.aptoslabs.com/v1';

function App() {
  const [wallet, setWallet] = useState(null);
  const [client, setClient] = useState(null);
  const [activeTab, setActiveTab] = useState('jobs');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [userRole, setUserRole] = useState(null); // 'client', 'freelancer', 'platform', or 'reviewer'

  // Initialize Aptos client
  useEffect(() => {
    const client = new AptosClient(NODE_URL);
    setClient(client);
  }, []);

  // Refresh jobs when switching to "jobs" tab
  useEffect(() => {
    if (activeTab === 'jobs' && wallet) {
      fetchJobs();
    }
  }, [activeTab, wallet]);

  // Determine user role when wallet changes
  useEffect(() => {
    if (!wallet || !selectedJob) return;
    
    if (wallet.address === selectedJob.client) {
      setUserRole('client');
    } else if (wallet.address === selectedJob.freelancer) {
      setUserRole('freelancer');
    } else if (wallet.address === selectedJob.platform_address) {
      setUserRole('platform');
    } else {
      // Check if user is a reviewer for any milestone
      const isReviewer = selectedJob.milestones.some(
        milestone => milestone.reviewers && milestone.reviewers.includes(wallet.address)
      );
      
      setUserRole(isReviewer ? 'reviewer' : null);
    }
  }, [wallet, selectedJob]);

  // Enhanced fetchJobs function with better reviewers handling
  const fetchJobs = async () => {
    if (!wallet || !client) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log("Fetching jobs for address:", wallet.address);
      const jobsFound = [];
      
      // For platform user, we want to fetch all jobs to see disputes
      const isPlatform = wallet.address === '0x719cfc881c125386b260d97a5adf36d5653d96b2e733b88fbbedcf428f8bfbed';
      
      // 1. Try to find jobs created by this account (client role)
      try {
        console.log("Checking for jobs where account is the client...");
        const jobDetails = await client.getAccountResource(
          wallet.address,
          `${MODULE_ADDRESS}::escrow::Job`
        );
        
        console.log("Job details from blockchain (as client):", jobDetails);
        
        if (jobDetails && jobDetails.data) {
          // Get the min votes required
          let minVotesRequired = 3; // Default
          try {
            const votesResult = await client.view({
              function: `${MODULE_ADDRESS}::escrow::get_min_votes_required`,
              type_arguments: [],
              arguments: [wallet.address]
            });
            
            if (votesResult && votesResult.length > 0) {
              minVotesRequired = parseInt(votesResult[0]);
              console.log("Min votes required:", minVotesRequired);
            }
          } catch (votesErr) {
            console.log("Error fetching min votes required:", votesErr);
          }
          
          // Convert the raw blockchain data to our job format
          const job = {
            client: jobDetails.data.client,
            freelancer: jobDetails.data.freelancer,
            current_step: parseInt(jobDetails.data.current_step),
            total_milestones: parseInt(jobDetails.data.total_milestones),
            is_active: jobDetails.data.is_active,
            platform_address: jobDetails.data.platform_address,
            escrow_address: jobDetails.data.escrow_address,
            min_votes_required: minVotesRequired,
            milestones: []
          };
          
          // Process milestones if available
          if (jobDetails.data.milestones && Array.isArray(jobDetails.data.milestones)) {
            job.milestones = await Promise.all(jobDetails.data.milestones.map(async (m, index) => {
              // For each milestone, fetch reviewers if in dispute
              let reviewers = m.reviewers || [];
              let votes = m.votes || [];
              
              if (parseInt(m.status) === 4) { // IN_DISPUTE
                try {
                  // Try to fetch reviewers directly
                  const reviewersResult = await client.view({
                    function: `${MODULE_ADDRESS}::escrow::get_milestone_reviewers`,
                    type_arguments: [],
                    arguments: [job.client, index.toString()]
                  });
                  
                  if (reviewersResult && Array.isArray(reviewersResult[0])) {
                    reviewers = reviewersResult[0];
                    console.log(`Fetched reviewers for milestone ${index}:`, reviewers);
                  }
                  
                  // Try to fetch votes if any
                  try {
                    const votesResult = await client.view({
                      function: `${MODULE_ADDRESS}::escrow::get_milestone_votes`,
                      type_arguments: [],
                      arguments: [job.client, index.toString()]
                    });
                    
                    if (votesResult && Array.isArray(votesResult[0])) {
                      const fetchedVotes = votesResult[0].map((voter, idx) => ({
                        reviewer: voter,
                        vote: parseInt(votesResult[1][idx])
                      }));
                      votes = fetchedVotes;
                      console.log(`Fetched votes for milestone ${index}:`, votes);
                    }
                  } catch (votesErr) {
                    console.log(`Error fetching votes for milestone ${index}:`, votesErr);
                  }
                } catch (reviewersErr) {
                  console.log(`Error fetching reviewers for milestone ${index}:`, reviewersErr);
                }
              }
              
              return {
                description: m.description,
                amount: parseInt(m.amount),
                status: parseInt(m.status),
                submission_evidence: m.submission_evidence,
                reviewers: reviewers,
                votes: votes
              };
            }));
          }
          
          jobsFound.push(job);
          console.log("Added job where account is client:", job);
        }
      } catch (resourceErr) {
        console.log("No jobs found where account is the client");
      }
      
      // 2. If account is a freelancer, platform, or potential reviewer, search for jobs
      try {
        if (isPlatform || wallet.address !== jobsFound[0]?.client) {
          console.log("Checking for jobs where account is the freelancer, platform or reviewer...");
          
          // Check the known client addresses - in a real app, this would be from a backend service
          const knownClientAddresses = [
            "0x89a4067306d3453d00068fedb023b29fa834adfa8f7766b9530f14881b95030a"
          ];
          
          for (const clientAddress of knownClientAddresses) {
            try {
              console.log(`Checking for jobs from client address: ${clientAddress}`);
              
              const viewResponse = await client.view({
                function: `${MODULE_ADDRESS}::escrow::get_job_details`,
                type_arguments: [],
                arguments: [clientAddress]
              });
              
              console.log("Job details from view function (checking client):", viewResponse);
              
              if (viewResponse && viewResponse.length >= 7) {
                const jobClient = viewResponse[0];
                const jobFreelancer = viewResponse[1];
                const platformAddress = viewResponse[5];
                
                // Get the min votes required
                let minVotesRequired = 3; // Default
                try {
                  const votesResult = await client.view({
                    function: `${MODULE_ADDRESS}::escrow::get_min_votes_required`,
                    type_arguments: [],
                    arguments: [clientAddress]
                  });
                  
                  if (votesResult && votesResult.length > 0) {
                    minVotesRequired = parseInt(votesResult[0]);
                    console.log("Min votes required:", minVotesRequired);
                  }
                } catch (votesErr) {
                  console.log("Error fetching min votes required:", votesErr);
                }
                
                // Create a job object from the view function results
                const job = {
                  client: jobClient,
                  freelancer: jobFreelancer,
                  current_step: parseInt(viewResponse[2]),
                  total_milestones: parseInt(viewResponse[3]),
                  is_active: viewResponse[4],
                  platform_address: platformAddress,
                  escrow_address: viewResponse[6],
                  min_votes_required: minVotesRequired,
                  milestones: []
                };
                
                // Now fetch milestone details for each milestone
                let isUserReviewer = false;
                
                for (let i = 0; i < job.total_milestones; i++) {
                  try {
                    const milestoneResult = await client.view({
                      function: `${MODULE_ADDRESS}::escrow::get_milestone_details`,
                      type_arguments: [],
                      arguments: [jobClient, i.toString()]
                    });
                    
                    if (milestoneResult && milestoneResult.length >= 4) {
                      // Basic milestone info
                      const milestone = {
                        description: milestoneResult[0],
                        amount: parseInt(milestoneResult[1]),
                        status: parseInt(milestoneResult[2]),
                        submission_evidence: milestoneResult[3],
                        reviewers: [],
                        votes: []
                      };
                      
                      // If milestone is in dispute, fetch reviewers and votes
                      if (milestone.status === 4) { // IN_DISPUTE
                        try {
                          // Fetch reviewers
                          const reviewersResult = await client.view({
                            function: `${MODULE_ADDRESS}::escrow::get_milestone_reviewers`,
                            type_arguments: [],
                            arguments: [jobClient, i.toString()]
                          });
                          
                          if (reviewersResult && Array.isArray(reviewersResult[0])) {
                            milestone.reviewers = reviewersResult[0];
                            console.log(`Fetched reviewers for milestone ${i}:`, milestone.reviewers);
                            
                            // Check if current user is a reviewer
                           // Allow anyone to review for now since reviewer info can't be fetched
const isReviewer = true;

                          }
                          
                          // Fetch votes
                          try {
                            const votesResult = await client.view({
                              function: `${MODULE_ADDRESS}::escrow::get_milestone_votes`,
                              type_arguments: [],
                              arguments: [jobClient, i.toString()]
                            });
                            
                            if (votesResult && Array.isArray(votesResult[0])) {
                              const fetchedVotes = votesResult[0].map((voter, idx) => ({
                                reviewer: voter,
                                vote: parseInt(votesResult[1][idx])
                              }));
                              milestone.votes = fetchedVotes;
                              console.log(`Fetched votes for milestone ${i}:`, milestone.votes);
                            }
                          } catch (votesErr) {
                            console.log(`Error fetching votes for milestone ${i}:`, votesErr);
                          }
                        } catch (reviewersErr) {
                          console.log(`Error fetching reviewers for milestone ${i}:`, reviewersErr);
                        }
                      }
                      
                      job.milestones.push(milestone);
                    }
                  } catch (milestoneErr) {
                    console.error(`Error fetching milestone ${i}:`, milestoneErr);
                  }
                }
                
                // Include the job if the user is freelancer, platform, or assigned as reviewer
                const shouldInclude = true; // Show all jobs regardless of role

                
                if (shouldInclude) {
                  // Only add the job if it's not already in the list (avoid duplicates)
                  const isDuplicate = jobsFound.some(existingJob => 
                    existingJob.client === job.client && existingJob.freelancer === job.freelancer
                  );
                  
                  if (!isDuplicate) {
                    jobsFound.push(job);
                    console.log("Added job:", job);
                  }
                }
              }
            } catch (clientViewErr) {
              console.log(`No job found for client address ${clientAddress}`);
            }
          }
        }
      } catch (searchErr) {
        console.log("Error checking for other jobs:", searchErr);
      }
      
      // Set the jobs found
      if (jobsFound.length > 0) {
        setJobs(jobsFound);
        console.log("Final job list:", jobsFound);
      } else {
        console.log("No jobs found for this account");
        setJobs([]);
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching jobs:", err);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  // Connect wallet using Petra, Martian, or other Aptos wallets
  const connectWallet = async () => {
    try {
      if (!window.aptos) {
        throw new Error("Aptos wallet extension not found! Please install Petra, Martian, or another Aptos wallet.");
      }
      
      // Check if wallet is already connected
      try {
        // First check if we're already connected
        const account = await window.aptos.account();
        
        setWallet({
          address: account.address,
          publicKey: account.publicKey,
        });
        
        // Fetch jobs after connecting
        await fetchJobs();
        return;
      } catch (e) {
        // Not connected yet, proceed with connection
        console.log("Not yet connected, attempting to connect...");
      }
      
      // Connect wallet
      await window.aptos.connect();
      
      // Get account info after connection
      const account = await window.aptos.account();
      
      setWallet({
        address: account.address,
        publicKey: account.publicKey,
      });
      
      // Fetch jobs after connecting
      await fetchJobs();
    } catch (err) {
      setError(`Failed to connect wallet: ${err.message}`);
      console.error("Wallet connection error:", err);
    }
  };
  
  const disconnectWallet = () => {
    if (window.aptos) {
      window.aptos.disconnect();
    }
    setWallet(null);
    setJobs([]);
    setSelectedJob(null);
  };

  const handleJobSelect = (job) => {
    setSelectedJob(job);
    setActiveTab('details');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar 
        wallet={wallet} 
        connectWallet={connectWallet} 
        disconnectWallet={disconnectWallet} 
      />
      
      <div className="container mx-auto px-4 py-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong>Error:</strong> {error}
          </div>
        )}
        
        {!wallet ? (
          <div className="flex justify-center">
            <WalletConnector onConnect={connectWallet} />
          </div>
        ) : (
          <div>
            <div className="flex mb-4 border-b">
              <button 
                className={`px-4 py-2 ${activeTab === 'jobs' ? 'border-b-2 border-blue-500 text-blue-500' : ''}`}
                onClick={() => setActiveTab('jobs')}
              >
                My Jobs
              </button>
              <button 
                className={`px-4 py-2 ${activeTab === 'create' ? 'border-b-2 border-blue-500 text-blue-500' : ''}`}
                onClick={() => setActiveTab('create')}
              >
                Create Job
              </button>
              {wallet.address === '0x719cfc881c125386b260d97a5adf36d5653d96b2e733b88fbbedcf428f8bfbed' && (
                <button 
                  className={`px-4 py-2 ${activeTab === 'platform' ? 'border-b-2 border-blue-500 text-blue-500' : ''}`}
                  onClick={() => setActiveTab('platform')}
                >
                  Platform Dashboard
                </button>
              )}
              {/* Add a Reviews tab for reviewers */}
              <button 
  className={`px-4 py-2 ${activeTab === 'reviews' ? 'border-b-2 border-blue-500 text-blue-500' : ''}`}
  onClick={() => setActiveTab('reviews')}
>
  My Reviews
</button>

              {selectedJob && (
                <button 
                  className={`px-4 py-2 ${activeTab === 'details' ? 'border-b-2 border-blue-500 text-blue-500' : ''}`}
                  onClick={() => setActiveTab('details')}
                >
                  Job Details
                </button>
              )}
            </div>
            
            {activeTab === 'jobs' && (
              <div>
                <h2 className="text-2xl font-bold mb-4">My Jobs</h2>
                {loading ? (
                  <p>Loading jobs...</p>
                ) : jobs.length === 0 ? (
                  <p>No jobs found. Create a new job to get started!</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {jobs.map((job, index) => (
                      <div 
                        key={index} 
                        className="border p-4 rounded cursor-pointer hover:bg-gray-50"
                        onClick={() => handleJobSelect(job)}
                      >
                        <h3 className="font-bold">Job #{index + 1}</h3>
                        <p>Milestones: {job.current_step}/{job.total_milestones}</p>
                        <p>Status: {job.is_active ? 'Active' : 'Completed'}</p>
                        {/* Show dispute indicator if any milestone is in dispute */}
                        {job.milestones.some(m => m.status === 4) && (
                          <p className="mt-2">
                            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                              Dispute in Progress
                            </span>
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'create' && (
              <CreateJob 
                client={client}
                wallet={wallet}
                moduleAddress={MODULE_ADDRESS}
                onJobCreated={fetchJobs}
              />
            )}
            
            {activeTab === 'platform' && (
  <PlatformDashboard
    client={client}
    wallet={wallet}
    jobs={jobs}
    moduleAddress={MODULE_ADDRESS}
    userRole="platform"
  />
)}

{activeTab === 'reviews' && (
  <ReviewerDashboard
    client={client}
    wallet={wallet}
    jobs={jobs}
    moduleAddress={MODULE_ADDRESS}
  />
)}

            
            {activeTab === 'details' && selectedJob && (
              <div>
                <JobDetails 
                  job={selectedJob} 
                  userRole={userRole}
                />
                
                {userRole === 'freelancer' && (
                  <SubmitWork 
                    client={client}
                    wallet={wallet}
                    job={selectedJob}
                    moduleAddress={MODULE_ADDRESS}
                  />
                )}
                
                {userRole === 'client' && (
                  <ApproveMilestone 
                    client={client}
                    wallet={wallet}
                    job={selectedJob}
                    moduleAddress={MODULE_ADDRESS}
                  />
                )}
                
                {(userRole === 'freelancer' || userRole === 'platform' || userRole === 'client') && (
                  <DisputePanel 
                    client={client}
                    wallet={wallet}
                    job={selectedJob}
                    moduleAddress={MODULE_ADDRESS}
                    userRole={userRole}
                  />
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;