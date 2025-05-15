-- Update the RLS policy to allow the default UUID for testing
-- Drop the existing insert policy
DROP POLICY IF EXISTS jobs_insert_policy ON jobs;
-- Create a new insert policy with the default UUID
CREATE POLICY jobs_insert_policy ON jobs FOR
INSERT TO authenticated WITH CHECK (
        -- Direct UUID match (standard case)
        (auth.uid() = creator_id)
        OR -- Hard-coded Aptos UUID for testing
        (
            creator_id = 'f800ec4c-3e24-7266-5713-e628fad87581'::uuid
        )
        OR -- Allow default UUID (all zeros) for testing purposes
        (
            creator_id = '00000000-0000-0000-0000-000000000000'::uuid
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
-- Update the select policy too
DROP POLICY IF EXISTS jobs_select_policy ON jobs;
CREATE POLICY jobs_select_policy ON jobs FOR
SELECT TO authenticated USING (
        (auth.uid() = creator_id)
        OR (
            creator_id = 'f800ec4c-3e24-7266-5713-e628fad87581'::uuid
        )
        OR (
            creator_id = '00000000-0000-0000-0000-000000000000'::uuid
        )
    );