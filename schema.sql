-- Paste and run this script in your Supabase SQL Editor

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Events Table
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  description TEXT,
  venue TEXT,
  date TEXT,
  time TEXT,
  location TEXT,
  expectations TEXT[],
  image_url TEXT
);

-- 2. Ticket Types Table
CREATE TABLE IF NOT EXISTS ticket_types (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price numeric(10,2) NOT NULL
);

-- 3. Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  event_id UUID REFERENCES events(id),
  payment_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  user_phone TEXT NOT NULL,
  ticket_type TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  qr_codes TEXT[] NOT NULL
);

-- 4. Scanned Tickets Table
CREATE TABLE IF NOT EXISTS scanned_tickets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  scanned_at TIMESTAMPTZ DEFAULT NOW(),
  qr_code TEXT UNIQUE NOT NULL,
  event_id UUID REFERENCES events(id)
);

-- RLS Policies
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE scanned_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_types ENABLE ROW LEVEL SECURITY;

-- Note: Proper RLS should scope this to authenticated Admin/Organizers in a real launch
CREATE POLICY "Allow public reads for events" ON events FOR SELECT USING (true);
CREATE POLICY "Allow public reads for ticket_types" ON ticket_types FOR SELECT USING (true);
CREATE POLICY "Allow public reads for bookings" ON bookings FOR SELECT USING (true);
CREATE POLICY "Allow public inserts for bookings" ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public reads for scanned tickets" ON scanned_tickets FOR SELECT USING (true);
CREATE POLICY "Allow public inserts for scanned tickets" ON scanned_tickets FOR INSERT WITH CHECK (true);


-- ====================
-- SEED DATA
-- ====================

INSERT INTO events (id, name, description, venue, date, time)
VALUES (
  '11111111-1111-1111-1111-111111111111', 
  'INDOOR PICNIC | Women only', 
  'A summer afternoon without the sunburn - just good vibes, cozy corners, and even better company.', 
  'IKEA Picnic Space, Hyderabad', 
  '17 Apr, Friday', 
  '04:00 PM'
) ON CONFLICT DO NOTHING;

INSERT INTO ticket_types (event_id, name, description, price)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Early Bird', 'Limited spots available at this price.', 299),
  ('11111111-1111-1111-1111-111111111111', 'Regular Ticket', 'Standard entry with all inclusions.', 399);

-- Create the generic coupons table
CREATE TABLE public.coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  offer_type TEXT NOT NULL CHECK (offer_type IN ('percent', 'amount')),
  off_value NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Ensure coupon codes are uniquely keyed to specific events so there's no overlap
CREATE UNIQUE INDEX unique_event_coupon ON public.coupons (name, event_id);

-- Optional: Enable Row Level Security (RLS) policies 
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to 'Select' from coupons to check if they are valid
CREATE POLICY "Coupons are viewable by everyone." 
  ON public.coupons FOR SELECT 
  USING (true);
