const { execSync } = require('child_process');

const envs = [
  { key: 'SITE_DATABASE_URL', value: 'postgresql://neondb_owner:npg_7Qvor5FBLXwH@ep-soft-dream-am82gy8v-pooler.c-5.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require' },
  { key: 'SITE_DIRECT_URL', value: 'postgresql://neondb_owner:npg_7Qvor5FBLXwH@ep-soft-dream-am82gy8v.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require' },
  { key: 'ADMIN_PASSWORD', value: 'YoutubeOnly_2026!' }
];

for (const env of envs) {
  try {
    console.log(`Setting ${env.key}...`);
    // Remove if exists first to avoid "already exists" error
    try { execSync(`npx.cmd vercel env rm ${env.key} production --yes`, { stdio: 'inherit' }); } catch(e) {}
    
    // Add with proper value escaping
    execSync(`npx.cmd vercel env add ${env.key} production --value "${env.value}" --yes`, { stdio: 'inherit' });
    console.log(`✅ ${env.key} set successfully.`);
  } catch (err) {
    console.error(`❌ Failed to set ${env.key}:`, err.message);
  }
}
