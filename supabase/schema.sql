-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  email TEXT NOT NULL,
  report_data JSONB NOT NULL,
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  accessed_at TIMESTAMPTZ,
  access_count INT DEFAULT 0
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_reports_email ON reports(email);
CREATE INDEX IF NOT EXISTS idx_reports_created ON reports(created_at);

-- Enable Row Level Security
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read reports by ID (for sharing)
CREATE POLICY "Reports are viewable by anyone with the link" ON reports
  FOR SELECT USING (true);

-- Create policy to allow insert from authenticated or anon users
CREATE POLICY "Anyone can create reports" ON reports
  FOR INSERT WITH CHECK (true);

-- Create policy to allow updates (for tracking access)
CREATE POLICY "Anyone can update report access tracking" ON reports
  FOR UPDATE USING (true);