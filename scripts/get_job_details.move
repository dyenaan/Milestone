script {
    use escrow::escrow;
    
    fun get_job_details_script(account: signer, addr: address) {
        let (client, freelancer, current_step, total_milestones, is_active, platform_address, escrow_address) = 
            escrow::get_job_details(addr);
            
        // The script will execute and you can check the transaction output for the values
        // Unfortunately, without printing capabilities, we can't output the values directly
    }
}