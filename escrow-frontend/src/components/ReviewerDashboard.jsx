import React, { useState, useEffect } from 'react';

const ReviewerDashboard = ({ client, wallet, jobs, moduleAddress }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [assignments, setAssignments] = useState([]);
  
  // Find assignments for the current wallet
  useEffect(() => {
    if (!wallet || !jobs || jobs.length === 0) return;
  
    console.log("Looking for reviewer assignments in jobs:", jobs);
    const reviewerAssignments = [];
  
    jobs.forEach(job => {
      job.milestones.forEach((milestone, milestoneIndex) => {
        // Show all disputed milestones regardless of reviewer list
        if (milestone.status === 4) {
          const hasVoted =
            milestone.votes &&
            milestone.votes.some(vote => vote.reviewer === wallet.address);
  
          reviewerAssignments.push({
            job,
            milestoneIndex,
            milestone: {
              ...milestone,
              reviewers: milestone.reviewers || [wallet.address], // fallback reviewer
            },
            hasVoted,
          });
        }
      });
    });
  
    console.log("Found reviewer assignments:", reviewerAssignments);
    setAssignments(reviewerAssignments);
  }, [jobs, wallet]);
  
  
  // Handle voting on a milestone
  const handleVote = async (jobClient, milestoneIndex, voteValue) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    
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
        const pendingTransaction = await window.aptos.signAndSubmitTransaction(payload);
        console.log("Transaction submitted:", pendingTransaction);
        
        if (pendingTransaction && pendingTransaction.hash) {
          setSuccess(true);
          
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
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function to convert hex to text
  const hexToString = (hex) => {
    if (!hex || hex === '0x') return '';
  
    try {
      const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
  
      // Convert hex to string
      let str = '';
      for (let i = 0; i < cleanHex.length; i += 2) {
        str += String.fromCharCode(parseInt(cleanHex.substr(i, 2), 16));
      }
  
      return str.trim();
    } catch (err) {
      console.warn('Failed to decode hex:', err);
      return hex;
    }
  };
  
  // Format address for display
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 8)}...${address.substring(address.length - 8)}`;
  };
  
  // Format evidence from hex
  const formatEvidence = (evidenceHex) => {
    if (!evidenceHex || evidenceHex === '0x') return 'No evidence provided';
    
    try {
      const evidenceStr = hexToString(evidenceHex);
      
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
  
  // If no assignments, show a message
  if (assignments.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Reviewer Dashboard</h2>
        <div className="text-gray-500 italic p-4">
          You are not assigned to review any disputes at this time.
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Reviewer Dashboard</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <strong>Success!</strong> Your vote has been submitted. The page will refresh shortly.
        </div>
      )}
      
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-3">Your Review Assignments</h3>
        <p className="text-gray-700 mb-4">
          As a reviewer, your vote helps resolve disputes between clients and freelancers.
          Please review the evidence below and cast your vote for each assignment.
        </p>
      </div>
      
      <div className="space-y-8">
        {assignments.map((assignment, index) => (
          <div key={index} className="border rounded-lg shadow-sm">
            {/* Header */}
            <div className="bg-gray-50 p-4 border-b rounded-t-lg flex justify-between items-center">
              <h4 className="font-semibold text-lg">
                Review Assignment #{index + 1}
              </h4>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                assignment.hasVoted 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {assignment.hasVoted ? 'Voted' : 'Vote Required'}
              </span>
            </div>
            
            {/* Job Details */}
            <div className="p-4 border-b">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Client:</p>
                  <p className="font-mono text-sm">{formatAddress(assignment.job.client)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Freelancer:</p>
                  <p className="font-mono text-sm">{formatAddress(assignment.job.freelancer)}</p>
                </div>
              </div>
              
              <div className="mt-3">
                <p className="text-sm text-gray-600 mb-1">Milestone Amount:</p>
                <p className="font-medium">{(assignment.milestone.amount / 100000000).toFixed(2)} APT</p>
              </div>
              
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-1">Milestone #{assignment.milestoneIndex}:</p>
                <div className="bg-gray-50 p-3 rounded mt-1">
                  <p className="font-medium">{assignment.milestone.description || `Step ${assignment.milestoneIndex + 1}`}</p>
                </div>
              </div>
            </div>
            
            {/* Evidence */}
            {assignment.milestone.submission_evidence && (
              <div className="p-4 border-b">
                <h5 className="font-medium text-gray-700 mb-2">Submitted Evidence:</h5>
                <div className="bg-white p-3 rounded border">
                  {formatEvidence(assignment.milestone.submission_evidence)}
                </div>
              </div>
            )}
            
            {/* Vote Controls */}
            {!assignment.hasVoted && (
              <div className="p-4">
                <h5 className="font-medium text-gray-800 mb-3">Cast Your Vote:</h5>
                <div className="flex space-x-4">
                  <div className="w-1/2">
                    <button
                      onClick={() => handleVote(assignment.job.client, assignment.milestoneIndex, "1")}
                      disabled={loading}
                      className={`w-full border border-green-500 bg-green-50 hover:bg-green-100 text-green-700 font-medium py-3 px-4 rounded transition ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {loading ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-green-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Submitting...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          Approve Milestone
                        </span>
                      )}
                    </button>
                    <p className="text-xs text-gray-500 mt-1 text-center">
                      Freelancer will receive payment
                    </p>
                  </div>
                  <div className="w-1/2">
                    <button
                      onClick={() => handleVote(assignment.job.client, assignment.milestoneIndex, "0")}
                      disabled={loading}
                      className={`w-full border border-red-500 bg-red-50 hover:bg-red-100 text-red-700 font-medium py-3 px-4 rounded transition ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {loading ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-red-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Submitting...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Reject Milestone
                        </span>
                      )}
                    </button>
                    <p className="text-xs text-gray-500 mt-1 text-center">
                      Funds will remain in escrow
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Already Voted */}
            {assignment.hasVoted && (
              <div className="p-4 bg-green-50 rounded-b-lg">
                <div className="flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-green-700 font-medium">You have already cast your vote for this milestone.</span>
                </div>
                
                <div className="mt-3 bg-white p-3 rounded border text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Current voting progress:</span>
                    <span className="font-medium">{assignment.milestone.votes ? assignment.milestone.votes.length : 0} / {assignment.milestone.reviewers.length} votes cast</span>
                  </div>
                  <div className="mt-1 bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-blue-500 h-full" 
                      style={{ 
                        width: `${(assignment.milestone.votes ? assignment.milestone.votes.length : 0) / assignment.milestone.reviewers.length * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewerDashboard;