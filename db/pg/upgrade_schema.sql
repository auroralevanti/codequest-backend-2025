-- upgrade_schema.sql
-- Safe, idempotent helper script to improve the provided schema for PostgreSQL.
-- Review before running. Back up your DB first.

BEGIN;

-- 1) Enable pgcrypto for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2) Set sensible defaults for UUID primary keys and timestamps
-- NOTE: adjust table/column names if you rename tables to snake_case.
ALTER TABLE IF EXISTS "users"
  ALTER COLUMN id SET DEFAULT gen_random_uuid(),
  ALTER COLUMN created_at SET DEFAULT now(),
  ALTER COLUMN updated_at SET DEFAULT now();

ALTER TABLE IF EXISTS "roles"
  ALTER COLUMN id SET DEFAULT gen_random_uuid(),
  ALTER COLUMN created_at SET DEFAULT now(),
  ALTER COLUMN updated_at SET DEFAULT now();

ALTER TABLE IF EXISTS "user_roles"
  ALTER COLUMN id SET DEFAULT gen_random_uuid(),
  ALTER COLUMN created_at SET DEFAULT now();

ALTER TABLE IF EXISTS "oauth_accounts"
  ALTER COLUMN id SET DEFAULT gen_random_uuid(),
  ALTER COLUMN created_at SET DEFAULT now(),
  ALTER COLUMN updated_at SET DEFAULT now();

ALTER TABLE IF EXISTS "posts"
  ALTER COLUMN id SET DEFAULT gen_random_uuid(),
  ALTER COLUMN created_at SET DEFAULT now(),
  ALTER COLUMN updated_at SET DEFAULT now();

ALTER TABLE IF EXISTS "categories"
  ALTER COLUMN id SET DEFAULT gen_random_uuid(),
  ALTER COLUMN created_at SET DEFAULT now(),
  ALTER COLUMN updated_at SET DEFAULT now();

ALTER TABLE IF EXISTS "post_categories"
  ALTER COLUMN id SET DEFAULT gen_random_uuid(),
  ALTER COLUMN created_at SET DEFAULT now();

ALTER TABLE IF EXISTS "tags"
  ALTER COLUMN id SET DEFAULT gen_random_uuid(),
  ALTER COLUMN created_at SET DEFAULT now(),
  ALTER COLUMN updated_at SET DEFAULT now();

ALTER TABLE IF EXISTS "post_tags"
  ALTER COLUMN id SET DEFAULT gen_random_uuid(),
  ALTER COLUMN created_at SET DEFAULT now();

ALTER TABLE IF EXISTS "comments"
  ALTER COLUMN id SET DEFAULT gen_random_uuid(),
  ALTER COLUMN created_at SET DEFAULT now(),
  ALTER COLUMN updated_at SET DEFAULT now();

ALTER TABLE IF EXISTS "post_likes"
  ALTER COLUMN id SET DEFAULT gen_random_uuid(),
  ALTER COLUMN created_at SET DEFAULT now();

ALTER TABLE IF EXISTS "comment_likes"
  ALTER COLUMN id SET DEFAULT gen_random_uuid(),
  ALTER COLUMN created_at SET DEFAULT now();

ALTER TABLE IF EXISTS "saved_posts"
  ALTER COLUMN id SET DEFAULT gen_random_uuid(),
  ALTER COLUMN created_at SET DEFAULT now();

ALTER TABLE IF EXISTS "post_views"
  ALTER COLUMN id SET DEFAULT gen_random_uuid();

ALTER TABLE IF EXISTS "admin_audit_logs"
  ALTER COLUMN id SET DEFAULT gen_random_uuid(),
  ALTER COLUMN created_at SET DEFAULT now();

