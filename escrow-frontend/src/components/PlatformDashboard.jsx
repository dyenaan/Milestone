import React, { useState, useEffect } from 'react';

const PlatformDashboard = ({ client, wallet, jobs, moduleAddress, userRole }) => {
  // If user is a reviewer, start on the reviews tab
  const [activeTab, setActiveTab] = useState(userRole === 'reviewer' ? 'reviews' : 'disputes');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [disputedJobs, setDisputedJobs] = useState([]);
  
  // Use this to show a welcome message
  const isFirstVisit = localStorage.getItem('reviewerVisited') !== 'true';
  
  // Set a flag to remember that reviewer has visited
  useEffect(() => {
    if (userRole === 'reviewer') {
      localStorage.setItem('reviewerVisited', 'true');
    }
  }, [userRole]);

  // Filter jobs with active disputes
  useEffect(() => {
    // Add debug logging
    console.log("All jobs in platform dashboard:", jobs);
    
    // Check each job's milestones for disputes
    jobs.forEach(job => {
      job.milestones.forEach((milestone, index) => {
        console.log(`Job ${job.client} Milestone #${index} status: ${milestone.status}`);
      });
    });
    
    const filtered = jobs.filter(job => {
      // Check if any milestone is in dispute (status code 4)
      const hasDispute = job.milestones.some(milestone => milestone.status === 4);
      return hasDispute;
    });
    
    console.log("Filtered disputed jobs:", filtered);
    setDisputedJobs(filtered);
  }, [jobs]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold mb-4">{userRole === 'reviewer' ? 'Reviewer Dashboard' : 'Platform Dashboard'}</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <strong>Success!</strong> Your action has been processed.
        </div>
      )}
      
      {/* Show welcome message for first-time reviewers */}
      {isFirstVisit && userRole === 'reviewer' && (
        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-4">
          <h3 className="font-bold">Welcome, Reviewer!</h3>
          <p>You have been assigned to help resolve disputes between clients and freelancers. Your vote matters in determining the outcome.</p>
          <p className="mt-2">Please review the evidence submitted and cast your vote on any assignments below.</p>
        </div>
      )}
      
      <div className="border-b mb-6">
        <nav className="flex space-x-4">
          <button
            className={`py-2 px-3 ${activeTab === 'disputes' ? 'border-b-2 border-blue-500 text-blue-600 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('disputes')}
          >
            Active Disputes
          </button>
          <button
            className={`py-2 px-3 ${activeTab === 'reviews' ? 'border-b-2 border-blue-500 text-blue-600 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('reviews')}
          >
            {userRole === 'reviewer' ? 'My Assignments' : 'Review Assignments'}
          </button>
        </nav>
      </div>
      
      {activeTab === 'disputes' && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Jobs with Active Disputes</h3>
          
          {/* Debug info */}
          <div className="bg-gray-100 p-4 mb-4 rounded text-xs overflow-auto max-h-40">
            <p className="font-semibold">Debug Information:</p>
            <p>Total jobs loaded: {jobs.length}</p>
            <p>Jobs with disputes: {disputedJobs.length}</p>
            <p>Job milestone statuses:</p>
            <ul className="mt-2 pl-4 list-disc">
              {jobs.map((job, jobIndex) => (
                <li key={jobIndex}>
                  Job {jobIndex + 1} (Client: {formatAddress(job.client)}):
                  <ul className="pl-4 list-disc">
                    {job.milestones.map((m, idx) => (
                      <li key={idx}>
                        Milestone #{idx}: Status {m.status} ({m.status === 0 ? 'Pending' : 
                                                             m.status === 1 ? 'Submitted' : 
                                                             m.status === 2 ? 'Approved' : 
                                                             m.status === 3 ? 'Rejected' : 
                                                             m.status === 4 ? 'In Dispute' : 'Unknown'})
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
          
          {disputedJobs.length === 0 ? (
            <p className="text-gray-500 italic">No active disputes found.</p>
          ) : (
            <div className="space-y-4">
              {disputedJobs.map((job, index) => {
                // Find the disputed milestone
                const disputedMilestoneIndex = job.milestones.findIndex(m => m.status === 4);
                const disputedMilestone = job.milestones[disputedMilestoneIndex];
                
                return disputedMilestone ? (
                  <div key={index} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium">
                        Dispute: Client {formatAddress(job.client)} - Milestone #{disputedMilestoneIndex}
                      </h4>
                      <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
                        In Dispute
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Client:</p>
                        <p className="font-mono text-xs">{job.client}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Freelancer:</p>
                        <p className="font-mono text-xs">{job.freelancer}</p>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <p className="text-sm text-gray-600 mb-1">Milestone Amount:</p>
                      <p className="font-medium">{(disputedMilestone.amount / 100000000).toFixed(2)} APT</p>
                    </div>
                    
                    {!disputedMilestone.reviewers || disputedMilestone.reviewers.length === 0 ? (
                      <AssignReviewersForm 
                        job={job}
                        milestoneIndex={disputedMilestoneIndex}
                        client={client}
                        wallet={wallet}
                        moduleAddress={moduleAddress}
                        onSuccess={() => {
                          setSuccess(true);
                          setTimeout(() => setSuccess(false), 3000);
                        }}
                        onError={(err) => setError(err)}
                      />
                    ) : (
                      <div>
                        <h5 className="font-medium mb-2">Assigned Reviewers:</h5>
                        <div className="bg-white p-3 rounded border grid gap-2">
                          {disputedMilestone.reviewers.map((reviewer, idx) => (
                            <div key={idx} className="flex justify-between items-center">
                              <span className="font-mono text-xs">{formatAddress(reviewer)}</span>
                              
                              {disputedMilestone.votes && disputedMilestone.votes.find(v => v.reviewer === reviewer) ? (
                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                                  Voted
                                </span>
                              ) : (
                                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                                  Pending
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : null;
              })}
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'reviews' && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Your Review Assignments</h3>
          
          <ReviewerAssignmentsList 
            jobs={jobs}
            wallet={wallet}
            client={client}
            moduleAddress={moduleAddress}
            onSuccess={() => {
              setSuccess(true);
              setTimeout(() => setSuccess(false), 3000);
            }}
            onError={(err) => setError(err)}
          />
        </div>
      )}
    </div>
  );
};

// Helper component to assign reviewers
const AssignReviewersForm = ({ job, milestoneIndex, client, wallet, moduleAddress, onSuccess, onError }) => {
  const [reviewers, setReviewers] = useState(['', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  
  const handleReviewerChange = (index, value) => {
    const updatedReviewers = [...reviewers];
    updatedReviewers[index] = value;
    setReviewers(updatedReviewers);
  };
  
  const handleAssignReviewers = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (!wallet || !client) {
        throw new Error("Wallet not connected");
      }
      
      // Validate reviewers
      if (reviewers.some(r => !r)) {
        throw new Error("All reviewer addresses must be filled");
      }
      
      // Construct the transaction payload
      const payload = {
        function: `${moduleAddress}::escrow::assign_reviewers`,
        type_arguments: [],
        arguments: [
          job.client,
          milestoneIndex.toString(),
          reviewers
        ]
      };
      
      console.log("Assigning reviewers with payload:", payload);
      
      try {
        // Sign and submit transaction
        const pendingTransaction = await window.aptos.signAndSubmitTransaction({ payload });
        console.log("Transaction submitted:", pendingTransaction);
        
        if (pendingTransaction && pendingTransaction.hash) {
          onSuccess();
          
          // Attempt to wait for transaction but don't block the UI
          try {
            client.waitForTransaction(pendingTransaction.hash)
              .then(() => {
                console.log("Transaction confirmed");
                // Refresh the page after confirmation
                setTimeout(() => window.location.reload(), 2000);
              })
              .catch(confirmErr => console.warn("Warning: Could not confirm transaction:", confirmErr));
          } catch (waitErr) {
            console.warn("Warning: Could not confirm transaction:", waitErr);
          }
        } else {
          throw new Error("Transaction did not return a hash");
        }
      } catch (txErr) {
        console.error("Transaction error:", txErr);
        throw new Error(`Transaction failed: ${txErr.message || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Assign reviewers error:", err);
      onError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleAssignReviewers} className="bg-white p-4 rounded border">
      <h5 className="font-medium mb-3">Assign Reviewers</h5>
      
      <div className="space-y-3 mb-4">
        {reviewers.map((reviewer, index) => (
          <div key={index} className="flex items-center">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
              <span className="text-purple-800 font-semibold">{index + 1}</span>
            </div>
            <input
              type="text"
              value={reviewer}
              onChange={(e) => handleReviewerChange(index, e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder={`Reviewer ${index + 1} Address`}
              required
            />
          </div>
        ))}
      </div>
      
      <button
        type="submit"
        className={`bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition flex items-center ${
          loading ? "opacity-50 cursor-not-allowed" : ""
        }`}
        disabled={loading}
      >
        {loading ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Assigning...
          </span>
        ) : (
          <span className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Assign Reviewers
          </span>
        )}
      </button>
    </form>
  );
};

// Component to list review assignments for the current user
const ReviewerAssignmentsList = ({ jobs, wallet, client, moduleAddress, onSuccess, onError }) => {
  const [loading, setLoading] = useState(false);
  const [assignments, setAssignments] = useState([]);
  
  // Find assignments for the current wallet
  useEffect(() => {
    if (!wallet) return;
    
    const reviewerAssignments = [];
    
    // Loop through all jobs
    jobs.forEach(job => {
      // Loop through each milestone to find assignments
      job.milestones.forEach((milestone, milestoneIndex) => {
        // Check if this milestone is in dispute and has reviewers assigned
        if (milestone.status === 4 && milestone.reviewers && milestone.reviewers.length > 0) {
          // Check if current wallet is assigned as a reviewer
          if (milestone.reviewers.includes(wallet.address)) {
            // Check if user has already voted
            const hasVoted = milestone.votes && milestone.votes.some(vote => vote.reviewer === wallet.address);
            
            reviewerAssignments.push({
              job,
              milestoneIndex,
              milestone,
              hasVoted
            });
          }
        }
      });
    });
    
    setAssignments(reviewerAssignments);
  }, [jobs, wallet]);
  
  // Handle voting on a milestone
  const handleVote = async (jobClient, milestoneIndex, voteValue) => {
    setLoading(true);
    
    try {
      if (!wallet || !client) {
        throw new Error("Wallet not connected");
      }
      
      // Construct the transaction payload
      const payload = {
        function: `${moduleAddress}::escrow::cast_vote`,
        type_arguments: ["0x1::aptos_coin::AptosCoin"],
        arguments: [
          jobClient,
          milestoneIndex.toString(),
          voteValue.toString()
        ]
      };
      
      console.log("Casting vote with payload:", payload);
      
      try {
        // Sign and submit transaction
        const pendingTransaction = await window.aptos.signAndSubmitTransaction({ payload });
        console.log("Transaction submitted:", pendingTransaction);
        
        if (pendingTransaction && pendingTransaction.hash) {
          onSuccess();
          
          // Attempt to wait for transaction but don't block the UI
          try {
            client.waitForTransaction(pendingTransaction.hash)
              .then(() => {
                console.log("Transaction confirmed");
                // Refresh the page after confirmation
                setTimeout(() => window.location.reload(), 2000);
              })
              .catch(confirmErr => console.warn("Warning: Could not confirm transaction:", confirmErr));
          } catch (waitErr) {
            console.warn("Warning: Could not confirm transaction:", waitErr);
          }
        } else {
          throw new Error("Transaction did not return a hash");
        }
      } catch (txErr) {
        console.error("Transaction error:", txErr);
        throw new Error(`Transaction failed: ${txErr.message || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Vote error:", err);
      onError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  if (assignments.length === 0) {
    return (
      <p className="text-gray-500 italic">You are not assigned to review any disputes.</p>
    );
  }
  
  return (
    <div className="space-y-4">
      {assignments.map((assignment, index) => (
        <div key={index} className="border rounded-lg p-4 bg-gray-50">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-medium">
              Review Assignment - Milestone #{assignment.milestoneIndex}
            </h4>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              assignment.hasVoted 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {assignment.hasVoted ? 'Voted' : 'Vote Required'}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
            <div>
              <p className="text-sm text-gray-600 mb-1">Client:</p>
              <p className="font-mono text-xs">{formatAddress(assignment.job.client)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Freelancer:</p>
              <p className="font-mono text-xs">{formatAddress(assignment.job.freelancer)}</p>
            </div>
          </div>
          
          <div className="mb-3">
            <p className="text-sm text-gray-600 mb-1">Milestone Amount:</p>
            <p className="font-medium">{(assignment.milestone.amount / 100000000).toFixed(2)} APT</p>
          </div>
          
          {assignment.milestone.submission_evidence && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-1">Submitted Evidence:</p>
              <div className="bg-white p-3 rounded border">
                {formatEvidence(assignment.milestone.submission_evidence)}
              </div>
            </div>
          )}
          
          {!assignment.hasVoted && (
            <div className="bg-white p-3 rounded border mb-3">
              <h5 className="font-medium mb-2">Cast Your Vote:</h5>
              <div className="flex space-x-4 mb-3">
                <div className="w-1/2">
                  <button
                    onClick={() => handleVote(assignment.job.client, assignment.milestoneIndex, "1")}
                    disabled={loading}
                    className={`w-full border border-green-500 bg-green-50 hover:bg-green-100 text-green-700 font-medium py-2 px-4 rounded transition ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Approve Milestone
                  </button>
                  <p className="text-xs text-gray-500 mt-1 text-center">
                    Freelancer will receive payment
                  </p>
                </div>
                <div className="w-1/2">
                  <button
                    onClick={() => handleVote(assignment.job.client, assignment.milestoneIndex, "0")}
                    disabled={loading}
                    className={`w-full border border-red-500 bg-red-50 hover:bg-red-100 text-red-700 font-medium py-2 px-4 rounded transition ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Reject Milestone
                  </button>
                  <p className="text-xs text-gray-500 mt-1 text-center">
                    Funds will remain in escrow
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="text-sm text-gray-600">
            <p>Current votes: {assignment.milestone.votes ? assignment.milestone.votes.length : 0} / {assignment.milestone.reviewers.length}</p>
            <p>Required for decision: {assignment.job.min_votes_required} votes</p>
          </div>
        </div>
      ))}
    </div>
  );
};

// Helper function to format addresses
const formatAddress = (address) => {
  if (!address) return '';
  return `${address.substring(0, 8)}...${address.substring(address.length - 8)}`;
};

// Helper function to format evidence
const formatEvidence = (evidenceHex) => {
  if (!evidenceHex || evidenceHex === '0x') return 'No evidence provided';
  
  try {
    const cleanHex = evidenceHex.startsWith('0x') ? evidenceHex.slice(2) : evidenceHex;
    
    // Convert hex to string
    let str = '';
    for (let i = 0; i < cleanHex.length; i += 2) {
      str += String.fromCharCode(parseInt(cleanHex.substr(i, 2), 16));
    }
    
    const evidenceStr = str.trim();
    
    // Check if it's a URL
    const isUrl = evidenceStr.startsWith('http') || 
                  evidenceStr.includes('github.com') || 
                  evidenceStr.includes('://');
    
    if (isUrl) {
      // Create proper URL
      let url = evidenceStr;
      if (!url.startsWith('http')) {
        url = 'https://' + url;
      }
      
      return (
        <a 
          href={url}
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline flex items-center break-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          {evidenceStr.length > 50 ? evidenceStr.substring(0, 50) + '...' : evidenceStr}
        </a>
      );
    } else {
      return (
        <div className="break-all">
          <span className="text-gray-800">{evidenceStr}</span>
          <div className="mt-2 text-xs text-gray-500">
            Raw hex: <span className="font-mono">{evidenceHex.substring(0, 20)}...</span>
          </div>
        </div>
      );
    }
  } catch (err) {
    console.warn('Failed to decode hex:', err);
    return `Raw data: ${evidenceHex.substring(0, 20)}...`;
  }
};

export default PlatformDashboard;