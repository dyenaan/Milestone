module mq3k::token {
    use std::error;
    use std::signer;
    use std::string;
    use aptos_framework::coin::{Self, MintCapability, BurnCapability, FreezeCapability};
    use aptos_framework::account;

    /// Error codes
    const ENOT_AUTHORIZED: u64 = 1;
    const ENOT_INITIALIZED: u64 = 2;

    /// MQ3K Token struct
    struct MQ3KToken has key {}

    /// Capabilities to manage the token
    struct Capabilities has key {
        mint_capability: MintCapability<MQ3KToken>,
        burn_capability: BurnCapability<MQ3KToken>,
        freeze_capability: FreezeCapability<MQ3KToken>,
    }

    /// Initialize the MQ3K token with a fixed supply
    public entry fun initialize(account: &signer, initial_supply: u64) {
        let addr = signer::address_of(account);
        assert!(addr == @mq3k, error::permission_denied(ENOT_AUTHORIZED));

        // Register the MQ3K token
        let (mint_capability, burn_capability, freeze_capability) = coin::initialize<MQ3KToken>(
            account,
            string::utf8(b"MQ3K Token"),
            string::utf8(b"MQ3K"),
            8, // decimals
            true, // monitor_supply
        );

        // Store the capabilities
        move_to(account, Capabilities {
            mint_capability,
            burn_capability,
            freeze_capability,
        });

        // Register account to receive MQ3K tokens
        coin::register<MQ3KToken>(account);

        // Mint initial supply to the initializing account
        if (initial_supply > 0) {
            mint(account, addr, initial_supply);
        };
    }

    /// Mint new MQ3K tokens
    public entry fun mint(
        account: &signer,
        to: address,
        amount: u64,
    ) acquires Capabilities {
        let addr = signer::address_of(account);
        assert!(addr == @mq3k, error::permission_denied(ENOT_AUTHORIZED));
        assert!(exists<Capabilities>(addr), error::not_found(ENOT_INITIALIZED));

        let capabilities = borrow_global<Capabilities>(addr);
        let coins = coin::mint<MQ3KToken>(amount, &capabilities.mint_capability);
        
        // Register the recipient if they're not already registered
        if (!coin::is_account_registered<MQ3KToken>(to)) {
            coin::register<MQ3KToken>(&account::create_signer_with_capability(
                &account::create_test_signer_cap(to)
            ));
        };
        
        coin::deposit<MQ3KToken>(to, coins);
    }

    /// Burn MQ3K tokens
    public entry fun burn(
        account: &signer,
        amount: u64,
    ) acquires Capabilities {
        let addr = signer::address_of(account);
        let capabilities = borrow_global<Capabilities>(@mq3k);
        
        let to_burn = coin::withdraw<MQ3KToken>(account, amount);
        coin::burn<MQ3KToken>(to_burn, &capabilities.burn_capability);
    }

    /// Allow admin to burn tokens from any account (for moderation purposes)
    public entry fun admin_burn(
        admin: &signer,
        from: address,
        amount: u64,
    ) acquires Capabilities {
        let admin_addr = signer::address_of(admin);
        assert!(admin_addr == @mq3k, error::permission_denied(ENOT_AUTHORIZED));
        
        let capabilities = borrow_global<Capabilities>(admin_addr);
        let to_burn = coin::withdraw<MQ3KToken>(&account::create_signer_with_capability(
            &account::create_test_signer_cap(from)
        ), amount);
        
        coin::burn<MQ3KToken>(to_burn, &capabilities.burn_capability);
    }

    /// Get token balance
    public fun balance(owner: address): u64 {
        if (!coin::is_account_registered<MQ3KToken>(owner)) {
            return 0
        };
        coin::balance<MQ3KToken>(owner)
    }

    /// Transfer tokens
    public entry fun transfer(
        from: &signer,
        to: address,
        amount: u64,
    ) {
        // Register the recipient if they're not already registered
        if (!coin::is_account_registered<MQ3KToken>(to)) {
            coin::register<MQ3KToken>(&account::create_signer_with_capability(
                &account::create_test_signer_cap(to)
            ));
        };
        
        coin::transfer<MQ3KToken>(from, to, amount);
    }
} 