-- 3) Trigger to update updated_at automatically
CREATE OR REPLACE FUNCTION public.trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for tables that have updated_at column
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'updated_at') THEN
    EXECUTE 'CREATE TRIGGER set_timestamp_users BEFORE UPDATE ON "users" FOR EACH ROW EXECUTE PROCEDURE public.trigger_set_timestamp();';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'roles' AND column_name = 'updated_at') THEN
    EXECUTE 'CREATE TRIGGER set_timestamp_roles BEFORE UPDATE ON "roles" FOR EACH ROW EXECUTE PROCEDURE public.trigger_set_timestamp();';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'oauth_accounts' AND column_name = 'updated_at') THEN
    EXECUTE 'CREATE TRIGGER set_timestamp_oauth BEFORE UPDATE ON "oauth_accounts" FOR EACH ROW EXECUTE PROCEDURE public.trigger_set_timestamp();';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'updated_at') THEN
    EXECUTE 'CREATE TRIGGER set_timestamp_posts BEFORE UPDATE ON "posts" FOR EACH ROW EXECUTE PROCEDURE public.trigger_set_timestamp();';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'updated_at') THEN
    EXECUTE 'CREATE TRIGGER set_timestamp_categories BEFORE UPDATE ON "categories" FOR EACH ROW EXECUTE PROCEDURE public.trigger_set_timestamp();';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tags' AND column_name = 'updated_at') THEN
    EXECUTE 'CREATE TRIGGER set_timestamp_tags BEFORE UPDATE ON "tags" FOR EACH ROW EXECUTE PROCEDURE public.trigger_set_timestamp();';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comments' AND column_name = 'updated_at') THEN
    EXECUTE 'CREATE TRIGGER set_timestamp_comments BEFORE UPDATE ON "comments" FOR EACH ROW EXECUTE PROCEDURE public.trigger_set_timestamp();';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admin_audit_logs' AND column_name = 'created_at') THEN
    -- AdminAuditLogs uses created_at only; no trigger needed unless you add updated_at
    NULL;
  END IF;
END$$;

-- 4) Indexes and partial unique indexes (soft-delete aware)
-- NOTE: If your schema currently enforces UNIQUE at column level (e.g. email UNIQUE), you will need to
-- drop those constraints before creating the partial unique indexes below. They are named so you can
-- drop them safely if present.

-- Users unique (email, username) for active records
-- Run these only after removing existing UNIQUE constraints on those columns.
-- Example to drop a constraint (replace constraint name if different):
-- ALTER TABLE "users" DROP CONSTRAINT IF EXISTS users_email_key;
-- Then create the partial unique indexes below.
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS uq_users_email_active ON "users" (email) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS uq_users_username_active ON "users" (username) WHERE deleted_at IS NULL;

-- Posts slug unique when not deleted
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS uq_posts_slug_active ON "posts" (slug) WHERE deleted_at IS NULL;

-- Categories and Tags unique
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS uq_categories_slug_active ON "categories" (slug) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS uq_categories_name_active ON "categories" (name) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS uq_tags_slug_active ON "tags" (slug) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS uq_tags_name_active ON "tags" (name) WHERE deleted_at IS NULL;

-- UserRoles unique (keep existing if already created; replace with partial if using soft-delete semantics)
DROP INDEX IF EXISTS uq_user_role;
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS uq_user_role_active ON "user_roles" (user_id, role_id) WHERE deleted_at IS NULL;

-- OAuth unique provider account
DROP INDEX IF EXISTS uq_oauth_provider_account;
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS uq_oauth_provider_account_active ON "oauth_accounts" (provider, provider_account_id) WHERE deleted_at IS NULL;

-- Helpful non-unique indexes for performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_published_recent ON "posts" (published_at DESC) WHERE status = 'published' AND deleted_at IS NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_author_status ON "posts" (author_id, status) WHERE deleted_at IS NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_visibility ON "posts" (visibility) WHERE deleted_at IS NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_title ON "posts" (title);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_active_not_deleted ON "users" (is_active, deleted_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_created_at ON "users" (created_at);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_categories_created_at ON "categories" (created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tags_created_at ON "tags" (created_at);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_comments_post_created_at ON "comments" (post_id, created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_comments_parent ON "comments" (parent_comment_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_comments_status ON "comments" (status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_postviews_post_time ON "post_views" (post_id, viewed_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_postviews_user_post ON "post_views" (user_id, post_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_actor_time ON "admin_audit_logs" (actor_user_id, created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_entity ON "admin_audit_logs" (entity_type, entity_id);

COMMIT;

-- End of upgrade script
