const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  envConfig.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').trim().replace(/^"|"$/g, '');
      process.env[key.trim()] = value;
    }
  });
}

const prisma = new PrismaClient();

async function main() {
  try {
    const events = await prisma.event.findMany({
      select: {
        id: true,
        slug: true,
        title: true,
        featureFlags: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(JSON.stringify(events));
  } catch (error) {
    console.log(JSON.stringify({ error: error.message }));
  } finally {
    await prisma.$disconnect();
  }
}

main();
