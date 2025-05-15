// Script to directly post a job to Supabase via terminal
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './backend/.env' });

// Supabase configuration from backend .env
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Using service role key to bypass RLS

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Create a test job
async function createJob() {
    console.log('Creating test job...');
    console.log('Using Supabase URL:', supabaseUrl);

    const jobData = {
        title: 'Test Job from Terminal',
        description: 'This job was created directly via terminal script',
        budget: 100,
        category: 'Development',
        deadline: new Date().toISOString().split('T')[0], // Today's date
        status: 'open',
        creator_id: '846ceff6-c234-4d14-b473-f6bcd0dff3af' // The specified UUID
    };

    try {
        // Insert the job
        const { data, error } = await supabase
            .from('jobs')
            .insert(jobData)
            .select();

        if (error) {
            console.error('Error creating job:', error);
        } else {
            console.log('Job created successfully!');
            console.log('Job data:', data);
        }
    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

// Run the function
createJob(); 