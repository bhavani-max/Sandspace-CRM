-- V1__initial_schema.sql
-- CRM System Initial Database Schema

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- USERS TABLE
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'LEADER', 'MEMBER')),
    team_id UUID,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    is_active BOOLEAN DEFAULT true
);

-- TEAMS TABLE
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    leader_id UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- Add FK from users to teams
ALTER TABLE users ADD CONSTRAINT fk_users_team FOREIGN KEY (team_id) REFERENCES teams(id);

-- ASSIGNMENTS TABLE
CREATE TABLE assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    file_path VARCHAR(500),
    due_date DATE NOT NULL,
    team_id UUID REFERENCES teams(id),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- TASK ASSIGNMENTS TABLE
CREATE TABLE task_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES assignments(id),
    member_id UUID NOT NULL REFERENCES users(id),
    assigned_by UUID NOT NULL REFERENCES users(id),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'DONE', 'OVERDUE')),
    assigned_at TIMESTAMP DEFAULT now(),
    completed_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT now()
);

-- EOD REPORTS TABLE
CREATE TABLE eod_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES users(id),
    report_date DATE NOT NULL,
    summary TEXT NOT NULL,
    blockers TEXT,
    file_path VARCHAR(500),
    submitted_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    UNIQUE (member_id, report_date)
);

-- TOKENS TABLE (support tokens)
CREATE TABLE tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    raised_by UUID NOT NULL REFERENCES users(id),
    team_id UUID NOT NULL REFERENCES teams(id),
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(10) NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH')),
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_REVIEW', 'RESOLVED')),
    created_at TIMESTAMP DEFAULT now(),
    resolved_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT now()
);

-- TOKEN COMMENTS TABLE
CREATE TABLE token_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_id UUID NOT NULL REFERENCES tokens(id),
    author_id UUID NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT now()
);

-- WORKSPACES TABLE
CREATE TABLE workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID REFERENCES assignments(id),
    created_by UUID NOT NULL REFERENCES users(id),
    name VARCHAR(200) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- WORKSPACE MEMBERS TABLE
CREATE TABLE workspace_members (
    workspace_id UUID NOT NULL REFERENCES workspaces(id),
    user_id UUID NOT NULL REFERENCES users(id),
    joined_at TIMESTAMP DEFAULT now(),
    PRIMARY KEY (workspace_id, user_id)
);

-- WORKSPACE DOCS TABLE
CREATE TABLE workspace_docs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id),
    uploaded_by UUID NOT NULL REFERENCES users(id),
    file_path VARCHAR(500) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT now()
);

-- MESSAGES TABLE
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id),
    sender_id UUID NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT now()
);

-- INDEXES
CREATE INDEX idx_users_team_id ON users(team_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_assignments_team_id ON assignments(team_id);
CREATE INDEX idx_task_assignments_member_id ON task_assignments(member_id);
CREATE INDEX idx_task_assignments_assignment_id ON task_assignments(assignment_id);
CREATE INDEX idx_task_assignments_status ON task_assignments(status);
CREATE INDEX idx_eod_reports_member_id ON eod_reports(member_id);
CREATE INDEX idx_eod_reports_report_date ON eod_reports(report_date);
CREATE INDEX idx_tokens_team_id ON tokens(team_id);
CREATE INDEX idx_tokens_status ON tokens(status);
CREATE INDEX idx_tokens_raised_by ON tokens(raised_by);
CREATE INDEX idx_messages_workspace_id ON messages(workspace_id);

-- Seed Admin User (password: Admin@123)
INSERT INTO users (name, email, password_hash, role, is_active)
VALUES ('System Admin', 'admin@crm.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBpwTTyU3eQp5e', 'ADMIN', true);
