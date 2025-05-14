const mongoose = require('mongoose');
require('dotenv').config({ path: '../../config.env' });

const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://syriltj1:NoNk4bBZzjOzTSfQ@cluster0.sqtzpjb.mongodb.net/mq3k_platform';

async function testConnection() {
    try {
        console.log('Attempting to connect to MongoDB...');
        console.log(`URI: ${mongoUri}`);

        await mongoose.connect(mongoUri);

        console.log('Successfully connected to MongoDB!');

        // Check if we can perform a simple operation
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Available collections:');
        collections.forEach(collection => {
            console.log(`- ${collection.name}`);
        });

        return true;
    } catch (error) {
        console.error('MongoDB connection error:', error);
        return false;
    } finally {
        // Close the connection
        await mongoose.connection.close();
        console.log('MongoDB connection closed');
    }
}

// Run the test
testConnection()
    .then(success => {
        if (success) {
            console.log('MongoDB connection test completed successfully');
            process.exit(0);
        } else {
            console.error('MongoDB connection test failed');
            process.exit(1);
        }
    })
    .catch(err => {
        console.error('Unexpected error during connection test:', err);
        process.exit(1);
    }); 