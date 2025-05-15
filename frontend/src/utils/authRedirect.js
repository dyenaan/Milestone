import { supabase } from '../services/supabase';

/**
 * Checks if user is authenticated via Supabase or Aptos
 * @param {Object} navigate - React Router's navigate function
 * @param {boolean} silent - If true, doesn't redirect but returns auth status
 * @returns {Promise<boolean>} - Returns whether user is authenticated
 */
export const checkAuth = async (navigate, silent = false) => {
    try {
        // Attempt to forcibly restore session first - this helps with expired sessions
        const forcedSessionCheck = await supabase.auth.getSession();
        console.log('Forced session check result:', forcedSessionCheck?.data?.session ? 'active' : 'none');

        // First check localStorage for Aptos wallet connection - more thorough check
        const savedUser = localStorage.getItem('user');
        const aptosAccount = localStorage.getItem('@aptos/keyless_account');
        const token = localStorage.getItem('token'); // Check for any auth token

        // Log what we find for debugging
        console.log('Auth check - savedUser:', savedUser ? 'exists' : 'none');
        console.log('Auth check - aptosAccount:', aptosAccount ? 'exists' : 'none');
        console.log('Auth check - token:', token ? 'exists' : 'none');

        // If any of these exist, consider the user authenticated via Aptos
        if (savedUser || aptosAccount || token) {
            console.log('Found Aptos authentication evidence in localStorage');

            // If we have a saved user, try to parse and log it
            if (savedUser) {
                try {
                    const parsedUser = JSON.parse(savedUser);
                    console.log('Saved user details:', parsedUser);

                    // If we have auth source information, log it
                    if (parsedUser.authSource) {
                        console.log('User auth source:', parsedUser.authSource);
                    }

                    // Explicitly check for Aptos-specific properties
                    if (parsedUser.accountAddress || parsedUser.walletAddress || parsedUser.isKeyless) {
                        console.log('Confirmed Aptos wallet user');
                    }

                    // Verify Supabase users by checking their session
                    if (parsedUser.isSupabase) {
                        const { data } = await supabase.auth.getSession();
                        if (!data?.session) {
                            console.warn('Supabase user found in localStorage but no active session exists');

                            // Try refreshing the session using the token
                            if (token) {
                                try {
                                    const { data: refreshData } = await supabase.auth.refreshSession({
                                        refresh_token: token
                                    });
                                    console.log('Session refresh attempt:', refreshData?.session ? 'success' : 'failed');
                                } catch (refreshError) {
                                    console.error('Error refreshing session:', refreshError);
                                }
                            }
                        } else {
                            console.log('Confirmed active Supabase session');
                        }
                    }
                } catch (e) {
                    console.error('Error parsing saved user:', e);
                }
            }

            return true; // User is authenticated via Aptos or saved data
        }

        // If no local storage, try Supabase session
        const { data, error } = await supabase.auth.getSession();

        if (error) {
            console.error('Auth check error:', error);
            if (!silent) {
                navigate('/login', { state: { returnUrl: window.location.pathname } });
            }
            return false;
        }

        if (!data?.session) {
            console.log('No active session found');
            if (!silent) {
                navigate('/login', { state: { returnUrl: window.location.pathname } });
            }
            return false;
        }

        console.log('Authenticated via Supabase');
        return true;
    } catch (err) {
        console.error('Unexpected error during auth check:', err);
        if (!silent) {
            navigate('/login', { state: { returnUrl: window.location.pathname } });
        }
        return false;
    }
};

// Convert hex address to UUID format for Supabase
const hexToUuid = (hexAddress) => {
    // Remove the 0x prefix if present
    const hex = hexAddress.startsWith('0x') ? hexAddress.substring(2) : hexAddress;

    // Make sure we have enough characters (32 bytes / 64 chars)
    if (hex.length < 32) {
        // Pad with zeros if needed
        const paddedHex = hex.padStart(64, '0');
        // Format as UUID (8-4-4-4-12)
        return `${paddedHex.substring(0, 8)}-${paddedHex.substring(8, 12)}-${paddedHex.substring(12, 16)}-${paddedHex.substring(16, 20)}-${paddedHex.substring(20, 32)}`;
    }

    // Truncate if longer than 32 bytes / 64 chars to fit UUID format
    const truncatedHex = hex.substring(0, 32);
    // Format as UUID (8-4-4-4-12)
    return `${truncatedHex.substring(0, 8)}-${truncatedHex.substring(8, 12)}-${truncatedHex.substring(12, 16)}-${truncatedHex.substring(16, 20)}-${truncatedHex.substring(20, 32)}`;
};

