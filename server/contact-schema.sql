CREATE TABLE IF NOT EXISTS contact_requests (
  id TEXT PRIMARY KEY,
  fingerprint TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK(status IN ('pending', 'accepted', 'uncertain')),
  created INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS contact_requests_created ON contact_requests(created);
CREATE TABLE IF NOT EXISTS contact_limits (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL,
  expires INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS contact_limits_expires ON contact_limits(expires);
