-- Clear any existing policies
DROP POLICY IF EXISTS jobs_insert_policy ON jobs;
-- Ensure RLS is enabled
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
-- Create a simple, effective policy
CREATE POLICY jobs_insert_policy ON jobs FOR
INSERT TO authenticated WITH CHECK (
        -- Direct UUID match (standard case)
        (auth.uid() = creator_id)
        OR -- Hard-coded Aptos UUID - useful for testing
        (
            creator_id = 'f800ec4c-3e24-7266-5713-e628fad87581'::uuid
        )
        OR -- Custom backward compatibility clause
        (
            creator_id::text = REPLACE(
                REPLACE(LOWER(auth.uid()::text), '-', ''),
                ' ',
                ''
            )
        )
    );
-- Add also a select policy to view your own jobs
DROP POLICY IF EXISTS jobs_select_policy ON jobs;
CREATE POLICY jobs_select_policy ON jobs FOR
SELECT TO authenticated USING (
        (auth.uid() = creator_id)
        OR (
            creator_id = 'f800ec4c-3e24-7266-5713-e628fad87581'::uuid
        )
    );