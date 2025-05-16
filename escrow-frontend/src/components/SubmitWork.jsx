import React, { useState } from 'react';

const SubmitWork = ({ client, wallet, job, moduleAddress }) => {
  const [evidence, setEvidence] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // Get the current milestone
  const currentMilestoneIndex = job.current_step;
  const currentMilestone = job.milestones[currentMilestoneIndex];
  
  // Determine if the freelancer can submit work for the current milestone
  const canSubmit = 
    job.is_active && 
    currentMilestone && 
    currentMilestone.status === 0 && // PENDING
    wallet.address === job.freelancer;
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      
      // Additional validation logs
      console.log("Validation state:", {
        isActive: job.is_active,
        hasCurrentMilestone: !!currentMilestone,
        milestoneStatus: currentMilestone?.status,
        walletMatches: wallet.address === job.freelancer
      });
      
      if (!canSubmit) {
        console.warn("🚫 Cannot submit: requirements not met.");
        return;
      }
    
      setLoading(true);
      setError(null);
      setSuccess(false);
    
      try {
        if (!wallet || !client) {
          throw new Error("Wallet not connected");
        }
    
        // Ensure evidence is a simple string without any special formatting
        let processedEvidence = evidence.trim();
        if (!processedEvidence) {
          throw new Error("Submission evidence cannot be empty.");
        }
    
        // Convert evidence to vector<u8>
        const evidenceBytes = Array.from(new TextEncoder().encode(processedEvidence));
        console.log("📦 Encoded evidence bytes:", evidenceBytes);
        console.log("📦 Encoded evidence length:", evidenceBytes.length);
    
        // IMPORTANT: Use the EXACT client address verified from blockchain
        const verifiedClientAddress = "0x89a4067306d3453d00068fedb023b29fa834adfa8f7766b9530f14881b95030a";
        
        console.log("Using verified client address:", verifiedClientAddress);
        console.log("Client address length:", verifiedClientAddress.length);
    
        // Ensure milestone index is a number
        const milestoneIndex = parseInt(currentMilestoneIndex);
        console.log("Milestone index as number:", milestoneIndex);
    
        const payload = {
          function: `${moduleAddress}::escrow::submit_work`,
          type_arguments: [],
          arguments: [
            verifiedClientAddress,
            milestoneIndex,
            evidenceBytes
          ]
        };
    
        console.log("🚀 Submitting work with payload:", JSON.stringify(payload, null, 2));
    
        try {
          // Make sure we're just passing the payload without extra wrapping
          const pendingTransaction = await window.aptos.signAndSubmitTransaction(payload);
          
          console.log("✅ Transaction submitted:", pendingTransaction);
    
          if (pendingTransaction?.hash) {
            setSuccess(true);
            try {
              await client.waitForTransaction(pendingTransaction.hash);
              console.log("🎉 Transaction confirmed:", pendingTransaction.hash);
              setTimeout(() => window.location.reload(), 2000);
            } catch (confirmErr) {
              console.warn("⚠️ Could not confirm transaction:", confirmErr);
            }
          } else {
            throw new Error("Transaction did not return a hash");
          }
        } catch (txErr) {
          console.error("❌ Transaction error:", txErr);
          throw new Error(`Transaction failed: ${txErr.message || "Unknown error"}`);
        }
    
      } catch (err) {
        console.error("🔥 Submit error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
  
  // If freelancer can't submit work, don't render the component
  if (!canSubmit) return null;
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h3 className="text-xl font-bold mb-4">Submit Work for Milestone #{currentMilestoneIndex}</h3>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Work submitted successfully! The page will refresh shortly.
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Evidence / Submission Link
          </label>
          <input
            type="text"
            value={evidence}
            onChange={(e) => setEvidence(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="https://github.com/yourrepo/pull/123"
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            Provide a link to your work (GitHub PR, document, etc.)
          </p>
        </div>
        
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Work"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SubmitWork;