import { EphemeralKeyPair, KeylessAccount as AptosKeylessAccount } from '@aptos-labs/ts-sdk';

export interface EphemeralKeyPairData {
    publicKey: number[];
    privateKey: number[];
    nonce: string;
    expirationTimestamp: string;
}

export type KeylessAccount = AptosKeylessAccount;

export interface AuthContextType {
    loginWithGoogleAptos: (data: { walletAddress: string; googleToken: string }) => Promise<any>;
    storeKeylessAccount: (account: KeylessAccount) => void;
    // Add other auth context properties as needed
} 