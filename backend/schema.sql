-- Supabase Schema for ServiceIQ Pro

-- 1. Workers Table
CREATE TABLE workers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  cnic TEXT,
  phone TEXT,
  skill TEXT NOT NULL,
  coverage_radius DECIMAL,
  rating DECIMAL DEFAULT 5.0,
  distance DECIMAL DEFAULT 2.5,
  is_available BOOLEAN DEFAULT true,
  wallet_balance DECIMAL DEFAULT 500,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Customers Table
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT,
  warning_strikes INTEGER DEFAULT 0,
  is_banned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Jobs Table
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_name TEXT NOT NULL,
  worker_id UUID REFERENCES workers(id) ON DELETE SET NULL,
  service_type TEXT NOT NULL,
  description TEXT,
  location TEXT,
  status TEXT DEFAULT 'pending',
  price DECIMAL DEFAULT 500,
  commission_deducted DECIMAL DEFAULT 0,
  worker_arrived BOOLEAN DEFAULT false,
  cancelled_by TEXT,
  ai_reasoning TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- 4. AI Decision Logs Table
CREATE TABLE ai_decision_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  worker_id UUID REFERENCES workers(id) ON DELETE CASCADE,
  reasoning TEXT,
  score DECIMAL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Wallet Transactions Table
CREATE TABLE wallet_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id UUID REFERENCES workers(id) ON DELETE CASCADE,
  amount DECIMAL NOT NULL,
  type TEXT NOT NULL, -- e.g., 'topup', 'commission'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE workers;
ALTER PUBLICATION supabase_realtime ADD TABLE customers;
ALTER PUBLICATION supabase_realtime ADD TABLE jobs;
ALTER PUBLICATION supabase_realtime ADD TABLE ai_decision_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE wallet_transactions;

-- Note for Hackathon: Row Level Security (RLS) is disabled below for rapid prototyping.
-- In a production app, enable RLS and add proper policies.
ALTER TABLE workers DISABLE ROW LEVEL SECURITY;
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE jobs DISABLE ROW LEVEL SECURITY;
ALTER TABLE ai_decision_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions DISABLE ROW LEVEL SECURITY;
