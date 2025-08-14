-- Database Optimization Script for Surlamap
-- This script creates indexes and optimizations to improve query performance

-- 1. Events table indexes
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_events_organizer_id ON events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
CREATE INDEX IF NOT EXISTS idx_events_status_date ON events(status, date);
CREATE INDEX IF NOT EXISTS idx_events_organizer_status ON events(organizer_id, status);
CREATE INDEX IF NOT EXISTS idx_events_category_status ON events(category, status);

-- 2. Registrations table indexes
CREATE INDEX IF NOT EXISTS idx_registrations_event_id ON registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_attendee_id ON registrations(attendee_id);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON registrations(status);
CREATE INDEX IF NOT EXISTS idx_registrations_event_status ON registrations(event_id, status);
CREATE INDEX IF NOT EXISTS idx_registrations_attendee_status ON registrations(attendee_id, status);
CREATE INDEX IF NOT EXISTS idx_registrations_created_at ON registrations(created_at);

-- 3. Profiles table indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- 4. Announcements table indexes
CREATE INDEX IF NOT EXISTS idx_announcements_event_id ON announcements(event_id);
CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON announcements(created_at);
CREATE INDEX IF NOT EXISTS idx_announcements_organizer_id ON announcements(organizer_id);

-- 5. Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_events_published_upcoming ON events(status, date) 
WHERE status = 'published' AND date >= CURRENT_DATE;

CREATE INDEX IF NOT EXISTS idx_registrations_confirmed_events ON registrations(event_id, status, created_at) 
WHERE status = 'confirmed';

-- 6. Full-text search indexes for better search performance
CREATE INDEX IF NOT EXISTS idx_events_search ON events USING gin(to_tsvector('english', name || ' ' || location || ' ' || category));

-- 7. Partial indexes for active data
CREATE INDEX IF NOT EXISTS idx_events_active ON events(id, name, date, location, category, price, image_url, seats) 
WHERE status = 'published' AND date >= CURRENT_DATE;

-- 8. Indexes for dashboard statistics
CREATE INDEX IF NOT EXISTS idx_registrations_stats ON registrations(event_id, status, created_at) 
WHERE status = 'confirmed';

-- 9. Optimize table statistics (run periodically)
ANALYZE events;
ANALYZE registrations;
ANALYZE profiles;
ANALYZE announcements;

-- 10. Create materialized view for frequently accessed dashboard stats
CREATE MATERIALIZED VIEW IF NOT EXISTS event_registration_stats AS
SELECT 
    e.id as event_id,
    e.name as event_name,
    e.organizer_id,
    e.date,
    e.status,
    e.seats,
    COUNT(r.id) as registration_count,
    CASE 
        WHEN e.seats > 0 THEN (COUNT(r.id)::float / e.seats::float) * 100
        ELSE 0 
    END as attendance_rate
FROM events e
LEFT JOIN registrations r ON e.id = r.event_id AND r.status = 'confirmed'
GROUP BY e.id, e.name, e.organizer_id, e.date, e.status, e.seats;

-- Create index on materialized view
CREATE INDEX IF NOT EXISTS idx_event_stats_organizer ON event_registration_stats(organizer_id);
CREATE INDEX IF NOT EXISTS idx_event_stats_date ON event_registration_stats(date);
CREATE INDEX IF NOT EXISTS idx_event_stats_status ON event_registration_stats(status);

-- 11. Function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_event_stats()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY event_registration_stats;
END;
$$ LANGUAGE plpgsql;

-- 12. Create trigger to refresh materialized view when data changes
CREATE OR REPLACE FUNCTION trigger_refresh_event_stats()
RETURNS trigger AS $$
BEGIN
    -- Use pg_notify to trigger refresh (can be handled by application)
    PERFORM pg_notify('refresh_event_stats', '');
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers for events and registrations tables
DROP TRIGGER IF EXISTS trigger_events_refresh_stats ON events;
CREATE TRIGGER trigger_events_refresh_stats
    AFTER INSERT OR UPDATE OR DELETE ON events
    FOR EACH ROW EXECUTE FUNCTION trigger_refresh_event_stats();

