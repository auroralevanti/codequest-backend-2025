-- manual_steps.sql
-- Run these manually on the database with a superuser or a role that has permission to create extensions and run CONCURRENTLY indexes.

-- 1) Create extension for UUID generation (pgcrypto)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2) Create indexes CONCURRENTLY (these cannot run inside a transaction)
-- Note: `CREATE INDEX CONCURRENTLY` must be run outside a transaction with a role that can create indexes.
-- The merged migration creates `deleted_at` only for the `users` table. For other tables below
-- we create non-partial indexes (no WHERE deleted_at) to avoid errors. If you later add
-- `deleted_at` to those tables, update these statements to include the WHERE clause and re-run.

CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS uq_users_email_active ON "users" (email) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS uq_users_username_active ON "users" (username) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS uq_posts_slug_active ON "posts" (slug);
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS uq_categories_slug_active ON "categories" (slug);
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS uq_categories_name_active ON "categories" (name);
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS uq_tags_slug_active ON "tags" (slug);
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS uq_tags_name_active ON "tags" (name);
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS uq_user_role_active ON "user_roles" (user_id, role_id);
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS uq_oauth_provider_account_active ON "oauth_accounts" (provider, provider_account_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_published_recent ON "posts" (published_at DESC) WHERE status = 'published';
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_author_status ON "posts" (author_id, status);
-- The `visibility` column does not exist on `posts` in the merged migration.
-- If you later add `visibility` to `posts`, re-enable this index.
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_posts_visibility ON "posts" (visibility);
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
