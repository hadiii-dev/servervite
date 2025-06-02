-- Add indexes for better job query performance
-- Run these after deployment

-- Index for faster lookups by external ID (used in sync)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_jobs_external_id ON jobs(external_id);

-- Index for faster job listing queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_jobs_created_at ON jobs(created_at DESC);

-- Index for filtering by category
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_jobs_category ON jobs(category);

-- Index for remote job filtering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_jobs_is_remote ON jobs(is_remote);

-- Index for location-based queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_jobs_location ON jobs(location);