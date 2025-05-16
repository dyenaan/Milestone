script {
    use escrow::escrow;
    
    // Need to specify the coin type
    fun approve_milestone_main<CoinType>(sender: signer) {
        escrow::approve_milestone<CoinType>(&sender);
    }
}