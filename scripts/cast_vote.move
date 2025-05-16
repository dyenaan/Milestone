script {
    use escrow::escrow;
    
    fun cast_vote_main<CoinType>(
        sender: signer, 
        client: address, 
        milestone_index: u64, 
        vote_value: u8
    ) {
        escrow::cast_vote<CoinType>(&sender, client, milestone_index, vote_value);
    }
}