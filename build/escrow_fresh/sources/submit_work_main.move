script {
    use escrow::escrow;
    
    fun submit_work_main(sender: signer, client: address, milestone_index: u64, evidence: vector<u8>) {
        escrow::submit_work(&sender, client, milestone_index, evidence);
    }
}