-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  user_name TEXT NOT NULL,
  user_phone TEXT NOT NULL,
  pickup_location JSONB NOT NULL,
  drop_location JSONB NOT NULL,
  taxi_tier TEXT NOT NULL,
  distance NUMERIC(10, 2) NOT NULL,
  fare NUMERIC(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'assigned',
  taxi_id TEXT,
  eta INTEGER,
  timestamp BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS bookings_timestamp_idx ON bookings (timestamp DESC);
CREATE INDEX IF NOT EXISTS bookings_user_phone_idx ON bookings (user_phone);

-- Enable Row Level Security
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Allow public insert
CREATE POLICY "Allow insert bookings" ON bookings
  FOR INSERT WITH CHECK (true);

-- Allow public read
CREATE POLICY "Allow read bookings" ON bookings
  FOR SELECT USING (true);

-- Allow public update
CREATE POLICY "Allow update status" ON bookings
  FOR UPDATE USING (true);
