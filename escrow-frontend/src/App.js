import React, { useState, useEffect } from 'react';
import { AptosClient } from 'aptos';
import Navbar from './components/Navbar';
import WalletConnector from './components/WalletConnector';
import CreateJob from './components/CreateJob';
import JobDetails from './components/JobDetails';
import SubmitWork from './components/SubmitWork';
import ApproveMilestone from './components/ApproveMilestone';
import DisputePanel from './components/DisputePanel';

// Constants
const MODULE_ADDRESS = '0x4821c48de763368f2e7aeef5cfe101c9215289401eef61eb0ae5e5c38f9f3034';
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
  const [userRole, setUserRole] = useState(null); // 'client', 'freelancer', or 'platform'

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
      setUserRole('reviewer'); // Default to reviewer if none of the above
    }
  }, [wallet, selectedJob]);

  // Fetch jobs for the connected wallet
  // In App.js, update the fetchJobs function
  const fetchJobs = async () => {
    if (!wallet || !client) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log("Fetching jobs for address:", wallet.address);
      const jobsFound = [];
      
      // 1. Try to find jobs created by this account (client role)
      try {
        console.log("Checking for jobs where account is the client...");
        const jobDetails = await client.getAccountResource(
          wallet.address,
          `${MODULE_ADDRESS}::escrow::Job`
        );
        
        console.log("Job details from blockchain (as client):", jobDetails);
        
        if (jobDetails && jobDetails.data) {
          // Convert the raw blockchain data to our job format
          const job = {
            client: jobDetails.data.client,
            freelancer: jobDetails.data.freelancer,
            current_step: parseInt(jobDetails.data.current_step),
            total_milestones: parseInt(jobDetails.data.total_milestones),
            is_active: jobDetails.data.is_active,
            platform_address: jobDetails.data.platform_address,
            escrow_address: jobDetails.data.escrow_address,
            milestones: []
          };
          
          // Process milestones if available
          if (jobDetails.data.milestones && Array.isArray(jobDetails.data.milestones)) {
            job.milestones = jobDetails.data.milestones.map(m => ({
              description: m.description,
              amount: parseInt(m.amount),
              status: parseInt(m.status),
              submission_evidence: m.submission_evidence,
              reviewers: m.reviewers || [],
              votes: m.votes || []
            }));
          }
          
          jobsFound.push(job);
          console.log("Added job where account is client:", job);
        }
      } catch (resourceErr) {
        console.log("No jobs found where account is the client");
      }
      
      // 2. If account is a freelancer, search for jobs by querying all accounts
      // This is a simplified approach - in a real app, you'd need a more efficient solution
      try {
        console.log("Checking for jobs where account is the freelancer...");
        
        // Try to use view functions to find jobs where this account is the freelancer
        try {
          const viewResponse = await client.view({
            function: `${MODULE_ADDRESS}::escrow::get_job_details`,
            type_arguments: [],
            arguments: [wallet.address]
          });
          
          // If we get here, the account has a job resource, which was handled in the client section
        } catch (e) {
          // No job resource found, this is expected if the user is only a freelancer
        }
        
        // Since we can't directly query for all jobs assigned to a freelancer,
        // we need to check known client addresses
        // In a real app, you'd have a backend service or indexer to track this
        
        // Check the known client address (from our job details page)
        // This is a workaround for the demo - a real app would need a better solution
        const knownClientAddresses = [
          "0x89a4067306d3453d00068fedb023b29fa834adfa8f7766b9530f14881b95030a"
        ];
        
        for (const clientAddress of knownClientAddresses) {
          try {
            const viewResponse = await client.view({
              function: `${MODULE_ADDRESS}::escrow::get_job_details`,
              type_arguments: [],
              arguments: [clientAddress]
            });
            
            console.log("Job details from view function (checking client):", viewResponse);
            
            if (viewResponse && viewResponse.length >= 7) {
              const jobClient = viewResponse[0];
              const jobFreelancer = viewResponse[1];
              
              // Check if this account is the freelancer for this job
              if (jobFreelancer === wallet.address) {
                console.log("Found job where account is the freelancer!");
                
                // Create a job object from the view function results
                const job = {
                  client: jobClient,
                  freelancer: jobFreelancer,
                  current_step: parseInt(viewResponse[2]),
                  total_milestones: parseInt(viewResponse[3]),
                  is_active: viewResponse[4],
                  platform_address: viewResponse[5],
                  escrow_address: viewResponse[6],
                  milestones: []
                };
                
                // Now fetch milestone details for each milestone
                for (let i = 0; i < job.total_milestones; i++) {
                  try {
                    const milestoneResult = await client.view({
                      function: `${MODULE_ADDRESS}::escrow::get_milestone_details`,
                      type_arguments: [],
                      arguments: [jobClient, i.toString()]
                    });
                    
                    if (milestoneResult && milestoneResult.length >= 4) {
                      job.milestones.push({
                        description: milestoneResult[0],
                        amount: parseInt(milestoneResult[1]),
                        status: parseInt(milestoneResult[2]),
                        submission_evidence: milestoneResult[3],
                        reviewers: [],
                        votes: []
                      });
                    }
                  } catch (milestoneErr) {
                    console.error(`Error fetching milestone ${i}:`, milestoneErr);
                  }
                }
                
                jobsFound.push(job);
                console.log("Added job where account is freelancer:", job);
              }
            }
          } catch (clientViewErr) {
            console.log(`No job found for client address ${clientAddress}`);
          }
        }
      } catch (freelancerErr) {
        console.log("Error checking for jobs where account is freelancer:", freelancerErr);
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
  // In App.js
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
                
                {(userRole === 'freelancer' || userRole === 'platform') && (
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