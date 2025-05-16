script {
    use escrow::escrow;
    
    fun start_dispute_main(sender: signer, client: address, milestone_index: u64) {
        escrow::start_dispute(&sender, client, milestone_index);
    }
}