import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import jobsRoutes from './routes/jobs';
import milestonesRoutes from './routes/milestones';
import { errorHandler } from './middleware/error';

// Create Express server
const app = express();

// Express configuration
app.use(morgan('dev'));
app.use(helmet({
    contentSecurityPolicy: false
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is healthy' });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/milestones', milestonesRoutes);

// Error handling middleware
app.use(errorHandler);

// Start Express server
const port = process.env.PORT || 8000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

export default app; 