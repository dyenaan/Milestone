-- Update RLS policy to allow any authenticated user for specific wallet UUID
DROP POLICY IF EXISTS jobs_insert_policy ON jobs;
-- Create a more permissive policy
CREATE POLICY jobs_insert_policy ON jobs FOR
INSERT TO authenticated WITH CHECK (
        -- Any authenticated user can create jobs with either:
        -- 1. Their own auth ID
        (auth.uid() = creator_id)
        OR -- 2. The specific Aptos wallet UUID (no user matching required)
        (
            creator_id = 'f800ec4c-3e24-7266-5713-e628fad87581'::uuid
        )
        OR -- 3. The default UUID (for testing)
        (
            creator_id = '00000000-0000-0000-0000-000000000000'::uuid
        )
    );
-- Update the select policy similarly
DROP POLICY IF EXISTS jobs_select_policy ON jobs;
CREATE POLICY jobs_select_policy ON jobs FOR
SELECT TO authenticated USING (
        -- Any job can be selected by the authenticated user if:
        -- 1. Created by the authenticated user
        (auth.uid() = creator_id)
        OR -- 2. Has the specific Aptos wallet UUID
        (
            creator_id = 'f800ec4c-3e24-7266-5713-e628fad87581'::uuid
        )
        OR -- 3. Has the default UUID (for testing)
        (
            creator_id = '00000000-0000-0000-0000-000000000000'::uuid
        )
    );