script {
    use escrow::escrow;
    
    fun init_events_main(sender: signer) {
        escrow::init_events(&sender);
    }
}