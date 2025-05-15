-- SQL to update the RLS policy to handle both UUID and hex strings
-- Check if the policy exists and drop it if it does
DROP POLICY IF EXISTS jobs_insert_policy ON jobs;
-- Create a new policy that handles both formats
CREATE POLICY jobs_insert_policy ON jobs FOR
INSERT TO authenticated WITH CHECK (
    -- For standard Supabase auth (UUID matches exactly)
    (auth.uid() = creator_id)
    OR -- For Aptos-specific users with your particular UUID
    -- Add your specific UUID here for testing, can be removed in production
    (
      creator_id = 'f800ec4c-3e24-7266-5713-e628fad87581'::uuid
    )
    OR -- For backward compatibility with hex string format Aptos addresses
    -- This is less secure but maintained for compatibility
    (creator_id::text = auth.uid()::text)
    OR (creator_id::text LIKE '0x%')
  );