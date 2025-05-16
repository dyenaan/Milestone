import React, { useState } from 'react';

const ApproveMilestone = ({ client, wallet, job, moduleAddress }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // Get the current milestone
  const currentMilestoneIndex = job.current_step;
  const currentMilestone = job.milestones[currentMilestoneIndex];
  
  // Determine if the client can approve the current milestone
  const canApprove = 
    job.is_active && 
    currentMilestone && 
    currentMilestone.status === 1 && // SUBMITTED
    wallet.address === job.client;
  
  // Helper function to convert hex to text (copied from JobDetails.jsx)
  // Update the hexToString function in ApproveMilestone.jsx
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
  

const handleApprove = async () => {
  setLoading(true);
  setError(null);
  setSuccess(false);
  
  try {
    if (!wallet || !client) {
      throw new Error("Wallet not connected");
    }
    
    // Construct the transaction payload - MODIFIED TO MATCH CONTRACT
    const payload = {
      function: `${moduleAddress}::escrow::approve_milestone`,
      type_arguments: ["0x1::aptos_coin::AptosCoin"],
      arguments: [] // Remove arguments as the contract doesn't expect any
    };
    
    console.log("Approving milestone with payload:", payload);
    
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
    console.error("Approval error:", err);
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

  // If client can't approve work, don't render the component
  if (!canApprove) return null;
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h3 className="text-xl font-bold mb-4">Approve Milestone #{currentMilestoneIndex}</h3>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Milestone approved successfully! The page will refresh shortly.
        </div>
      )}
      
      <div className="mb-4">
        <p className="mb-3">
          The freelancer has submitted work for this milestone. Review their submission and approve if satisfactory.
        </p>
        
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="font-bold text-gray-700 mb-2">Submitted Evidence:</div>
          {currentMilestone.submission_evidence ? (
            <div className="bg-white p-3 rounded border border-gray-300">
              {/* Try to convert and display as a link if possible */}
              {(() => {
                const evidenceStr = hexToString(currentMilestone.submission_evidence);
                const isUrl = evidenceStr.startsWith('http') || 
                              evidenceStr.includes('github.com') || 
                              evidenceStr.includes('://');
                
                if (isUrl) {
                  return (
                    <a 
                      href={evidenceStr}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center break-all"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      {evidenceStr}
                    </a>
                  );
                } else {
                  return (
                    <div className="break-all">
                      <span className="text-gray-800">{evidenceStr}</span>
                      <div className="mt-2 text-xs text-gray-500">
                        Raw hex: <span className="font-mono">{currentMilestone.submission_evidence}</span>
                      </div>
                    </div>
                  );
                }
              })()}
            </div>
          ) : (
            <div className="text-gray-500 italic">No evidence submitted</div>
          )}
        </div>
      </div>
      
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={handleApprove}
          className={`bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition ${
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
              Approving...
            </span>
          ) : (
            <span className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Approve Milestone
            </span>
          )}
        </button>
        
        <button
          type="button"
          onClick={() => {/* Start dispute function would go here */}}
          className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded transition"
        >
          <span className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Start Dispute
          </span>
        </button>
      </div>
    </div>
  );
};

export default ApproveMilestone;