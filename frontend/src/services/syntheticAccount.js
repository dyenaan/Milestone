import { Aptos, AptosConfig, Network, KeylessAccount } from '@aptos-labs/ts-sdk';

// Initialize Aptos client
const aptos = new Aptos(new AptosConfig({ network: Network.DEVNET }));

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