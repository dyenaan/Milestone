import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { jwtDecode } from 'jwt-decode';
import {
    Aptos,
    AptosConfig,
    Network,
    EphemeralKeyPair
} from '@aptos-labs/ts-sdk';

// Initialize Aptos client
const aptos = new Aptos(new AptosConfig({ network: Network.DEVNET }));

// Helper functions for ephemeral key pair storage
const storeEphemeralKeyPair = (ephemeralKeyPair) => {
    try {
        // Ensure we're storing the EphemeralKeyPair properly
        const dataToStore = {
            publicKey: Array.from(ephemeralKeyPair.publicKey),
            privateKey: Array.from(ephemeralKeyPair.privateKey),
            nonce: ephemeralKeyPair.nonce,
            expirationTimestamp: ephemeralKeyPair.expirationTimestamp.toISOString()
        };

        localStorage.setItem(`@aptos/ephemeral_key_pair_${ephemeralKeyPair.nonce}`, JSON.stringify(dataToStore));
        console.log('Stored ephemeral key pair with nonce:', ephemeralKeyPair.nonce);
    } catch (error) {
        console.error('Error storing ephemeral key pair:', error);
    }
};

const getEphemeralKeyPair = (nonce) => {
    try {
        const stored = localStorage.getItem(`@aptos/ephemeral_key_pair_${nonce}`);
        if (!stored) {
            console.log('No ephemeral key pair found for nonce:', nonce);
            return null;
        }

        const parsed = JSON.parse(stored);
        console.log('Retrieved stored key pair data:', {
            nonce: parsed.nonce,
            publicKeyLength: parsed.publicKey?.length,
            privateKeyLength: parsed.privateKey?.length,
            expiration: parsed.expirationTimestamp
        });

        // Create the EphemeralKeyPair object with explicit typing
        return new EphemeralKeyPair({
            publicKey: new Uint8Array(parsed.publicKey),
            privateKey: new Uint8Array(parsed.privateKey),
            nonce: parsed.nonce,
            expirationTimestamp: new Date(parsed.expirationTimestamp)
        });
    } catch (error) {
        console.error('Error retrieving ephemeral key pair:', error);
        return null;
    }
};

// Parse JWT from URL
const parseJWTFromURL = (url) => {
    const urlObject = new URL(url);
    const fragment = urlObject.hash.substring(1);
    const params = new URLSearchParams(fragment);
    return params.get('id_token');
};

