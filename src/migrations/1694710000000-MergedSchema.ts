import { MigrationInterface, QueryRunner } from 'typeorm';

export class MergedSchema1694710000000 implements MigrationInterface {
  name = 'MergedSchema1694710000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create core tables (idempotent)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "roles" (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name varchar(100) UNIQUE NOT NULL,
        description text,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        username varchar(255) UNIQUE,
        avatar_url varchar(100),
        email varchar(50) UNIQUE NOT NULL,
        password_hash varchar NOT NULL,
        roles varchar(50) DEFAULT 'user',
        is_active boolean DEFAULT true,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now(),
        deleted_at timestamptz
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "user_roles" (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid NOT NULL,
        role_id uuid NOT NULL,
        created_at timestamptz DEFAULT now(),
        deleted_at timestamptz
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "oauth_accounts" (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        provider varchar(100) NOT NULL,
        provider_account_id varchar(200) NOT NULL,
        user_id uuid NOT NULL,
        created_at timestamptz DEFAULT now(),
        deleted_at timestamptz
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "posts" (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        author_id uuid NOT NULL,
        title varchar(255) NOT NULL,
        content text NOT NULL,
        slug varchar(255) UNIQUE,
        visibility varchar(50) DEFAULT 'public',
        published_at timestamptz,
        status varchar(50) DEFAULT 'draft',
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
        ,deleted_at timestamptz
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "categories" (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name varchar(255) NOT NULL,
        slug varchar(255) UNIQUE,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
        ,deleted_at timestamptz
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "post_categories" (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        post_id uuid NOT NULL,
        category_id uuid NOT NULL,
        created_at timestamptz DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "tags" (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name varchar(255) NOT NULL,
        slug varchar(255) UNIQUE,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
        ,deleted_at timestamptz
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "post_tags" (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        post_id uuid NOT NULL,
        tag_id uuid NOT NULL,
        created_at timestamptz DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "comments" (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        post_id uuid NOT NULL,
        author_id uuid NOT NULL,
        body text NOT NULL,
        parent_comment_id uuid,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "post_likes" (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        post_id uuid NOT NULL,
        user_id uuid NOT NULL,
        created_at timestamptz DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "comment_likes" (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        comment_id uuid NOT NULL,
        user_id uuid NOT NULL,
        created_at timestamptz DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "saved_posts" (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        post_id uuid NOT NULL,
        user_id uuid NOT NULL,
        created_at timestamptz DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "post_views" (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        post_id uuid NOT NULL,
        user_id uuid,
        viewed_at timestamptz DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "admin_audit_logs" (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        actor_user_id uuid NOT NULL,
        entity_type varchar(100) NOT NULL,
        entity_id varchar(100) NOT NULL,
        changes jsonb,
        created_at timestamptz DEFAULT now()
      );
    `);

    // Improvements: trigger function and id/timestamp defaults and conditional indexes
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION public.trigger_set_timestamp()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = now();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await queryRunner.query(`DO $$
    BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='id') THEN
        ALTER TABLE "users" ALTER COLUMN id SET DEFAULT gen_random_uuid();
        ALTER TABLE "users" ALTER COLUMN created_at SET DEFAULT now();
        ALTER TABLE "users" ALTER COLUMN updated_at SET DEFAULT now();
      END IF;
    END$$;`);
    
    // Additional indexes from manual_steps.sql (created here without CONCURRENTLY).
    // Warning: creating indexes without CONCURRENTLY can lock large tables; prefer
    // running `db/pg/manual_steps.sql` manually in production.
    await queryRunner.query(`DO $$
    DECLARE
      has_deleted boolean := false;
      has_status boolean := false;
    BEGIN
      -- categories
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='categories') THEN
        EXECUTE 'CREATE UNIQUE INDEX IF NOT EXISTS uq_categories_slug_active ON "categories" (slug)';
        EXECUTE 'CREATE UNIQUE INDEX IF NOT EXISTS uq_categories_name_active ON "categories" (name)';
      END IF;

      -- tags
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='tags') THEN
        EXECUTE 'CREATE UNIQUE INDEX IF NOT EXISTS uq_tags_slug_active ON "tags" (slug)';
        EXECUTE 'CREATE UNIQUE INDEX IF NOT EXISTS uq_tags_name_active ON "tags" (name)';
      END IF;

      -- user_roles and oauth_accounts
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='user_roles') THEN
        EXECUTE 'CREATE UNIQUE INDEX IF NOT EXISTS uq_user_role_active ON "user_roles" (user_id, role_id)';
      END IF;
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='oauth_accounts') THEN
        EXECUTE 'CREATE UNIQUE INDEX IF NOT EXISTS uq_oauth_provider_account_active ON "oauth_accounts" (provider, provider_account_id)';
      END IF;

      -- posts: published recent (check status column for WHERE), author/status and title
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='posts') THEN
        SELECT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='status') INTO has_status;
        IF has_status THEN
          EXECUTE 'CREATE INDEX IF NOT EXISTS idx_posts_published_recent ON "posts" (published_at DESC) WHERE status = ''published''';
          EXECUTE 'CREATE INDEX IF NOT EXISTS idx_posts_author_status ON "posts" (author_id, status)';
        ELSE
          EXECUTE 'CREATE INDEX IF NOT EXISTS idx_posts_published_recent ON "posts" (published_at DESC)';
          EXECUTE 'CREATE INDEX IF NOT EXISTS idx_posts_author_status ON "posts" (author_id)';
        END IF;
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_posts_title ON "posts" (title)';
      END IF;

      -- users
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='users') THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_users_active_not_deleted ON "users" (is_active, deleted_at)';
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_users_created_at ON "users" (created_at)';
      END IF;

      -- categories/tags created_at
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='categories') THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_categories_created_at ON "categories" (created_at)';
      END IF;
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='tags') THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_tags_created_at ON "tags" (created_at)';
      END IF;

      -- comments
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='comments') THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_comments_post_created_at ON "comments" (post_id, created_at)';     
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_comments_parent ON "comments" (parent_comment_id)';
        -- only create status index if the column exists
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='comments' AND column_name='status') THEN
          EXECUTE 'CREATE INDEX IF NOT EXISTS idx_comments_status ON "comments" (status)';
        END IF;
      END IF;

