script {
    use std::vector;
    use escrow::escrow;
    
    fun create_job_main<CoinType>(
        sender: signer, 
        freelancer: address, 
        platform_address: address, 
        min_votes_required: u64
    ) {
        let amounts = vector::empty<u64>();
        vector::push_back(&mut amounts, 100);
        vector::push_back(&mut amounts, 100);
        vector::push_back(&mut amounts, 100);
        
        escrow::create_job_with_funds<CoinType>(&sender, freelancer, amounts, platform_address, min_votes_required);
    }
}