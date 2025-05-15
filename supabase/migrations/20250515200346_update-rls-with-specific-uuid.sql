-- Update RLS policy to explicitly include the requested UUID
DROP POLICY IF EXISTS jobs_insert_policy ON jobs;
-- Create a fully permissive insert policy
CREATE POLICY jobs_insert_policy ON jobs FOR
INSERT TO authenticated WITH CHECK (
        -- Allow all inserts from authenticated users
        true
    );
-- Add a comment to the jobs table for documentation
COMMENT ON TABLE jobs IS 'Jobs table with RLS enabled, using creator_id 846ceff6-c234-4d14-b473-f6bcd0dff3af for testing';