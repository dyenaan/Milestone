-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    wallet_address TEXT UNIQUE,
    first_name TEXT,
    last_name TEXT,
    full_name TEXT GENERATED ALWAYS AS (
        CASE
            WHEN first_name IS NULL
            AND last_name IS NULL THEN NULL
            WHEN first_name IS NULL THEN last_name
            WHEN last_name IS NULL THEN first_name
            ELSE first_name || ' ' || last_name
        END
    ) STORED,
    bio TEXT,
    avatar_url TEXT,
    website TEXT,
    company TEXT,
    reputation INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- Create jobs table
CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    budget NUMERIC(10, 2) NOT NULL,
    category TEXT NOT NULL,
    deadline DATE,
    creator_id TEXT NOT NULL,
    -- This can be a wallet_address or user_id
    assignee_id TEXT,
    -- This can be a wallet_address or user_id of the freelancer
    status TEXT DEFAULT 'open' CHECK (
        status IN (
            'open',
            'assigned',
            'in_progress',
            'completed',
            'cancelled'
        )
    ),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- Create milestones table
CREATE TABLE IF NOT EXISTS milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    deadline DATE,
    status TEXT DEFAULT 'pending' CHECK (
        status IN (
            'pending',
            'in_progress',
            'completed',
            'approved',
            'paid'
        )
    ),
    transaction_hash TEXT,
    -- For blockchain transaction reference
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- Create proposals table
CREATE TABLE IF NOT EXISTS proposals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    freelancer_id TEXT NOT NULL,
    -- This can be a wallet_address or user_id
    cover_letter TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    estimated_time TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    milestone_id UUID REFERENCES milestones(id) ON DELETE
    SET NULL,
        from_address TEXT NOT NULL,
        to_address TEXT NOT NULL,
        amount NUMERIC(10, 2) NOT NULL,
        transaction_hash TEXT,
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- Create health_check table for connection tests
CREATE TABLE IF NOT EXISTS health_check (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    status TEXT NOT NULL,
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- Create Row Level Security policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
-- RLS policy for profiles
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR
SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON profiles FOR
UPDATE USING (auth.uid() = user_id);
-- RLS policy for jobs
CREATE POLICY "Jobs are viewable by everyone" ON jobs FOR
SELECT USING (true);
CREATE POLICY "Users can insert their own jobs" ON jobs FOR
INSERT WITH CHECK (true);
CREATE POLICY "Job creators can update their own jobs" ON jobs FOR
UPDATE USING (
        creator_id = (
            SELECT wallet_address
            FROM profiles
            WHERE user_id = auth.uid()
        )
        OR creator_id = auth.uid()::text
    );
-- RLS policy for milestones
CREATE POLICY "Milestones are viewable by everyone" ON milestones FOR
SELECT USING (true);
CREATE POLICY "Job creators can insert milestones" ON milestones FOR
INSERT WITH CHECK (
        EXISTS (
            SELECT 1
            FROM jobs
            WHERE jobs.id = job_id
                AND (
                    jobs.creator_id = (
                        SELECT wallet_address
                        FROM profiles
                        WHERE user_id = auth.uid()
                    )
                    OR jobs.creator_id = auth.uid()::text
                )
        )
    );
CREATE POLICY "Job creators can update milestones" ON milestones FOR
UPDATE USING (
        EXISTS (
            SELECT 1
            FROM jobs
            WHERE jobs.id = job_id
                AND (
                    jobs.creator_id = (
                        SELECT wallet_address
                        FROM profiles
                        WHERE user_id = auth.uid()
                    )
                    OR jobs.creator_id = auth.uid()::text
                )
        )
    );
-- Create functions to link wallet addresses to users
CREATE OR REPLACE FUNCTION public.get_user_by_wallet(wallet_addr text) RETURNS uuid LANGUAGE sql SECURITY DEFINER AS $$
SELECT user_id
FROM profiles
WHERE wallet_address = wallet_addr
LIMIT 1;
$$;
-- Function to get all jobs by wallet address
CREATE OR REPLACE FUNCTION public.get_jobs_by_wallet(wallet_addr text) RETURNS SETOF jobs LANGUAGE sql SECURITY DEFINER AS $$
SELECT *
FROM jobs
WHERE creator_id = wallet_addr
ORDER BY created_at DESC;
$$;
-- Function to get all milestones by wallet address
CREATE OR REPLACE FUNCTION public.get_milestones_by_wallet(wallet_addr text) RETURNS TABLE(
        id uuid,
        job_id uuid,
        job_title text,
        title text,
        description text,
        amount numeric,
        deadline date,
        status text,
        transaction_hash text,
        created_at timestamptz,
        updated_at timestamptz
    ) LANGUAGE sql SECURITY DEFINER AS $$
SELECT m.id,
    m.job_id,
    j.title as job_title,
    m.title,
    m.description,
    m.amount,
    m.deadline,
    m.status,
    m.transaction_hash,
    m.created_at,
    m.updated_at
FROM milestones m
    JOIN jobs j ON m.job_id = j.id
WHERE j.creator_id = wallet_addr
ORDER BY m.created_at DESC;
$$;
-- Create a trigger to update 'updated_at' timestamps
CREATE OR REPLACE FUNCTION update_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER update_profiles_updated_at BEFORE
UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_jobs_updated_at BEFORE
UPDATE ON jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_milestones_updated_at BEFORE
UPDATE ON milestones FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_proposals_updated_at BEFORE
UPDATE ON proposals FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_transactions_updated_at BEFORE
UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at();