import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';

// Initialize Aptos client
const aptos = new Aptos(new AptosConfig({ network: Network.DEVNET }));

const TestKeyless = () => {
    const { keylessAccount } = useAuth();
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false);

    const testAccount = async () => {
        if (!keylessAccount) {
            setResult('No keyless account found. Please sign in first.');
            return;
        }

        setLoading(true);
        setResult('');

        try {
            // Get account resources to verify the account exists on chain
            const resources = await aptos.getAccountResources({
                accountAddress: keylessAccount.accountAddress,
            });

            setResult(
                `Success! Account verified.\n\nAddress: ${keylessAccount.accountAddress}\n\nResources: ${resources.length}`
            );
        } catch (error) {
            console.error('Error testing keyless account:', error);
            setResult(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white shadow rounded-lg p-6 mt-4">
            <h2 className="text-xl font-semibold mb-4">Keyless Account Test</h2>

            {keylessAccount ? (
                <div className="mb-4">
                    <p className="font-medium">Account Address:</p>
                    <p className="font-mono text-sm bg-gray-100 p-2 rounded break-all">
                        {keylessAccount.accountAddress}
                    </p>
                </div>
            ) : (
                <div className="mb-4 bg-yellow-50 border-l-4 border-yellow-400 p-4">
                    <p className="text-yellow-700">No keyless account found. Please sign in with Google Keyless.</p>
                </div>
            )}

            <button
                onClick={testAccount}
                disabled={loading || !keylessAccount}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
                {loading ? 'Testing...' : 'Test Account'}
            </button>

            {result && (
                <div className="mt-4">
                    <p className="font-medium">Result:</p>
                    <pre className="bg-gray-100 p-3 rounded whitespace-pre-wrap font-mono text-sm">
                        {result}
                    </pre>
                </div>
            )}
        </div>
    );
};

export default TestKeyless; 