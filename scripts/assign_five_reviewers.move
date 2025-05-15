script {
    use std::vector;
    use escrow::escrow;
    
    fun assign_five_reviewers_main(
        account: &signer,
        client: address,
        milestone_index: u64,
        reviewer1: address,
        reviewer2: address,
        reviewer3: address
    ) {
        let reviewers = vector::empty<address>();
        vector::push_back(&mut reviewers, reviewer1);
        vector::push_back(&mut reviewers, reviewer2);
        vector::push_back(&mut reviewers, reviewer3);
        
        escrow::assign_reviewers(account, client, milestone_index, reviewers);
    }
}