const AptosLogin = () => {
    const [walletAddress, setWalletAddress] = useState('0xdb3d67d9c869bbe0a02583bef1d243a2eae8d901534732e195e091dfac950e1c');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const { loginWithAptos, loginWithGoogleAptos, loginWithAppleAptos, storeKeylessAccount } = useAuth();
    const navigate = useNavigate();

    // Check for callback on mount (handle redirect from OIDC provider)
    useEffect(() => {
        const handleOIDCCallback = async () => {
            const url = window.location.href;

            // Check if this is a callback from OIDC provider
            if (url.includes('callback') && url.includes('#id_token=')) {
                setIsLoading(true);

                try {
                    // Parse the JWT from URL
                    const jwt = parseJWTFromURL(url);
                    if (!jwt) {
                        throw new Error('No JWT token found in URL');
                    }

                    // Decode the JWT to get the nonce
                    const payload = jwtDecode(jwt);
                    const jwtNonce = payload.nonce;
                    console.log('JWT nonce retrieved:', jwtNonce);

                    // Get the ephemeral key pair
                    const ephemeralKeyPair = getEphemeralKeyPair(jwtNonce);
                    if (!ephemeralKeyPair) {
                        throw new Error(`Ephemeral key pair not found for nonce: ${jwtNonce}`);
                    }

                    if (ephemeralKeyPair.isExpired()) {
                        throw new Error('Ephemeral key pair has expired. Please try again.');
                    }

                    console.log('Ephemeral key pair retrieved successfully');

                    try {
                        // Derive the keyless account
                        console.log('Deriving keyless account...');
                        const keylessAccount = await aptos.deriveKeylessAccount({
                            jwt,
                            ephemeralKeyPair,
                        });

                        console.log('Keyless account derived successfully:', keylessAccount.accountAddress);

                        // Store the keyless account
                        storeKeylessAccount(keylessAccount);

                        // Success!
                        setIsSuccess(true);

                        // Redirect to home after a delay
                        setTimeout(() => navigate('/'), 1000);
                    } catch (derivationError) {
                        console.error('Error deriving keyless account:', derivationError);
                        throw new Error(`Failed to derive keyless account: ${derivationError.message}`);
                    }
                } catch (err) {
                    console.error('OIDC callback error:', err);
                    setError(err.message || 'Failed to process authentication. Please try again.');
                } finally {
                    setIsLoading(false);
                }
            }
        };

        handleOIDCCallback();
    }, [navigate, storeKeylessAccount]);

    const connectWallet = async () => {
        setError('');
        setIsLoading(true);
        setIsSuccess(false);

        try {
            // In a real implementation, you would connect to a real Aptos wallet
            // For now, we'll use the hardcoded address

            // Create a signed message for wallet verification
            const message = 'Login to MQ3K Platform at ' + new Date().toISOString();
            const mockSignedMessage = '0x1234567890abcdef'; // This would come from the wallet in reality

            await loginWithAptos({
                walletAddress,
                message,
                signedMessage: mockSignedMessage
            });

            // Success!
            setIsSuccess(true);

            // Redirect after short delay to show success message
            setTimeout(() => navigate('/'), 1000);
        } catch (err) {
            console.error('Aptos login error:', err);
            setError(err.response?.data?.message || 'Failed to connect Aptos wallet. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const loginWithGoogle = async () => {
        setError('');
        setIsLoading(true);

        try {
            // Generate ephemeral key pair
            const ephemeralKeyPair = EphemeralKeyPair.generate();
            console.log('Generated new ephemeral key pair with nonce:', ephemeralKeyPair.nonce);

            // Log key details for debugging (don't log private key in production)
            console.log('Key details:', {
                publicKeyLength: ephemeralKeyPair.publicKey.length,
                privateKeyLength: ephemeralKeyPair.privateKey.length,
                nonce: ephemeralKeyPair.nonce,
                expiration: ephemeralKeyPair.expirationTimestamp
            });

            // Store it for later use
            storeEphemeralKeyPair(ephemeralKeyPair);

            // Configuration for Google OIDC
            const redirectUri = `${window.location.origin}/login/google/callback`;

            // Use environment variable for Google client ID, but ensure it's properly accessed
            // For Create React App, environment variables need to be prefixed with REACT_APP_
            const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

            // If there's no client ID in the environment, show an error
            if (!clientId) {
                throw new Error('Google Client ID not configured. Please set REACT_APP_GOOGLE_CLIENT_ID in your .env file.');
            }

            const nonce = ephemeralKeyPair.nonce;

            // Construct login URL
            const loginUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=id_token&scope=openid+email+profile&nonce=${nonce}&redirect_uri=${redirectUri}&client_id=${clientId}`;

            // Redirect user to Google login
            window.location.href = loginUrl;
        } catch (err) {
            console.error('Google login preparation error:', err);
            setError('Failed to prepare Google login. Please try again.');
            setIsLoading(false);
        }
    };

    const loginWithApple = async () => {
        setError('');
        setIsLoading(true);
        setIsSuccess(false);

        try {
            // In a real implementation, we would:
            // 1. Initialize Apple OAuth
            // 2. Get user consent
            // 3. Get the Apple token
            // 4. Generate a ZK proof linking Apple identity to Aptos wallet

            // For demonstration, we'll simulate this flow
            const mockAppleToken = 'apple_token_' + Date.now();

            await loginWithAppleAptos({
                walletAddress,
                appleToken: mockAppleToken
            });

            // Success!
            setIsSuccess(true);

            // Redirect after short delay to show success message
            setTimeout(() => navigate('/'), 1000);
        } catch (err) {
            console.error('Apple Aptos login error:', err);
            setError(err.response?.data?.message || 'Failed to login with Apple and Aptos. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleWalletChange = (e) => {
        setWalletAddress(e.target.value);
    };

    return (
        <div className="max-w-md mx-auto">
            <div className="bg-white py-8 px-4 shadow rounded-lg">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">Aptos Wallet Login</h2>

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}

                {isSuccess && (
                    <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
                        <p className="text-sm text-green-700">Login successful! Redirecting...</p>
                    </div>
                )}

                <div className="space-y-6">
                    <div>
                        <label htmlFor="walletAddress" className="block text-sm font-medium text-gray-700">
                            Your Aptos Wallet Address
                        </label>
                        <div className="mt-1">
                            <input
                                id="walletAddress"
                                name="walletAddress"
                                type="text"
                                value={walletAddress}
                                onChange={handleWalletChange}
                                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <button
                            onClick={connectWallet}
                            disabled={isLoading || !walletAddress}
                            className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            {isLoading ? 'Connecting...' : 'Connect Aptos Wallet'}
                        </button>

                        <div className="relative mt-4">
                            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">Or continue with</span>
                            </div>
                        </div>

                        <button
                            onClick={loginWithGoogle}
                            disabled={isLoading}
                            className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                                <path
                                    d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z"
                                    fill="#4285F4"
                                />
                            </svg>
                            Sign in with Google Keyless
                        </button>

                        <button
                            onClick={loginWithApple}
                            disabled={isLoading}
                            className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.053 2.09-.986 3.935-.986 1.831 0 2.35.986 3.96.947 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.684 3.559-1.701z" />
                            </svg>
                            Sign in with Apple + Aptos ZK Proof
                        </button>
                    </div>

                    <p className="text-xs text-gray-500 mt-4">
                        By connecting your wallet, you agree to the Terms of Service and Privacy Policy.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AptosLogin; 