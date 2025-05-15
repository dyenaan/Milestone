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


/**
 * Store the ephemeral key pair in localStorage.
 */
const storeEphemeralKeyPair = (ekp) => {
    localStorage.setItem("@aptos/ekp", encodeEphemeralKeyPair(ekp));
  };
  
  /**
   * Retrieve the ephemeral key pair from localStorage if it exists.
   */
  const getEphemeralKeyPair = () => {
    try {
      const encodedEkp = localStorage.getItem("@aptos/ekp");
      return encodedEkp ? decodeEphemeralKeyPair(encodedEkp) : undefined;
    } catch (error) {
      console.warn("Failed to decode ephemeral key pair from localStorage", error);
      return undefined;
    }
  };
  
  /**
   * Stringify the ephemeral key pairs to be stored in localStorage
   */
  const encodeEphemeralKeyPair = (ekp) =>
    JSON.stringify(ekp, (_, e) => {
      if (typeof e === "bigint") return { __type: "bigint", value: e.toString() };
      if (e instanceof Uint8Array) return { __type: "Uint8Array", value: Array.from(e) };
      if (e instanceof EphemeralKeyPair)
        return { __type: "EphemeralKeyPair", data: e.bcsToBytes() };
      return e;
    });
  
  /**
   * Parse the ephemeral key pairs from a string
   */
  const decodeEphemeralKeyPair = (encodedEkp) =>
    JSON.parse(encodedEkp, (_, e) => {
      if (e && e.__type === "bigint") return BigInt(e.value);
      if (e && e.__type === "Uint8Array") return new Uint8Array(e.value);
      if (e && e.__type === "EphemeralKeyPair")
        return EphemeralKeyPair.fromBytes(e.data);
      return e;
    });

// Parse JWT from URL
const parseJWTFromURL = (url) => {
    const urlObject = new URL(url);
    const fragment = urlObject.hash.substring(1);
    const params = new URLSearchParams(fragment);
    return params.get('id_token');
};

const AptosLogin = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const { loginWithGoogleAptos, storeKeylessAccount } = useAuth();
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
                    const ephemeralKeyPair = getEphemeralKeyPair();
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

    const loginWithGoogle = async () => {
        setError('');
        setIsLoading(true);

        try {
            // Generate ephemeral key pair
            const ephemeralKeyPair = EphemeralKeyPair.generate();
            console.log('Generated new ephemeral key pair with nonce:', ephemeralKeyPair.nonce);

            // Store it for later use
            storeEphemeralKeyPair(ephemeralKeyPair);

            // Configuration for Google OIDC
            const redirectUri = `${window.location.origin}/login/google/callback`;
            const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

            if (!clientId) {
                throw new Error('Google Client ID not configured. Please set REACT_APP_GOOGLE_CLIENT_ID in your .env file.');
            }

            const nonce = ephemeralKeyPair.nonce;
            const loginUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=id_token&scope=openid+email+profile&nonce=${nonce}&redirect_uri=${redirectUri}&client_id=${clientId}`;

            window.location.href = loginUrl;
        } catch (err) {
            console.error('Google login preparation error:', err);
            setError('Failed to prepare Google login. Please try again.');
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {error && (
                <div className="rounded-md bg-red-50 p-4">
                    <div className="text-sm text-red-700">{error}</div>
                </div>
            )}

            {isSuccess && (
                <div className="rounded-md bg-green-50 p-4">
                    <div className="text-sm text-green-700">Successfully authenticated!</div>
                </div>
            )}

            <button
                onClick={loginWithGoogle}
                disabled={isLoading}
                className="flex w-full justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-75"
            >
                {isLoading ? (
                    <span>Signing in...</span>
                ) : (
                    <>
                        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                            <path
                                fill="currentColor"
                                d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
                            />
                        </svg>
                        Sign in with Google
                    </>
                )}
            </button>
        </div>
    );
};

export default AptosLogin; 