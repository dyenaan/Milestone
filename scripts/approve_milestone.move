script {
    use escrow::escrow;
    
    fun approve_milestone_main(sender: signer) {
        escrow::approve_milestone(&sender);
    }
}
