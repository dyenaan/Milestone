# Aptos Escrow Smart Contract

A decentralized escrow system implemented on the Aptos blockchain. This contract enables secure freelance work agreements with milestone-based payments and a dispute resolution system.

## Features

- **Milestone-Based Payments**: Break down projects into multiple milestones with individual payments
- **Dispute Resolution System**: Built-in dispute resolution with impartial reviewers 
- **Secure Workflow**: Clear state transitions from job creation to completion
- **Event Handling**: Comprehensive event emission for off-chain tracking

## Contract Address

The contract is deployed on Aptos Testnet at: af84d3ed53850293b21808c76880b3e386ac290fccf921ab7ea87a44b95a34f9::escrow

## How It Works

1. **Job Creation**: Client creates a job with defined milestones and payment amounts
2. **Work Submission**: Freelancer submits work for each milestone
3. **Approval Flow**: Client approves the work or a dispute can be initiated
4. **Dispute Resolution**: In case of disputes, reviewers vote to approve or reject work
5. **Completion**: Job is completed when all milestones are approved

## Contract Structure

- `Job`: Main structure for storing job details and milestone information
- `Milestone`: Individual task units with associated payment amounts
- `Vote`: Used during dispute resolution by reviewers
- `EscrowEvents`: Handles all event emissions for contract interactions

## Interacting with the Contract

### Initialize the Contract

```bash
aptos move run --profile any_profile --function-id af84d3ed53850293b21808c76880b3e386ac290fccf921ab7ea87a44b95a34f9::escrow::init_events

##Create a Job
bashaptos move run --profile client --function-id af84d3ed53850293b21808c76880b3e386ac290fccf921ab7ea87a44b95a34f9::escrow::create_job --args address:freelancer_address vector<u64>:"100,200,300" address:platform_address u64:3

##Submit Work
bashaptos move run --profile freelancer --function-id af84d3ed53850293b21808c76880b3e386ac290fccf921ab7ea87a44b95a34f9::escrow::submit_work --args address:client_address u64:0 vector<u8>:"evidence_url"

##Approve Milestone
bashaptos move run --profile client --function-id af84d3ed53850293b21808c76880b3e386ac290fccf921ab7ea87a44b95a34f9::escrow::approve_milestone

##Initiate Dispute
bashaptos move run --profile freelancer --function-id af84d3ed53850293b21808c76880b3e386ac290fccf921ab7ea87a44b95a34f9::escrow::start_dispute --args address:client_address u64:0

##Assign Reviewers (Platform)
bashaptos move run --profile platform --function-id af84d3ed53850293b21808c76880b3e386ac290fccf921ab7ea87a44b95a34f9::escrow::assign_reviewers --args address:client_address u64:0 "vector<address>:reviewer1,reviewer2,reviewer3,reviewer4,reviewer5"

##Cast Vote (Reviewer)
bashaptos move run --profile reviewer1 --function-id af84d3ed53850293b21808c76880b3e386ac290fccf921ab7ea87a44b95a34f9::escrow::cast_vote --args address:client_address u64:0 u8:1
