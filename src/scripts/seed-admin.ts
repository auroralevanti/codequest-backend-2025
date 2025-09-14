import AppDataSource from '../data-source';
import * as bcrypt from 'bcryptjs';

async function seed() {
  await AppDataSource.initialize();
  const conn = AppDataSource.manager;

  const email = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
  const username = process.env.SEED_ADMIN_USERNAME || 'admin';
  const password = process.env.SEED_ADMIN_PASSWORD || 'Admin123!';

  // Check if admin user already exists
  const existing = await conn.query('SELECT * FROM "users" WHERE email = $1 LIMIT 1', [email]);
  if (existing && existing.length > 0) {
    console.log('Admin user already exists, skipping seed.');
    await AppDataSource.destroy();
    return;
  }

  const hashed = bcrypt.hashSync(password, 10);
  const userIdResult = await conn.query('SELECT gen_random_uuid() as id');
  const id = userIdResult[0].id;
  await conn.query(
  `INSERT INTO "users" (id, email, username, password_hash, created_at, updated_at, is_active)
     VALUES ($1, $2, $3, $4, now(), now(), true)`,
    [id, email, username, hashed],
  );

  // Ensure Roles table has admin role
  // Ensure roles table exists (create minimal schema if missing)
  const rolesTable = await conn.query("SELECT to_regclass('public.roles') as exists");
  if (!rolesTable[0].exists) {
    await conn.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        name varchar UNIQUE NOT NULL,
        description varchar,
        created_at timestamptz DEFAULT now(),
        updated_at timestamptz DEFAULT now()
      )
    `);
  }

  const roleRow = await conn.query('SELECT id FROM "roles" WHERE name = $1 LIMIT 1', ['admin']);
  let roleId = roleRow && roleRow[0] ? roleRow[0].id : null;
  if (!roleId) {
    const roleIdRes = await conn.query('SELECT uuid_generate_v4() as id');
    roleId = roleIdRes[0].id;
  await conn.query('INSERT INTO "roles" (id, name, description, created_at, updated_at) VALUES ($1, $2, $3, now(), now())', [roleId, 'admin', 'Administrator role']);
  }

  // Link user to role
  // Ensure user_roles table exists
  const urTable = await conn.query("SELECT to_regclass('public.user_roles') as exists");
  if (!urTable[0].exists) {
    await conn.query(`
      CREATE TABLE IF NOT EXISTS user_roles (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id uuid NOT NULL,
        role_id uuid NOT NULL,
        created_at timestamptz DEFAULT now(),
        deleted_at timestamptz
      )
    `);
  }

  const urIdRes = await conn.query('SELECT uuid_generate_v4() as id');
  const urId = urIdRes[0].id;
  await conn.query('INSERT INTO "user_roles" (id, user_id, role_id, created_at) VALUES ($1, $2, $3, now())', [urId, id, roleId]);

  console.log('Admin user seeded:', email);
  await AppDataSource.destroy();
}

seed().catch(err => {
  console.error('Seeding failed', err);
  process.exit(1);
});
