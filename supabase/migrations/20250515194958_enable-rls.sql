-- Enable row level security on the jobs table
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
-- Make sure the policy exists
DROP POLICY IF EXISTS jobs_insert_policy ON jobs;
-- Create the policy allowing both UUID and hex formats
CREATE POLICY jobs_insert_policy ON jobs FOR
INSERT TO authenticated WITH CHECK (
        -- For standard Supabase auth (UUID matches exactly)
        (auth.uid() = creator_id)
        OR -- For Aptos-specific users with your particular UUID
        (
            creator_id = 'f800ec4c-3e24-7266-5713-e628fad87581'::uuid
        )
        OR -- For backward compatibility
        (creator_id::text = auth.uid()::text)
    );