      -- post_views
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='post_views') THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_postviews_post_time ON "post_views" (post_id, viewed_at)';
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_postviews_user_post ON "post_views" (user_id, post_id)';
      END IF;

      -- audit logs
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='admin_audit_logs') THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_audit_actor_time ON "admin_audit_logs" (actor_user_id, created_at)';
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_audit_entity ON "admin_audit_logs" (entity_type, entity_id)';
      END IF;
    END$$;`);

    await queryRunner.query(`DO $$
    BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='updated_at') THEN
        EXECUTE 'CREATE TRIGGER set_timestamp_posts BEFORE UPDATE ON "posts" FOR EACH ROW EXECUTE PROCEDURE public.trigger_set_timestamp();';
      END IF;
    END$$;`);

    await queryRunner.query(`DO $$
    DECLARE
      has_deleted boolean := false;
    BEGIN
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='users') THEN
        -- check if deleted_at column exists before creating partial unique indexes
        SELECT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='deleted_at') INTO has_deleted;
        IF has_deleted THEN
          EXECUTE 'CREATE UNIQUE INDEX IF NOT EXISTS uq_users_email_active ON "users" (email) WHERE deleted_at IS NULL';
          EXECUTE 'CREATE UNIQUE INDEX IF NOT EXISTS uq_users_username_active ON "users" (username) WHERE deleted_at IS NULL';
        ELSE
          EXECUTE 'CREATE UNIQUE INDEX IF NOT EXISTS uq_users_email_active ON "users" (email)';
          EXECUTE 'CREATE UNIQUE INDEX IF NOT EXISTS uq_users_username_active ON "users" (username)';
        END IF;
      END IF;
      IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='posts') THEN
        SELECT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='deleted_at') INTO has_deleted;
        IF has_deleted THEN
          EXECUTE 'CREATE UNIQUE INDEX IF NOT EXISTS uq_posts_slug_active ON "posts" (slug) WHERE deleted_at IS NULL';
        ELSE
          EXECUTE 'CREATE UNIQUE INDEX IF NOT EXISTS uq_posts_slug_active ON "posts" (slug)';
        END IF;
      END IF;
    END$$;`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS uq_posts_slug_active`);
    await queryRunner.query(`DROP INDEX IF EXISTS uq_users_username_active`);
    await queryRunner.query(`DROP INDEX IF EXISTS uq_users_email_active`);
    await queryRunner.query(`DROP FUNCTION IF EXISTS public.trigger_set_timestamp()`);

    await queryRunner.query(`DROP TABLE IF EXISTS "admin_audit_logs"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "post_views"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "saved_posts"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "comment_likes"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "post_likes"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "comments"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "post_tags"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "tags"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "post_categories"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "categories"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "posts"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "oauth_accounts"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_roles"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "roles"`);
  }

}
