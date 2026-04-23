const mongoose = require('mongoose');
const todoConnection = mongoose.createConnection(process.env.MONGODB_TODOS);

// initialize database connections
const connectAll = async () => {
    try {
        // Wait for both connections to establish
        await Promise.all([
            new Promise((resolve, reject) => {
                todoConnection.on('connected', resolve);
                todoConnection.on('error', reject);
            })
        ]);
        console.log('Database connections initialized successfully');
        return todoConnection;
    } catch (error) {
        console.error('Error initializing database connections:', error);
        process.exit(1);  // Exit the process on failure
    }
};

module.exports = {connectAll, todoConnection};