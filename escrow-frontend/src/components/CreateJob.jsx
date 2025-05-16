import React, { useState } from 'react';
import { Types } from 'aptos';

const CreateJob = ({ client, wallet, moduleAddress, onJobCreated }) => {
  const [freelancerAddress, setFreelancerAddress] = useState('');
  // Platform address is now hardcoded
  const platformAddress = '0x719cfc881c125386b260d97a5adf36d5653d96b2e733b88fbbedcf428f8bfbed';
  // Min votes required is now hardcoded
  const minVotesRequired = 3;
  const [milestones, setMilestones] = useState([
    { description: 'Step 1', amount: 2 },
    { description: 'Step 2', amount: 2 },
    { description: 'Step 3', amount: 2 }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleMilestoneChange = (index, field, value) => {
    const updatedMilestones = [...milestones];
    updatedMilestones[index] = {
      ...updatedMilestones[index],
      [field]: field === 'amount' ? parseFloat(value) : value
    };
    setMilestones(updatedMilestones);
  };

  const addMilestone = () => {
    setMilestones([
      ...milestones,
      { description: `Step ${milestones.length + 1}`, amount: 2 }
    ]);
  };

  const removeMilestone = (index) => {
    if (milestones.length <= 1) return;
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const calculateTotalAmount = () => {
    return milestones.reduce((sum, m) => sum + m.amount, 0);
  };

  const calculatePlatformFee = () => {
    const total = calculateTotalAmount();
    // 7% fee for normal flow, 10% if disputes occur (we'll show the range)
    return {
      min: total * 0.07,
      max: total * 0.1
    };
  };

  // Update the handleSubmit function in CreateJob.jsx
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
  
    try {
      if (!wallet || !client) {
        throw new Error("Wallet not connected");
      }
  
      // Convert APT to base units (1 APT = 100,000,000 units)
      const milestoneAmounts = milestones.map(m => Math.floor(m.amount * 100000000).toString());
  
      // Construct the transaction payload
      const payload = {
        function: `${moduleAddress}::escrow::create_job_with_funds`,
        type_arguments: ["0x1::aptos_coin::AptosCoin"],
        arguments: [
          freelancerAddress,
          milestoneAmounts,
          platformAddress,
          minVotesRequired.toString()
        ]
      };
  
      console.log("Sending transaction with payload:", payload);
  
      try {
        // Sign and submit transaction
        const pendingTransaction = await window.aptos.signAndSubmitTransaction(payload);
        console.log("Transaction submitted:", pendingTransaction);
        
        if (pendingTransaction && pendingTransaction.hash) {
          // Set success immediately after submission, don't wait for confirmation
          setSuccess(true);
          if (onJobCreated) {
            onJobCreated();
          }
          
          // Attempt to wait for transaction but don't block the UI
          try {
            client.waitForTransaction(pendingTransaction.hash)
              .then(() => console.log("Transaction confirmed"))
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
      console.error("Submit error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Calculate fee values
  const fee = calculatePlatformFee();
  const totalAmount = calculateTotalAmount();

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Create New Escrow Job</h2>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
          <div className="flex">
            <div className="py-1"><svg className="h-6 w-6 text-red-500 mr-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
            <div>
              <p className="font-bold">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 rounded">
          <div className="flex">
            <div className="py-1"><svg className="h-6 w-6 text-green-500 mr-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg></div>
            <div>
              <p className="font-bold">Success!</p>
              <p className="text-sm">Job created successfully! The funds have been escrowed.</p>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">
            Freelancer Address
          </label>
          <input
            type="text"
            value={freelancerAddress}
            onChange={(e) => setFreelancerAddress(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0x..."
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            Enter the wallet address of the freelancer who will complete the work.
          </p>
        </div>
        
        {/* Info box about the platform */}
        <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="font-medium text-blue-800 mb-2">Platform Information</h3>
          <p className="text-sm text-blue-700 mb-2">
            The platform will facilitate this escrow contract and provide dispute resolution services if needed.
          </p>
          <div className="flex justify-between text-sm">
            <div>
              <span className="font-medium">Platform Address:</span>
              <div className="font-mono text-xs mt-1">{platformAddress.substring(0, 10)}...{platformAddress.substring(platformAddress.length-8)}</div>
            </div>
            <div>
              <span className="font-medium">Platform Fee:</span>
              <div className="text-xs mt-1">7-10% of total amount</div>
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <label className="block text-gray-700 font-medium">
              Milestones
            </label>
            <button
              type="button"
              onClick={addMilestone}
              className="bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium py-1 px-3 rounded text-sm transition flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Milestone
            </button>
          </div>
          
          <div className="space-y-4 mb-4">
            {milestones.map((milestone, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex justify-between items-center mb-3">
                  <div className="font-medium">Milestone #{index + 1}</div>
                  <button
                    type="button"
                    onClick={() => removeMilestone(index)}
                    className="text-red-600 hover:text-red-800 p-1"
                    disabled={milestones.length <= 1}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={milestone.description}
                      onChange={(e) => handleMilestoneChange(index, 'description', e.target.value)}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Describe the milestone"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      Amount (APT)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <input
                        type="number"
                        value={milestone.amount}
                        onChange={(e) => handleMilestoneChange(index, 'amount', e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 pl-10 pr-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="APT"
                        step="0.1"
                        min="0.1"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="font-medium text-lg mb-3">Summary</h3>
          
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Total milestones:</span>
            <span className="font-medium">{milestones.length}</span>
          </div>
          
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Total APT:</span>
            <span className="font-medium">{totalAmount.toFixed(2)} APT</span>
          </div>
          
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Platform fee (7-10%):</span>
            <span className="font-medium">{fee.min.toFixed(2)} - {fee.max.toFixed(2)} APT</span>
          </div>
          
          <div className="flex justify-between font-medium text-blue-800 pt-2 border-t">
            <span>Total amount to escrow:</span>
            <span>{totalAmount.toFixed(2)} APT</span>
          </div>
          
          <div className="mt-3 text-xs text-gray-500">
            <p>* Platform fee is included in milestone payments and varies based on whether disputes occur.</p>
            <p>* Base fee (10%) applies to dispute-free transactions.</p>
            <p>* When disputes occur, platform fee reduces to 7% and 3% goes to reviewers.</p>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:shadow-outline transition ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </span>
            ) : (
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Create & Fund Escrow
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateJob;