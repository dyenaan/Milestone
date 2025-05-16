Aptos Escrow Frontend
This is a React-based frontend application for interacting with the Aptos Escrow smart contract.

Features
Connect to Aptos wallet (Petra, Martian, etc.)
Create escrow jobs with multiple milestones
Submit work as a freelancer
Approve milestones as a client
Handle disputes with reviewer voting
View job and milestone details
Prerequisites
Node.js and npm installed
An Aptos wallet extension (Petra, Martian, etc.) installed in your browser
Testnet APT tokens for testing
Setup Instructions
Clone this repository:
git clone https://github.com/yourusername/escrow-frontend.git
cd escrow-frontend
Install dependencies:
npm install
Configure the contract address: Open src/App.js and update the MODULE_ADDRESS constant with your deployed escrow contract address.
Start the development server:
npm start
Open your browser and navigate to http://localhost:3000
Using the Application
Connect Your Wallet:
Click the "Connect Wallet" button in the navbar
Approve the connection in your wallet extension
Create a Job:
Navigate to the "Create Job" tab
Fill in the freelancer address
Configure milestone details
Submit the transaction
Submit Work (as Freelancer):
Connect with the freelancer wallet
Navigate to "Job Details"
Provide evidence of your work
Submit the transaction
Approve Work (as Client):
Connect with the client wallet
Navigate to "Job Details"
Review the submitted work
Approve the milestone
Handle Disputes:
Freelancer can start a dispute
Platform can assign reviewers
Reviewers can vote on disputes
Contract Integration
This frontend interacts with the Aptos Escrow smart contract located at: 0x30cc6c38c6d9c6e68eae4eadf21ad7b795e4b8aa9ecf127394a258ee6a7d0950::escrow

Make sure you've deployed your contract and update this address accordingly.

Development
This project was bootstrapped with Create React App.

To run tests:

npm test
To build for production:

npm run build
License
MIT