// Utility function to format account address from various formats
const formatAptosAddress = (accountAddress) => {
    // Guard against null or undefined
    if (!accountAddress) {
        console.error('Received null/undefined account address');
        return null; // Return null so calling code can handle this case
    }

    // If it's already a string, return it
    if (typeof accountAddress === 'string') {
        // Ensure it starts with 0x and has content after the prefix
        if (accountAddress.startsWith('0x') && accountAddress.length > 2) {
            return accountAddress;
        }
        // Add prefix if needed and not just empty string
        if (accountAddress.trim().length > 0) {
            return `0x${accountAddress}`;
        }
        // Invalid address
        console.error('Empty address string detected');
        return null;
    }

    // If it's an object with data array
    if (accountAddress && accountAddress.data) {
        // Handle nested data object (for Aptos keyless account)
        if (typeof accountAddress.data === 'object' && !Array.isArray(accountAddress.data)) {
            // Extract values from the data object which contains numbered keys (0, 1, 2, etc.)
            const values = Object.values(accountAddress.data);
            if (values.length > 0) {
                return '0x' + values
                    .map(b => (typeof b === 'number') ? b.toString(16).padStart(2, '0') : '')
                    .join('');
            }
        }
        // Regular array data
        else if (Array.isArray(accountAddress.data) && accountAddress.data.length > 0) {
            return '0x' + Array.from(accountAddress.data)
                .map(b => (typeof b === 'number') ? b.toString(16).padStart(2, '0') : '')
                .join('');
        }
    }

    // If it has a toString method, try that
    if (accountAddress && typeof accountAddress.toString === 'function') {
        const strValue = accountAddress.toString();
        // Check that toString didn't just return "[object Object]" or similar
        if (strValue && strValue !== '[object Object]' && strValue.length > 0) {
            return strValue.startsWith('0x') ? strValue : `0x${strValue}`;
        }
    }

    // Special case for Aptos keyless account data object format {"data":{0:248,1:0,...}}
    if (accountAddress && typeof accountAddress === 'object' && accountAddress.data && 
        typeof accountAddress.data === 'object' && !Array.isArray(accountAddress.data)) {
        console.log('Processing Aptos account data object with numbered keys');
        try {
            // Extract the values as an array of numbers
            const values = Object.values(accountAddress.data);
            if (values.length > 0) {
                // Convert each byte to hex and join
                return '0x' + values
                    .map(b => (typeof b === 'number') ? b.toString(16).padStart(2, '0') : '')
                    .join('');
            }
        } catch (e) {
            console.error('Error processing Aptos data object:', e);
        }
    }
    
    // Last resort: try JSON stringify to get something useful
    try {
        const jsonString = JSON.stringify(accountAddress);
        if (jsonString && jsonString !== '{}' && jsonString !== '[]') {
            console.warn('Using JSON stringified account as fallback:', jsonString);
            
            // If this is the specific format we're looking for, extract the data directly
            // Format: {"data":{"0":248,"1":0,"2":236,...}}
            if (jsonString.includes('"data":') && jsonString.includes('0":')) {
                try {
                    const parsed = JSON.parse(jsonString);
                    if (parsed.data) {
                        const values = Object.values(parsed.data);
                        if (values.length > 0) {
                            const hexString = values
                                .map(b => (typeof b === 'number') ? b.toString(16).padStart(2, '0') : '')
                                .join('');
                            console.log('Extracted hex from JSON object:', hexString);
                            return '0x' + hexString;
                        }
                    }
                } catch (innerError) {
                    console.error('Error parsing JSON data:', innerError);
                }
            }
            
            // Fallback to hash if direct extraction fails
            let hash = 0;
            for (let i = 0; i < jsonString.length; i++) {
                hash = ((hash << 5) - hash) + jsonString.charCodeAt(i);
                hash |= 0; // Convert to 32bit integer
            }
            return `0x${Math.abs(hash).toString(16).padStart(8, '0')}`;
        }
    } catch (e) {
        console.error('Error stringifying address object:', e);
    }

    // If all else fails, return null so the calling code can handle this case
    console.error('Could not format account address', accountAddress);
    return null;
};

