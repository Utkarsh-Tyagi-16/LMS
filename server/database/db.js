import mongoose from "mongoose";

// Cache the database connection
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
    // If we have a cached connection, return it
    if (cached.conn) {
        console.log('Using cached MongoDB connection');
        return cached.conn;
    }

    // If we don't have a connection promise, create one
    if (!cached.promise) {
        const opts = {
            bufferCommands: false, // Disable mongoose buffering
            serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
            socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
            family: 4, // Use IPv4, skip trying IPv6
            maxPoolSize: 1, // Maximum number of connections in the pool
            minPoolSize: 0, // Minimum number of connections in the pool
            maxIdleTimeMS: 10000, // How long a connection can remain idle before being removed
            connectTimeoutMS: 10000, // How long to wait for initial connection
            retryWrites: true, // Retry write operations if they fail
            retryReads: true, // Retry read operations if they fail
            w: 'majority', // Write concern
            wtimeoutMS: 2500, // Write concern timeout
            useNewUrlParser: true,
            useUnifiedTopology: true
        };

        try {
            console.log('Connecting to MongoDB...');
            if (!process.env.MONGO_URI) {
                throw new Error('MONGO_URI is not defined in environment variables');
            }
            cached.promise = mongoose.connect(process.env.MONGO_URI, opts)
                .then((mongoose) => {
                    console.log('MongoDB Connected Successfully');
                    return mongoose;
                });
        } catch (error) {
            console.error('MongoDB connection error:', error);
            cached.promise = null;
            throw error;
        }
    }

    try {
        cached.conn = await cached.promise;
        return cached.conn;
    } catch (error) {
        cached.promise = null;
        console.error('Failed to establish MongoDB connection:', error);
        throw error;
    }
};

// Handle connection events
mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.error('Mongoose connection error:', err);
    cached.conn = null;
    cached.promise = null;
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected from MongoDB');
    cached.conn = null;
    cached.promise = null;
});

// Handle process termination
process.on('SIGINT', async () => {
    try {
        await mongoose.connection.close();
        console.log('Mongoose connection closed through app termination');
        process.exit(0);
    } catch (err) {
        console.error('Error during mongoose connection closure:', err);
        process.exit(1);
    }
});

export default connectDB;