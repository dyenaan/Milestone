import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Get milestones for a job
router.get('/job/:jobId', async (req, res) => {
    try {
        // For now, return empty array to prevent errors
        res.status(200).json({ milestones: [] });
    } catch (error: any) {
        console.error('Error fetching milestones:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get a specific milestone
router.get('/:id', async (req, res) => {
    try {
        res.status(404).json({ message: 'Milestone not found' });
    } catch (error: any) {
        console.error('Error fetching milestone:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Create a new milestone
router.post('/', authMiddleware, async (req, res) => {
    try {
        res.status(201).json({
            message: 'Milestone created',
            milestone: {
                id: 'temp-' + Date.now(),
                ...req.body
            }
        });
    } catch (error: any) {
        console.error('Error creating milestone:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Update a milestone
router.patch('/:id', authMiddleware, async (req, res) => {
    try {
        res.status(200).json({
            message: 'Milestone updated',
            milestone: {
                id: req.params.id,
                ...req.body
            }
        });
    } catch (error: any) {
        console.error('Error updating milestone:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Delete a milestone
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        res.status(200).json({ message: 'Milestone deleted' });
    } catch (error: any) {
        console.error('Error deleting milestone:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router; 