// Utility function to format account address as UUID for database compatibility
const formatAddressForDatabase = (address) => {
    const hexAddress = formatAptosAddress(address);
    if (!hexAddress) return null;

    // For Aptos addresses (hex format), convert to UUID format
    if (hexAddress.startsWith('0x')) {
        return hexToUuid(hexAddress);
    }

    // For anything else, return as is (assuming it's already compatible)
    return address;
};

/**
 * Get the current authenticated user from any source (Supabase or Aptos)
 * @returns {Promise<Object|null>} User object or null if not authenticated
 */
export const getCurrentUser = async () => {
    try {
        // First try to get from Supabase directly - most reliable source
        try {
            const { data, error } = await supabase.auth.getUser();

            if (!error && data?.user) {
                console.log('Found active Supabase session');
                // Return formatted user object with auth source
                return {
                    id: data.user.id, // This is the UUID that matches auth.uid() in Supabase RLS
                    email: data.user.email,
                    user_metadata: data.user.user_metadata,
                    created_at: data.user.created_at,
                    authSource: 'supabase',
                    isSupabase: true,
                    // Add the database-compatible ID for RLS policies
                    databaseId: data.user.id
                };
            }
        } catch (e) {
            console.error('Error checking Supabase session:', e);
        }

        // Next try to get from localStorage (for any auth type)
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            try {
                const parsedUser = JSON.parse(savedUser);
                console.log('Using saved user from localStorage:', parsedUser);

                // If the user already has an authSource, use it, otherwise infer it
                const authSource = parsedUser.authSource ||
                    (parsedUser.isSupabase ? 'supabase' :
                        (parsedUser.accountAddress || parsedUser.isKeyless) ? 'aptos' : 'api');

                // For Aptos users, add UUID-formatted ID for database compatibility
                let databaseId = parsedUser.id;
                if (parsedUser.accountAddress && !parsedUser.isSupabase) {
                    // Get hex address first (which might be already formatted)
                    const hexAddress = formatAptosAddress(parsedUser.accountAddress);
                    if (hexAddress) {
                        // Convert to UUID format for database
                        databaseId = hexToUuid(hexAddress);
                    }
                }

                // Enhance the user object with auth info if not present
                return {
                    ...parsedUser,
                    authSource: authSource,
                    // Add the database-compatible ID for RLS policies
                    databaseId: databaseId
                };
            } catch (e) {
                console.error('Error parsing saved user:', e);
                // Continue to other auth methods if parse fails
            }
        }

        // Check for Aptos keyless account
        const aptosAccount = localStorage.getItem('@aptos/keyless_account');
        if (aptosAccount) {
            try {
                const parsedAccount = JSON.parse(aptosAccount);
                console.log('Found Aptos keyless account:', parsedAccount);

                // Extract the account address if available
                let accountAddress = null;
                // First try the whole account object, which contains nested data structures
                accountAddress = formatAptosAddress(parsedAccount);
                
                // If that fails, try specific properties
                if (!accountAddress && parsedAccount.accountAddress) {
                    // Format the account address property
                    accountAddress = formatAptosAddress(parsedAccount.accountAddress);
                } else if (!accountAddress && parsedAccount.data) {
                    // Format from data property
                    accountAddress = formatAptosAddress(parsedAccount.data);
                }
                
                // Add debug logging
                console.log('Extracted Aptos address from keyless account:', accountAddress);

                if (accountAddress) {
                    // Convert to UUID format for database compatibility
                    const databaseId = hexToUuid(accountAddress);

                    console.log('Using Aptos account address:', accountAddress);
                    console.log('Database-compatible ID:', databaseId);

                    return {
                        id: accountAddress, // Use address as both ID and accountAddress
                        accountAddress,
                        isKeyless: true,
                        authSource: 'aptos_keyless',
                        // Add the database-compatible ID for RLS policies
                        databaseId: databaseId
                    };
                }
            } catch (e) {
                console.error('Error parsing Aptos account:', e);
            }
        }

        // If we still don't have a user, check for a token and try the API
        const token = localStorage.getItem('token');
        if (token) {
            try {
                // Use the API method as a last resort
                const response = await fetch('http://localhost:8000/api/users/me', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log('Got user from API:', data);
                    return {
                        ...data,
                        authSource: 'api'
                    };
                } else {
                    console.warn('API user lookup failed:', await response.text());
                }
            } catch (e) {
                console.error('Error fetching user from API:', e);
            }
        }

        return null;
    } catch (err) {
        console.error('Unexpected error getting user:', err);
        return null;
    }
};

// Export utility functions for use in other files
export { formatAptosAddress, formatAddressForDatabase, hexToUuid }; 