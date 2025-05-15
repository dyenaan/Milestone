import { Aptos, AptosConfig, Network, KeylessAccount } from '@aptos-labs/ts-sdk';

// Initialize Aptos client
const aptos = new Aptos(new AptosConfig({ network: Network.DEVNET }));

/**
 * Utility to create synthetic Aptos accounts for development and testing
 * These are not real accounts but can be used to simulate wallet interactions
 * 
 * @param {Object} options Configuration options
 * @param {string} options.seed A seed to generate deterministic accounts (optional)
 * @param {string} options.accountAddress The Aptos account address to use
 * @returns {Object} The synthetic account with address and methods
 */
export const createSyntheticAccount = async (options = {}) => {
    try {
        // Use provided address or generate a random one
        const accountAddress = options.accountAddress ||
            '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

        // Create a basic account structure
        const account = {
            accountAddress,
            isActive: true,
            balance: {
                apt: '0',
                usd: '0'
            },
            resources: [],
            modules: [],
            transactions: []
        };

        // If we have a real address, try to fetch actual data
        if (options.accountAddress) {
            try {
                // Try to get account resources (will fail for non-existent accounts)
                const resources = await aptos.getAccountResources({
                    accountAddress: options.accountAddress
                });

                if (Array.isArray(resources)) {
                    account.resources = resources;
                    // Extract coin balances if available
                    const aptCoin = resources.find(r => r.type === '0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>');
                    if (aptCoin && aptCoin.data && aptCoin.data.coin) {
                        account.balance.apt = aptCoin.data.coin.value || '0';
                    }
                }
            } catch (error) {
                console.warn(`Could not fetch data for account ${options.accountAddress}`, error);
            }
        }

        return account;
    } catch (error) {
        console.error('Error creating synthetic account:', error);
        return {
            accountAddress: '0x0',
            isActive: false,
            balance: { apt: '0', usd: '0' },
            error: error.message
        };
    }
};

/**
 * Check if an address is a valid Aptos address
 * @param {string} address The Aptos address to validate
 * @returns {boolean} Whether the address is valid
 */
export const isValidAptosAddress = (address) => {
    if (!address || typeof address !== 'string') return false;
    return /^0x[0-9a-fA-F]{1,64}$/.test(address);
};

/**
 * Utility to create synthetic Aptos accounts for development and testing
 */
export const SyntheticAccount = {
    /**
     * Creates a synthetic keyless account with predefined properties
     * @param {Object} options Configuration options for the synthetic account
     * @param {string} options.accountAddress The Aptos account address to use
     * @param {Uint8Array} options.publicKey The public key to use for the account
     * @returns {KeylessAccount} A synthetic KeylessAccount instance
     */
    createKeylessAccount: (options) => {
        const { accountAddress, publicKey } = options;

        // Create synthetic auth key (normally derived from JWT and ephemeral key in real flow)
        const authKey = new Uint8Array(32);
        // Fill with a pattern based on the address (just for determinism)
        for (let i = 0; i < 32; i++) {
            authKey[i] = i % 8;
        }

        try {
            // Create a synthetic KeylessAccount
            return new KeylessAccount({
                accountAddress,
                publicKey,
                authenticationKey: authKey,
                jwtIssuer: 'synthetic-google',
                jwtSub: 'dev@example.com'
            });
        } catch (error) {
            console.error('Error creating synthetic keyless account:', error);
            throw error;
        }
    },

    /**
     * Verifies if a synthetic account exists on the blockchain
     * @param {string} address The account address to check
     * @returns {Promise<boolean>} Whether the account exists
     */
    verifyAccount: async (address) => {
        try {
            // Try to get resources for the account - if it exists, this should work
            const resources = await aptos.getAccountResources({
                accountAddress: address,
            });

            return resources && resources.length > 0;
        } catch (error) {
            console.error('Account verification failed:', error);
            return false;
        }
    },

    /**
     * Creates a fallback user object when full synthetic account creation fails
     * @param {string} address The Aptos address to use
     * @returns {Object} A user object compatible with the auth context
     */
    createFallbackUser: (address) => {
        return {
            accountAddress: address,
            username: 'Developer',
            email: 'dev@example.com',
            isKeyless: true,
            bypassLogin: true,
            role: 'developer',
            reputation: 100,
        };
    }
};

export default SyntheticAccount; 