DROP TRIGGER IF EXISTS trigger_registrations_refresh_stats ON registrations;
CREATE TRIGGER trigger_registrations_refresh_stats
    AFTER INSERT OR UPDATE OR DELETE ON registrations
    FOR EACH ROW EXECUTE FUNCTION trigger_refresh_event_stats();

-- 13. Optimize PostgreSQL settings for better performance
-- Note: These should be set in postgresql.conf, but we can set them for the session
SET work_mem = '256MB';
SET shared_buffers = '256MB';
SET effective_cache_size = '1GB';
SET random_page_cost = 1.1;
SET effective_io_concurrency = 200;

-- 14. Create function to get optimized event data with registration counts
CREATE OR REPLACE FUNCTION get_events_with_registration_counts(
    p_status text DEFAULT NULL,
    p_organizer_id uuid DEFAULT NULL,
    p_category text DEFAULT NULL,
    p_date_from date DEFAULT NULL,
    p_date_to date DEFAULT NULL,
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
    organizer_id uuid,
    description text,
    event_type text,
    meeting_link text,
    registration_deadline timestamp with time zone,
    tags text[],
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    registration_count bigint
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.*,
        COALESCE(r.registration_count, 0) as registration_count
    FROM events e
    LEFT JOIN (
        SELECT 
            event_id,
            COUNT(*) as registration_count
        FROM registrations 
        WHERE status = 'confirmed'
        GROUP BY event_id
    ) r ON e.id = r.event_id
    WHERE (p_status IS NULL OR e.status = p_status)
        AND (p_organizer_id IS NULL OR e.organizer_id = p_organizer_id)
        AND (p_category IS NULL OR e.category = p_category)
        AND (p_date_from IS NULL OR e.date >= p_date_from)
        AND (p_date_to IS NULL OR e.date <= p_date_to)
    ORDER BY e.date ASC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- 15. Create function to get organizer dashboard stats efficiently
CREATE OR REPLACE FUNCTION get_organizer_dashboard_stats(p_organizer_id uuid)
RETURNS TABLE (
    total_events bigint,
    total_registrations bigint,
    average_attendance_rate numeric,
    active_events bigint
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(DISTINCT e.id) as total_events,
        COALESCE(SUM(r.registration_count), 0) as total_registrations,
        CASE 
            WHEN COUNT(CASE WHEN e.seats > 0 THEN 1 END) > 0 
            THEN AVG(CASE WHEN e.seats > 0 THEN (r.registration_count::float / e.seats::float) * 100 ELSE 0 END)
            ELSE 0 
        END as average_attendance_rate,
        COUNT(CASE WHEN e.status = 'published' AND e.date >= CURRENT_DATE THEN 1 END) as active_events
    FROM events e
    LEFT JOIN (
        SELECT 
            event_id,
            COUNT(*) as registration_count
        FROM registrations 
        WHERE status = 'confirmed'
        GROUP BY event_id
    ) r ON e.id = r.event_id
    WHERE e.organizer_id = p_organizer_id;
END;
$$ LANGUAGE plpgsql;

-- 16. Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_events_with_registration_counts TO authenticated;
GRANT EXECUTE ON FUNCTION get_organizer_dashboard_stats TO authenticated;
GRANT SELECT ON event_registration_stats TO authenticated;

-- 17. Create indexes for better join performance
CREATE INDEX IF NOT EXISTS idx_events_organizer_date ON events(organizer_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_registrations_event_attendee ON registrations(event_id, attendee_id);

-- 18. Optimize for common dashboard queries
CREATE INDEX IF NOT EXISTS idx_events_dashboard ON events(organizer_id, status, date DESC) 
INCLUDE (name, location, category, price, image_url, seats);

-- 19. Create index for user registrations with events
CREATE INDEX IF NOT EXISTS idx_registrations_user_events ON registrations(attendee_id, status, created_at DESC) 
INCLUDE (event_id);

-- 20. Final optimization - vacuum and analyze
VACUUM ANALYZE events;
VACUUM ANALYZE registrations;
VACUUM ANALYZE profiles;
VACUUM ANALYZE announcements; 