-- Set the most permissive RLS policy for debugging
-- Make sure RLS is enabled
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS jobs_insert_policy ON jobs;
DROP POLICY IF EXISTS jobs_select_policy ON jobs;
DROP POLICY IF EXISTS jobs_update_policy ON jobs;
DROP POLICY IF EXISTS jobs_delete_policy ON jobs;
-- Create a fully permissive insert policy
CREATE POLICY jobs_insert_policy ON jobs FOR
INSERT TO authenticated WITH CHECK (true);
-- Allow all inserts from authenticated users
-- Create permissive select policy
CREATE POLICY jobs_select_policy ON jobs FOR
SELECT TO authenticated USING (true);
-- Allow all selects from authenticated users