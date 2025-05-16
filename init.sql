-- Create a table to track devices (DevEUI) and their creation time
CREATE TABLE IF NOT EXISTS devices (
    deveui VARCHAR(32) PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Template for the weekly "hot" table that will be cloned for each device
CREATE TABLE IF NOT EXISTS data_template_weekly (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL,
    fport INTEGER NOT NULL,
    data JSONB
);

-- Index on fport and timestamp for efficient querying on recent data
CREATE INDEX IF NOT EXISTS idx_data_template_weekly_fport_ts ON data_template_weekly (fport, timestamp);

-- Partitioned historical root table (by RANGE of timestamp)
CREATE TABLE IF NOT EXISTS data_template_historical (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL,
    fport INTEGER NOT NULL,
    data JSONB
) PARTITION BY RANGE (timestamp);

-- Example monthly partitions (can be generated dynamically later)
CREATE TABLE IF NOT EXISTS data_template_historical_2025_01 PARTITION OF data_template_historical
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE TABLE IF NOT EXISTS data_template_historical_2025_02 PARTITION OF data_template_historical
    FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');

-- Indexes on partitions
CREATE INDEX IF NOT EXISTS idx_data_hist_2025_01_ts_fport ON data_template_historical_2025_01 (timestamp, fport);
CREATE INDEX IF NOT EXISTS idx_data_hist_2025_02_ts_fport ON data_template_historical_2025_02 (timestamp, fport);
