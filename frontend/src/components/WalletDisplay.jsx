import React from 'react';
import { useAuth } from '../context/AuthContext';
import { formatWalletAddress, getAptosExplorerUrl } from '../utils/formatters';

const WalletDisplay = ({ className = '' }) => {
    const { user } = useAuth();

    if (!user) {
        return (
            <div className={`flex items-center text-sm text-gray-500 ${className}`}>
                <svg className="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Not connected
            </div>
        );
    }

    // Get wallet address from user object
    const walletAddress = user.accountAddress || user.wallet_address;
    if (!walletAddress) {
        return (
            <div className={`flex items-center text-sm text-gray-500 ${className}`}>
                <svg className="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                No wallet linked
            </div>
        );
    }

    // Format the address for display
    const formattedAddress = formatWalletAddress(walletAddress);
    const explorerUrl = getAptosExplorerUrl(walletAddress, 'devnet');

    return (
        <div className={`flex flex-col ${className}`}>
            <div className="flex items-center text-sm font-medium">
                <svg className="w-4 h-4 mr-1 text-green-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="text-gray-700">Wallet Connected</span>
            </div>
            <a
                href={explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-5 text-sm text-blue-600 hover:text-blue-800 hover:underline"
            >
                {formattedAddress}
            </a>
            <div className="ml-5 text-xs text-gray-400 truncate">
                Click to view on explorer
            </div>
        </div>
    );
};

export default WalletDisplay; 