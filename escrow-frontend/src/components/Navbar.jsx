import React from 'react';

const Navbar = ({ connected, account, disconnect, activeTab, setActiveTab }) => {
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Brand */}
          <div className="flex items-center mb-3 md:mb-0">
            <div className="font-bold text-2xl mr-2">
              <i className="fas fa-lock mr-2"></i>
              MILESTONE
            </div>
            <span className="bg-blue-900 text-blue-200 text-xs px-2 py-1 rounded">Testnet</span>
          </div>

          {/* Navigation Tabs */}
          {connected && (
            <div className="flex flex-wrap justify-center mb-3 md:mb-0 space-x-1">
              {['home', 'create', 'jobs'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1 mx-1 rounded transition ${
                    activeTab === tab
                      ? 'bg-white text-blue-700 font-medium'
                      : 'text-blue-100 hover:bg-blue-700'
                  }`}
                >
                  {tab === 'home' ? 'Home' : tab === 'create' ? 'Create Job' : 'My Jobs'}
                </button>
              ))}
            </div>
          )}

          {/* Wallet Info & Disconnect */}
          <div className="flex items-center">
            {connected ? (
              <div className="flex items-center space-x-3 bg-blue-700 rounded-lg px-4 py-2">
                <div className="flex flex-col">
                  <span className="text-xs text-blue-200">Connected</span>
                  <span className="font-mono text-sm">{formatAddress(account?.address)}</span>
                </div>
                <button
                  onClick={disconnect}
                  className="bg-red-500 hover:bg-red-600 text-white p-2 rounded transition"
                  aria-label="Disconnect wallet"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                </button>
              </div>
            ) : (
              <a
                href="https://petra.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-200 text-sm hover:text-white transition flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
                Get Petra Wallet
              </a>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
