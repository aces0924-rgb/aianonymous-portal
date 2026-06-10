import { syncTracksFromSheet } from './src/app/admin/actions.js';

async function main() {
  console.log("Starting sync...");
  const result = await syncTracksFromSheet();
  console.log("Sync result:", result);
}

main().catch(console.error);
