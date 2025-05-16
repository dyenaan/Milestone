/**
 * Formats an Aptos wallet address for display by showing only the first and last few characters
 * @param {string} address - The full Aptos wallet address
 * @param {number} startChars - Number of characters to show at the start (default: a)
 * @param {number} endChars - Number of characters to show at the end (default: 4)
 * @returns {string} Formatted address like 0x1234...5678
 */
export const formatWalletAddress = (address, startChars = 6, endChars = 4) => {
    if (!address) return 'Not Connected';

    // Clean up the address if needed
    let cleanAddress = address;
    if (typeof address !== 'string') {
        if (address.toString) {
            cleanAddress = address.toString();
        } else {
            return 'Invalid Address Format';
        }
    }

    // Remove 0x prefix if it exists for consistent formatting
    const prefix = cleanAddress.startsWith('0x') ? '0x' : '';
    const addressWithoutPrefix = cleanAddress.startsWith('0x')
        ? cleanAddress.slice(2)
        : cleanAddress;

    // Format address
    if (addressWithoutPrefix.length <= startChars + endChars) {
        return cleanAddress; // Address is too short to truncate
    }

    return `${prefix}${addressWithoutPrefix.substring(0, startChars)}...${addressWithoutPrefix.substring(addressWithoutPrefix.length - endChars)}`;
};

/**
 * Validates if a string is a valid Aptos address
 * @param {string} address - The address to validate
 * @returns {boolean} Whether the address is valid
 */
export const isValidAptosAddress = (address) => {
    if (!address || typeof address !== 'string') return false;

    // Aptos addresses are 0x followed by 64 hex characters
    const addressRegex = /^0x[a-fA-F0-9]{64}$/;
    return addressRegex.test(address);
};

/**
 * Makes an address clickable by generating link to Aptos Explorer
 * @param {string} address - The Aptos address
 * @param {string} network - Network name (mainnet, testnet, devnet)
 * @returns {string} Full URL to explorer
 */
export const getAptosExplorerUrl = (address, network = 'devnet') => {
    if (!address) return '#';

    const baseUrls = {
        mainnet: 'https://explorer.aptoslabs.com/account/',
        testnet: 'https://explorer.aptoslabs.com/account/',
        devnet: 'https://explorer.aptoslabs.com/account/'
    };

    const baseUrl = baseUrls[network.toLowerCase()] || baseUrls.devnet;
    return `${baseUrl}${address}?network=${network.toLowerCase()}`;
}; 