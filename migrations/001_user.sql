CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    google_id TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    name TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);