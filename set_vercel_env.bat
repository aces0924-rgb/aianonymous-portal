@echo off
call npx.cmd vercel env add SITE_DATABASE_URL production --value "postgresql://neondb_owner:npg_7Qvor5FBLXwH@ep-soft-dream-am82gy8v-pooler.c-5.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require" --yes
call npx.cmd vercel env add SITE_DIRECT_URL production --value "postgresql://neondb_owner:npg_7Qvor5FBLXwH@ep-soft-dream-am82gy8v.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require" --yes
call npx.cmd vercel env add ADMIN_PASSWORD production --value "YoutubeOnly_2026!" --yes
