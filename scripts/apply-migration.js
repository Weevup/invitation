const { Client } = require('pg');

const connectionString = process.env.DATABASE_URL;

async function applyMigration() {
  const client = new Client({ connectionString });

  try {
    console.log('🔗 Connecting to Neon database...');
    await client.connect();
    console.log('✅ Connected!');

    console.log('\n📝 Applying migration: Add invitation tracking fields to Guest table...');

    await client.query(`
      ALTER TABLE "Guest"
      ADD COLUMN IF NOT EXISTS "invitationSentAt" TIMESTAMP(3),
      ADD COLUMN IF NOT EXISTS "invitationEmailId" TEXT;
    `);

    console.log('✅ Migration applied successfully!');

    // Verify the columns were added
    const result = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'Guest'
      AND column_name IN ('invitationSentAt', 'invitationEmailId')
      ORDER BY column_name;
    `);

    console.log('\n📊 Verification:');
    result.rows.forEach(row => {
      console.log(`  ✓ ${row.column_name} (${row.data_type})`);
    });

    console.log('\n🎉 Database is now synchronized with the schema!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

applyMigration();
