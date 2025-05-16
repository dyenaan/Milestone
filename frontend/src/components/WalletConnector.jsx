import React, { useState } from 'react';
import { blockchainService } from '../services/blockchain';

const WalletConnector = ({ onConnect }) => {
    const [connecting, setConnecting] = useState(false);
    const [error, setError] = useState(null);

    const connectWallet = async () => {
        setConnecting(true);
        setError(null);

        try {
            const walletInfo = await blockchainService.connectWallet();
            if (onConnect) {
                onConnect(walletInfo);
            }
        } catch (err) {
            setError(err.message);
            console.error("Connection error:", err);
        } finally {
            setConnecting(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
            <div className="text-6xl text-blue-600 mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            </div>

            <h2 className="text-2xl font-bold mb-3">Connect Your Aptos Wallet</h2>

            <p className="text-gray-600 mb-6">
                Connect your wallet to interact with the Milestone Escrow system.
                You'll need a wallet like Petra or Martian to proceed.
            </p>

            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded text-left">
                    <div className="flex">
                        <div className="py-1">
                            <svg className="h-6 w-6 text-red-500 mr-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="font-bold">Connection Error</p>
                            <p className="text-sm">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            <button
                onClick={connectWallet}
                disabled={connecting}
                className={`w-full bg-blue-600 text-white py-3 px-6 rounded-lg shadow-md hover:bg-blue-700 transition flex items-center justify-center font-bold ${connecting ? "opacity-70 cursor-not-allowed" : ""
                    }`}
            >
                {connecting ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Connecting...
                    </>
                ) : (
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Connect Wallet
                    </>
                )}
            </button>

            <div className="mt-4 text-gray-500 text-sm">
                <p>Supported wallets: Petra, Martian, Pontem, and others that support the Aptos Wallet Standard.</p>
                <p className="mt-2">
                    <a
                        href="https://petra.app/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline"
                    >
                        Don't have a wallet? Get Petra Wallet
                    </a>
                </p>
            </div>
        </div>
    );
};

export default WalletConnector; 