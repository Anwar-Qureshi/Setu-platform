-- ==========================================
-- PROJECT SETU: SUPABASE DATABASE SCHEMA
-- ==========================================
-- Instructions: Copy this entirely and paste it into the Supabase SQL Editor, then click "Run".

-- 1. Create the Colleges Table (Stores information about each institute)
CREATE TABLE IF NOT EXISTS colleges (
    inst_code VARCHAR(10) PRIMARY KEY,
    institute_name VARCHAR(255),
    place VARCHAR(100),
    dist_name VARCHAR(100),
    region VARCHAR(50),
    college_type VARCHAR(50),
    minority VARCHAR(50),
    co_educ VARCHAR(50),
    affil_to VARCHAR(100),
    updated_fee_2026 NUMERIC
);

-- 2. Create the Cutoffs Table (Stores historical ranks for all streams and branches)
CREATE TABLE IF NOT EXISTS cutoffs (
    id SERIAL PRIMARY KEY,
    stream VARCHAR(10), -- 'MPC' or 'BiPC'
    inst_code VARCHAR(10),
    institute_name VARCHAR(255),
    place VARCHAR(100),
    dist VARCHAR(100),
    coed VARCHAR(50),
    type VARCHAR(50),
    year_of_estb VARCHAR(20),
    branch VARCHAR(20),
    branch_name VARCHAR(255),
    
    -- Category Ranks (stored as VARCHAR to handle anomalies like "1234_1" or "N/A" during ingestion. Can be casted to integer during queries later.)
    oc_boys VARCHAR(50),
    oc_girls VARCHAR(50),
    bc_a_boys VARCHAR(50),
    bc_a_girls VARCHAR(50),
    bc_b_boys VARCHAR(50),
    bc_b_girls VARCHAR(50),
    bc_c_boys VARCHAR(50),
    bc_c_girls VARCHAR(50),
    bc_d_boys VARCHAR(50),
    bc_d_girls VARCHAR(50),
    bc_e_boys VARCHAR(50),
    bc_e_girls VARCHAR(50),
    sc_boys VARCHAR(50),
    sc_girls VARCHAR(50),
    st_boys VARCHAR(50),
    st_girls VARCHAR(50),
    ews_gen_ou VARCHAR(50),
    ews_girls_ou VARCHAR(50),
    
    tuition_fee VARCHAR(50),
    affiliated VARCHAR(100),
    
    academic_year VARCHAR(10), -- e.g. '2023', '2024'
    phase VARCHAR(50) -- e.g. 'FirstPhase', 'FinalPhase'
);

-- 3. Add Indexes for faster AI queries
CREATE INDEX idx_cutoffs_inst_code ON cutoffs(inst_code);
CREATE INDEX idx_cutoffs_branch ON cutoffs(branch);
CREATE INDEX idx_cutoffs_year ON cutoffs(academic_year);
CREATE INDEX idx_cutoffs_stream ON cutoffs(stream);

-- Enable Row Level Security (RLS) but allow anonymous read access (since it's public info)
ALTER TABLE colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE cutoffs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to colleges" ON colleges FOR SELECT USING (true);
CREATE POLICY "Allow public read access to cutoffs" ON cutoffs FOR SELECT USING (true);

-- Allow authenticated (or anon if you don't restrict inserts yet) to insert/update during data engineering:
-- For security, if you only upload via the Service Key or Anon Key locally, we'll just allow all for now. 
-- You can tighten this later.
CREATE POLICY "Allow public all access to colleges" ON colleges FOR ALL USING (true);
CREATE POLICY "Allow public all access to cutoffs" ON cutoffs FOR ALL USING (true);
