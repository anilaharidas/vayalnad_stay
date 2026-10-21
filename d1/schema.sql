-- Guest feedback / reviews (Cloudflare D1)
CREATE TABLE IF NOT EXISTS feedback (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL,
  rating     INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment    TEXT NOT NULL,
  status     TEXT NOT NULL DEFAULT 'pending',  -- pending | approved | rejected
  ip_hash    TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback(status, created_at);
CREATE INDEX IF NOT EXISTS idx_feedback_ip ON feedback(ip_hash, created_at);
