CREATE TABLE contract_reports (
    report_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id),
    title TEXT NOT NULL,
    start_date DATE,
    end_date DATE,
    report_content JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);