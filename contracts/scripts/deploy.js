const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    // Get the initial balance
    const initialBalance = await ethers.provider.getBalance(deployer.address);
    console.log("Account balance:", ethers.utils.formatEther(initialBalance));

    // Deploy the MQ3KToken contract
    const initialSupply = ethers.utils.parseEther("10000000"); // 10 million tokens
    const MQ3KToken = await ethers.getContractFactory("MQ3KToken");
    const token = await MQ3KToken.deploy(initialSupply);
    await token.deployed();
    console.log("MQ3KToken deployed to:", token.address);

    // Deploy the MQ3KEscrow contract
    const MQ3KEscrow = await ethers.getContractFactory("MQ3KEscrow");
    const escrow = await MQ3KEscrow.deploy();
    await escrow.deployed();
    console.log("MQ3KEscrow deployed to:", escrow.address);

    // Get the final balance
    const finalBalance = await ethers.provider.getBalance(deployer.address);
    console.log(
        "Deployment cost:",
        ethers.utils.formatEther(initialBalance.sub(finalBalance)),
        "ETH"
    );

    // Write the contract addresses to a file
    const deploymentInfo = {
        network: hre.network.name,
        tokenAddress: token.address,
        escrowAddress: escrow.address,
        timestamp: new Date().toISOString(),
    };

    // Create deployments directory if it doesn't exist
    const deploymentsDir = path.join(__dirname, "../deployments");
    if (!fs.existsSync(deploymentsDir)) {
        fs.mkdirSync(deploymentsDir);
    }

    // Write deployment info to file
    fs.writeFileSync(
        path.join(deploymentsDir, `${hre.network.name}.json`),
        JSON.stringify(deploymentInfo, null, 2)
    );
    console.log(`Deployment info saved to deployments/${hre.network.name}.json`);

    // Update the .env.example file with new addresses
    console.log("\nUpdate your .env file with these values:");
    console.log(`MQ3K_TOKEN_ADDRESS=${token.address}`);
    console.log(`MQ3K_ESCROW_ADDRESS=${escrow.address}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 