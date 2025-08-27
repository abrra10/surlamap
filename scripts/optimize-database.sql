-- Database Optimization Script for Surlamap
-- Run this in your Supabase SQL Editor for better performance

-- 1. Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_events_status_date ON events(status, date);
CREATE INDEX IF NOT EXISTS idx_events_organizer_id ON events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
CREATE INDEX IF NOT EXISTS idx_events_location ON events(location);

-- 2. Create indexes for registrations table
CREATE INDEX IF NOT EXISTS idx_registrations_event_id ON registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_user_id ON registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON registrations(status);
CREATE INDEX IF NOT EXISTS idx_registrations_created_at ON registrations(created_at);

-- 3. Create indexes for profiles table
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_full_name ON profiles(full_name);

-- 4. Create indexes for announcements table
CREATE INDEX IF NOT EXISTS idx_announcements_event_id ON announcements(event_id);
CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON announcements(created_at);

-- 5. Create composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_events_status_date_organizer ON events(status, date, organizer_id);
CREATE INDEX IF NOT EXISTS idx_registrations_event_status ON registrations(event_id, status);

-- 6. Create partial indexes for active events
CREATE INDEX IF NOT EXISTS idx_events_active ON events(date) WHERE status = 'published' AND date >= CURRENT_DATE;

-- 7. Create indexes for text search (if using full-text search)
CREATE INDEX IF NOT EXISTS idx_events_name_search ON events USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_events_description_search ON events USING gin(to_tsvector('english', description));

-- 8. Optimize table statistics
ANALYZE events;
ANALYZE registrations;
ANALYZE profiles;
ANALYZE announcements;

-- 9. Create materialized view for event statistics (optional, for heavy analytics)
CREATE MATERIALIZED VIEW IF NOT EXISTS event_stats AS
SELECT 
    e.id as event_id,
    e.name,
    e.date,
    e.status,
    COUNT(r.id) as total_registrations,
    COUNT(CASE WHEN r.status = 'confirmed' THEN 1 END) as confirmed_registrations,
    COUNT(CASE WHEN r.status = 'pending' THEN 1 END) as pending_registrations
FROM events e
LEFT JOIN registrations r ON e.id = r.event_id
GROUP BY e.id, e.name, e.date, e.status;

-- 10. Create index on materialized view
CREATE INDEX IF NOT EXISTS idx_event_stats_date ON event_stats(date);
CREATE INDEX IF NOT EXISTS idx_event_stats_status ON event_stats(status);

-- 11. Refresh materialized view
REFRESH MATERIALIZED VIEW event_stats;

-- 12. Set up automatic refresh for materialized view (optional)
-- This requires a cron job or scheduled function
-- CREATE OR REPLACE FUNCTION refresh_event_stats()
-- RETURNS void AS $$
-- BEGIN
--     REFRESH MATERIALIZED VIEW event_stats;
-- END;
-- $$ LANGUAGE plpgsql;

-- 13. Optimize storage settings
ALTER TABLE events SET (fillfactor = 90);
ALTER TABLE registrations SET (fillfactor = 90);
ALTER TABLE profiles SET (fillfactor = 90);

-- 14. Create function for getting events with registration counts
CREATE OR REPLACE FUNCTION get_events_with_registration_counts(
    p_status text DEFAULT 'published',
    p_limit integer DEFAULT 100
)
RETURNS TABLE (
    id uuid,
    name text,
    date timestamp with time zone,
    location text,
    status text,
    category text,
    price numeric,
    image_url text,
    seats integer,
    description text,
    event_type text,
    meeting_link text,
    organizer_id uuid,
    registration_count bigint
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.id,
        e.name,
        e.date,
        e.location,
        e.status,
        e.category,
        e.price,
        e.image_url,
        e.seats,
        e.description,
        e.event_type,
        e.meeting_link,
        e.organizer_id,
        COUNT(r.id) as registration_count
    FROM events e
    LEFT JOIN registrations r ON e.id = r.event_id AND r.status = 'confirmed'
    WHERE e.status = p_status
    AND e.date >= CURRENT_DATE
    GROUP BY e.id, e.name, e.date, e.location, e.status, e.category, 
             e.price, e.image_url, e.seats, e.description, e.event_type, 
             e.meeting_link, e.organizer_id
    ORDER BY e.date ASC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- 15. Create function for getting user profile with role
CREATE OR REPLACE FUNCTION get_user_profile_with_role(p_user_id uuid)
RETURNS TABLE (
    id uuid,
    email text,
    full_name text,
    phone_number text,
    address text,
    role text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.email,
        p.full_name,
        p.phone_number,
        p.address,
        p.role,
        p.created_at,
        p.updated_at
    FROM profiles p
    WHERE p.id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- 16. Set up row level security (RLS) policies if not already set
-- Enable RLS on tables
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 17. Create policies for events table
CREATE POLICY "Events are viewable by everyone" ON events
    FOR SELECT USING (status = 'published');

CREATE POLICY "Users can create events" ON events
    FOR INSERT WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Organizers can update their events" ON events
    FOR UPDATE USING (auth.uid() = organizer_id);

CREATE POLICY "Organizers can delete their events" ON events
    FOR DELETE USING (auth.uid() = organizer_id);

-- 18. Create policies for registrations table
CREATE POLICY "Users can view their own registrations" ON registrations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create registrations" ON registrations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own registrations" ON registrations
    FOR UPDATE USING (auth.uid() = user_id);

-- 19. Create policies for profiles table
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- 20. Final optimization - vacuum and analyze
VACUUM ANALYZE events;
VACUUM ANALYZE registrations;
VACUUM ANALYZE profiles;
VACUUM ANALYZE announcements;

-- Success message
SELECT 'Database optimization completed successfully!' as status;
