// Test Supabase connection and jobs table access
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './backend/.env' });

// Supabase configuration from backend .env
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Using service role key to bypass RLS

console.log('Supabase URL:', supabaseUrl);
console.log('Service Role Key (first 10 chars):', supabaseKey?.substring(0, 10));

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    console.log('Testing Supabase connection and jobs table access...');

    try {
        // Test getting jobs
        const { data: jobs, error: jobsError } = await supabase
            .from('jobs')
            .select('*')
            .limit(5);

        if (jobsError) {
            console.error('Error fetching jobs:', jobsError);
        } else {
            console.log('Successfully fetched jobs table! Found', jobs.length, 'jobs');
            console.log('First job:', jobs[0]);

            // Get all columns from the jobs table
            console.log('\nJob table columns:');
            if (jobs[0]) {
                Object.keys(jobs[0]).forEach(column => {
                    console.log(` - ${column}: ${typeof jobs[0][column]}`);
                });
            }
        }
    } catch (error) {
        console.error('Unexpected error:', error);
    }
}

testConnection(); 