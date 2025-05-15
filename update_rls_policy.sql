-- SQL to update the RLS policy to handle both UUID and hex strings
-- Check if the policy exists and drop it if it does
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
-- Add also a select policy to view your own jobs
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
-- Create tables for Aptos address mapping
CREATE TABLE IF NOT EXISTS aptos_address_mapping (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  address TEXT NOT NULL UNIQUE,
  uuid UUID NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- Add a comment to the table
COMMENT ON TABLE aptos_address_mapping IS 'Maps Aptos wallet addresses to UUIDs for consistent identification';
-- Add indexes for faster lookup
CREATE INDEX IF NOT EXISTS idx_aptos_address_mapping_address ON aptos_address_mapping(address);
CREATE INDEX IF NOT EXISTS idx_aptos_address_mapping_uuid ON aptos_address_mapping(uuid);
-- Allow public access to the address mapping table (since we need to read/write without auth)
ALTER TABLE aptos_address_mapping ENABLE ROW LEVEL SECURITY;
-- Policy that allows anyone to insert a new mapping
CREATE POLICY "Anyone can insert address mappings" ON aptos_address_mapping FOR
INSERT TO anon WITH CHECK (true);
-- Policy that allows anyone to read mappings
CREATE POLICY "Anyone can select address mappings" ON aptos_address_mapping FOR
SELECT TO anon USING (true);