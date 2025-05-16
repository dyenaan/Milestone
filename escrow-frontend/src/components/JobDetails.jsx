import React from 'react';

const JobDetails = ({ job, userRole }) => {
  // Status constants to match Move contract
  const STATUS_NAMES = {
    0: 'Pending',
    1: 'Submitted',
    2: 'Approved',
    3: 'Rejected',
    4: 'In Dispute'
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

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-2xl font-bold mb-4">Job Details</h2>
      
      <div className="flex flex-col md:flex-row mb-4">
        <div className="w-full md:w-1/2 md:border-r md:pr-4 mb-4 md:mb-0">
          <div className="mb-2">
            <span className="font-semibold">Your Role:</span>{' '}
            <span className="capitalize">{userRole}</span>
          </div>
          <div className="mb-2">
            <span className="font-semibold">Progress:</span>{' '}
            {job.current_step}/{job.total_milestones} milestones
          </div>
          <div className="mb-2">
            <span className="font-semibold">Status:</span>{' '}
            <span className={job.is_active ? 'text-green-600' : 'text-gray-600'}>
              {job.is_active ? 'Active' : 'Completed'}
            </span>
          </div>
        </div>
        
        <div className="w-full md:w-1/2 md:pl-4">
          <div className="mb-2">
            <span className="font-semibold">Client:</span>{' '}
            <span className="text-xs font-mono">{formatAddress(job.client)}</span>
          </div>
          <div className="mb-2">
            <span className="font-semibold">Freelancer:</span>{' '}
            <span className="text-xs font-mono">{formatAddress(job.freelancer)}</span>
          </div>
          <div className="mb-2">
            <span className="font-semibold">Platform:</span>{' '}
            <span className="text-xs font-mono">{formatAddress(job.platform_address)}</span>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-xl font-bold mb-2">Milestones</h3>
        <div className="space-y-4">
          {job.milestones && job.milestones.map((milestone, index) => {
            // Replace the milestone ID display with Step # followed by the index
            const displayId = `Step ${index + 1}`;
            
            return (
            <div key={index} className={`p-4 rounded-lg border ${index === job.current_step ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
              <div className="flex justify-between items-center mb-2">
                <div className="font-semibold">{displayId}</div>
                <div className={`text-sm py-1 px-2 rounded-full ${
                  milestone.status === 0 ? 'bg-gray-200' : 
                  milestone.status === 1 ? 'bg-yellow-200 text-yellow-800' : 
                  milestone.status === 2 ? 'bg-green-200 text-green-800' :
                  milestone.status === 3 ? 'bg-red-200 text-red-800' :
                  'bg-purple-200 text-purple-800'
                }`}>
                  {STATUS_NAMES[milestone.status]}
                </div>
              </div>
              
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <div>Amount: {(milestone.amount / 100000000).toFixed(2)} APT</div>
                <div>Milestone #{index}</div>
              </div>
              
              {milestone.submission_evidence ? (
                <div className="mt-2 bg-white p-3 rounded border border-gray-300">
                  {(() => {
                    const evidenceStr = hexToString(milestone.submission_evidence);
                    
                    // Enhanced URL detection with specific GitHub handling
                    const isUrl = evidenceStr.startsWith('http') || 
                                  evidenceStr.includes('github.com') || 
                                  evidenceStr.includes('://');
                    
                    // Special handling for GitHub links
                    const isGitHub = evidenceStr.includes('github.com');
                    
                    if (isUrl) {
                      // Create proper URL object and ensure it's valid
                      let url = evidenceStr;
                      if (!url.startsWith('http')) {
                        url = 'https://' + url;
                      }
                      
                      return (
                        <div>
                          <a 
                            href={url}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-center break-all mb-2"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            {isGitHub ? (
                              <span className="flex items-center">
                                <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                                </svg>
                                GitHub Pull Request
                              </span>
                            ) : url}
                          </a>
                          
                          {/* Show additional info for GitHub links */}
                          {isGitHub && (
                            <div className="text-xs text-gray-500 mt-1">
                              <span className="font-medium">Repository:</span> {url.split('/').slice(3, 5).join('/')}
                              <br />
                              <span className="font-medium">Pull Request:</span> #{url.split('/').pop()}
                            </div>
                          )}
                        </div>
                      );
                    } else {
                      return (
                        <div className="break-all">
                          <span className="text-gray-800">{evidenceStr}</span>
                          <div className="mt-2 text-xs text-gray-500">
                            Raw hex: <span className="font-mono">{milestone.submission_evidence}</span>
                          </div>
                        </div>
                      );
                    }
                  })()}
                </div>
              ) : (
                <div className="text-gray-500 italic mt-2">No evidence submitted</div>
              )}
              
              {milestone.status === 4 && (
                <div className="mt-2 text-sm bg-red-50 p-2 rounded">
                  <div className="font-semibold text-red-600">Dispute in progress</div>
                  {milestone.reviewers && milestone.reviewers.length > 0 && (
                    <div className="mt-1">
                      <div className="text-gray-700">Reviewers:</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {milestone.reviewers.map((reviewer, idx) => (
                          <span key={idx} className="inline-block bg-gray-100 rounded px-2 py-1 text-xs font-mono">
                            {formatAddress(reviewer)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )})}
        </div>
      </div>
    </div>
  );
};

export default JobDetails;