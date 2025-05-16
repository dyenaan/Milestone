import React, { useState } from 'react';

const DisputePanel = ({ client, wallet, job, moduleAddress, userRole }) => {
  const [reviewers, setReviewers] = useState(['', '', '', '', '']);
  const [voteValue, setVoteValue] = useState(1); // 1 = Approve, 0 = Reject
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // Get the current milestone
  const currentMilestoneIndex = job.current_step;
  const currentMilestone = job.milestones[currentMilestoneIndex];
  
  // Determine the dispute stage and user permissions
  const canStartDispute = 
    job.is_active && 
    currentMilestone && 
    currentMilestone.status === 1 && // SUBMITTED
    userRole === 'client';
  
  const canAssignReviewers = 
    job.is_active && 
    currentMilestone && 
    currentMilestone.status === 4 && // IN_DISPUTE
    wallet.address === job.platform_address && 
    (!currentMilestone.reviewers || currentMilestone.reviewers.length === 0);
  
  const canVote = 
    job.is_active && 
    currentMilestone && 
    currentMilestone.status === 4 && // IN_DISPUTE
    currentMilestone.reviewers && 
    currentMilestone.reviewers.includes(wallet.address);
  
  const isInDispute = currentMilestone && currentMilestone.status === 4;
  
  const handleReviewerChange = (index, value) => {
    const updatedReviewers = [...reviewers];
    updatedReviewers[index] = value;
    setReviewers(updatedReviewers);
  };
  
  const handleStartDispute = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      if (!wallet || !client) {
        throw new Error("Wallet not connected");
      }
      
      // Construct the transaction payload
      const payload = {
        function: `${moduleAddress}::escrow::start_dispute`,
        type_arguments: [],
        arguments: [
          job.freelancer,
          currentMilestoneIndex.toString()
        ]
      };
      
      console.log("Starting dispute with payload:", payload);
      
      try {
        // Sign and submit transaction
        const pendingTransaction = await window.aptos.signAndSubmitTransaction(payload);
        console.log("Transaction submitted:", pendingTransaction);
        
        if (pendingTransaction && pendingTransaction.hash) {
          // Set success immediately after submission
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
      console.error("Dispute error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAssignReviewers = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    
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
          currentMilestoneIndex.toString(),
          reviewers
        ]
      };
      
      console.log("Assigning reviewers with payload:", payload);
      
      try {
        // Sign and submit transaction
        const pendingTransaction = await window.aptos.signAndSubmitTransaction(payload);
        console.log("Transaction submitted:", pendingTransaction);
        
        if (pendingTransaction && pendingTransaction.hash) {
          // Set success immediately after submission
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
      console.error("Assign reviewers error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleVote = async () => {
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
          job.client,
          currentMilestoneIndex.toString(),
          voteValue.toString()
        ]
      };
      
      console.log("Casting vote with payload:", payload);
      
      try {
        // Sign and submit transaction
        const pendingTransaction = await window.aptos.signAndSubmitTransaction(payload);
        console.log("Transaction submitted:", pendingTransaction);
        
        if (pendingTransaction && pendingTransaction.hash) {
          // Set success immediately after submission
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
  
  // If not relevant, don't render the component
  if (!canStartDispute && !canAssignReviewers && !canVote && !isInDispute) {
    return null;
  }
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h3 className="text-xl font-bold mb-4">
        Dispute Resolution - Milestone #{currentMilestoneIndex}
      </h3>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Action completed successfully! The page will refresh shortly.
        </div>
      )}
      
      {isInDispute && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                This milestone is currently in dispute. The outcome will be determined by assigned reviewers.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {canStartDispute && (
        <div className="mb-6">
          <p className="mb-4 text-gray-700">
            If you do not approve the submitted work, you can start a dispute process. The platform will assign reviewers
            who will vote to approve or reject the milestone.
          </p>
          <button
            onClick={handleStartDispute}
            className={`bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded transition flex items-center ${
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
                Starting Dispute...
              </span>
            ) : (
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Start Dispute
              </span>
            )}
          </button>
        </div>
      )}
      
      {canAssignReviewers && (
        <div className="mb-6">
          <p className="mb-4 text-gray-700">
            As the platform operator, you need to assign reviewers to resolve this dispute.
          </p>
          <form onSubmit={handleAssignReviewers}>
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
        </div>
      )}
      
      {canVote && (
        <div className="mb-6">
          <p className="mb-4 text-gray-700">
            As a reviewer, you need to vote on whether to approve this milestone.
          </p>
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <div className="font-medium mb-2">Cast Your Vote:</div>
            <div className="flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-green-600"
                  name="vote"
                  value="1"
                  checked={voteValue === 1}
                  onChange={() => setVoteValue(1)}
                />
                <span className="ml-2">Approve</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-red-600"
                  name="vote"
                  value="0"
                  checked={voteValue === 0}
                  onChange={() => setVoteValue(0)}
                />
                <span className="ml-2">Reject</span>
              </label>
            </div>
          </div>
          <button
            onClick={handleVote}
            className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition flex items-center ${
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
                Submitting Vote...
              </span>
            ) : (
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                Submit Vote
              </span>
            )}
          </button>
        </div>
      )}
      
      {isInDispute && !canAssignReviewers && !canVote && (
        <div className="mb-6">
          <p className="mb-4 text-gray-700">
            This milestone is currently in dispute. Please wait for the reviewers to cast their votes.
            The outcome will be determined based on the majority vote.
          </p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="font-medium mb-2">Dispute Process:</div>
            <ol className="list-decimal pl-5 space-y-1 text-sm text-gray-600">
              <li>The platform will assign reviewers to evaluate the work.</li>
              <li>Each reviewer will vote to either approve or reject the milestone.</li>
              <li>A majority vote (more than half) determines the outcome.</li>
              <li>If approved, funds will be released to the freelancer.</li>
              <li>If rejected, the milestone remains in the rejected state.</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
};

export default DisputePanel;