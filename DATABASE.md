# SkyRide Bookings Database Setup Guide

## Overview
This guide explains how to set up the Supabase database schema for storing booking data and how the app saves and retrieves bookings.

## Database Schema

### Bookings Table
The `bookings` table stores all flight taxi booking information with the following fields:

| Column | Type | Description |
|--------|------|-------------|
| `id` | TEXT | Primary key - Booking ID (format: BK{timestamp}) |
| `user_name` | TEXT | Passenger name |
| `user_phone` | TEXT | Passenger phone number |
| `pickup_location` | JSONB | JSON object with `lat`, `lng`, and optional `address` |
| `drop_location` | JSONB | JSON object with `lat`, `lng`, and optional `address` |
| `taxi_tier` | TEXT | Tier selected ('economy', 'standard', or 'premium') |
| `distance` | DECIMAL | Distance in kilometers |
| `fare` | DECIMAL | Calculated fare amount |
| `status` | TEXT | Booking status ('pending', 'assigned', 'in-progress', 'completed', 'cancelled') |
| `taxi_id` | TEXT | Generated taxi identifier |
| `eta` | INTEGER | Estimated arrival time in minutes |
| `timestamp` | BIGINT | Unix timestamp of booking creation |
| `created_at` | TIMESTAMP | Server-side creation timestamp |

## Setup Instructions

### Step 1: Create the Database Table

1. Go to your Supabase Dashboard
2. Navigate to the **SQL Editor**
3. Create a new query and run the following SQL:

```sql
CREATE TABLE bookings (
  id TEXT PRIMARY KEY,
  user_name TEXT NOT NULL,
  user_phone TEXT NOT NULL,
  pickup_location JSONB NOT NULL,
  drop_location JSONB NOT NULL,
  taxi_tier TEXT NOT NULL,
  distance DECIMAL(10, 2) NOT NULL,
  fare DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'assigned',
  taxi_id TEXT,
  eta INTEGER,
  timestamp BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create indexes for faster queries
CREATE INDEX bookings_timestamp_idx ON bookings (timestamp DESC);
CREATE INDEX bookings_user_phone_idx ON bookings (user_phone);
```

### Step 2: Enable Row Level Security (Optional but Recommended)

```sql
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert bookings
CREATE POLICY "Allow insert bookings" ON bookings
  FOR INSERT WITH CHECK (true);

-- Allow anyone to read bookings
CREATE POLICY "Allow read bookings" ON bookings
  FOR SELECT USING (true);

-- Allow updates to booking status
CREATE POLICY "Allow update status" ON bookings
  FOR UPDATE USING (true);
```

### Step 3: Update Supabase Types (Auto-generated)

After creating the table, go to your Supabase dashboard and use the CLI to generate types:

```bash
npm install -g supabase
supabase gen types typescript --project-id YOUR_PROJECT_ID > src/integrations/supabase/types.ts
```

Or manually update the types file to include the bookings table schema.

## How It Works

### Saving a Booking

When a user clicks the **Confirm** button:

1. **Frontend** (`src/pages/Index.tsx`):
   - Collects booking data (locations, tier, user info)
   - Creates a `Booking` object with calculated fare and distance
   - Calls `saveBooking()` from the database service

2. **Database Service** (`src/integrations/supabase/bookings.ts`):
   - Transforms the frontend `Booking` object to database format
   - Sends INSERT query to Supabase
   - Returns success/error status

3. **Storage**:
   - Data is stored in **Supabase** (primary)
   - Data is also backed up in **localStorage** (fallback)

### Retrieving Bookings

When a user navigates to the **History** page:

1. **Frontend** (`src/pages/History.tsx`):
   - Calls `fetchAllBookings()` to load bookings from database
   - If database fails, falls back to localStorage
   - Displays bookings sorted by most recent first

2. **Database Service** (`src/integrations/supabase/bookings.ts`):
   - Queries the database for all bookings
   - Transforms database records to frontend `Booking` objects
   - Returns bookings array or error

## File Structure

```
src/
├── integrations/supabase/
│   ├── client.ts           # Supabase client initialization
│   ├── bookings.ts         # NEW: Database operations
│   └── types.ts            # Database type definitions
├── pages/
│   ├── Index.tsx           # UPDATED: Now saves to database
│   └── History.tsx         # UPDATED: Now fetches from database
└── types/
    └── booking.ts          # Booking type definitions
```

## API Functions

### `saveBooking(booking: Booking)`
Saves a new booking to the database.

**Parameters:**
- `booking`: Booking object with all details

**Returns:**
- `{ success: true }` on success
- `{ success: false, error: string }` on failure

**Usage:**
```typescript
const { success, error } = await saveBooking(booking);
if (!success) {
  console.error('Failed to save:', error);
}
```

### `fetchAllBookings(limit: number)`
Fetches recent bookings from the database.

**Parameters:**
- `limit`: Maximum number of bookings to fetch (default: 50)

**Returns:**
- `{ bookings: Booking[] }` on success
- `{ bookings: [], error: string }` on failure

**Usage:**
```typescript
const { bookings, error } = await fetchAllBookings(10);
```

### `fetchUserBookings(userPhone: string)`
Fetches all bookings for a specific user by phone number.

**Parameters:**
- `userPhone`: User's phone number

**Returns:**
- `{ bookings: Booking[] }` on success
- `{ bookings: [], error: string }` on failure

**Usage:**
```typescript
const { bookings } = await fetchUserBookings(userPhone);
```

### `updateBookingStatus(bookingId: string, status: string)`
Updates the status of an existing booking.

**Parameters:**
- `bookingId`: Booking ID
- `status`: New status ('pending', 'assigned', 'in-progress', 'completed', 'cancelled')

**Returns:**
- `{ success: true }` on success
- `{ success: false, error: string }` on failure

## Error Handling

The app implements graceful fallback:

1. **Database Save Fails**: Booking is still saved to localStorage, user gets a warning toast
2. **Database Fetch Fails**: App automatically falls back to localStorage bookings
3. **Network Issues**: LocalStorage provides offline capability

## Environment Variables

Ensure these are set in your `.env` file:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
```

## Testing

1. **Create a Booking**: 
   - Fill in pickup/destination
   - Select tier
   - Enter user name and phone
   - Click Confirm

2. **Verify in Database**:
   - Go to Supabase Dashboard
   - Check the `bookings` table for your entry

3. **View History**:
   - Click History button
   - Your booking should appear in the list

## Troubleshooting

### Bookings not saving to database
- Check network connection
- Verify Supabase credentials in `.env`
- Check browser console for error messages
- Confirm the `bookings` table exists in Supabase

### History page shows old data
- Clear localStorage: Open DevTools > Application > Storage > localStorage
- Refresh the page
- Check Supabase for actual records

### Supabase connection errors
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`
- Check Supabase project status
- Ensure RLS policies allow public access (or configure auth)

## Next Steps

1. Add user authentication (optional)
2. Implement real-time booking updates with Supabase subscriptions
3. Add analytics/reporting on booking data
4. Set up automated status updates for real-time tracking
