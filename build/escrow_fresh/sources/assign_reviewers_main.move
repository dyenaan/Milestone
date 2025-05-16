script {
    use std::vector;
    use escrow::escrow;
    
    fun assign_reviewers_main(
        sender: signer, 
        client: address,
        milestone_index: u64,
        reviewer1: address,
        reviewer2: address,
        reviewer3: address,
        reviewer4: address,
        reviewer5: address
    ) {
        let reviewers = vector::empty<address>();
        vector::push_back(&mut reviewers, reviewer1);
        vector::push_back(&mut reviewers, reviewer2);
        vector::push_back(&mut reviewers, reviewer3);
        vector::push_back(&mut reviewers, reviewer4);
        vector::push_back(&mut reviewers, reviewer5);
        
        escrow::assign_reviewers(&sender, client, milestone_index, reviewers);
    }
}