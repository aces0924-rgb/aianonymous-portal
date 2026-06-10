import fs from 'fs';

async function list() {
  const envContent = fs.readFileSync('.env', 'utf8');
  const apiKey = envContent.match(/GOOGLE_API_KEY="(.+)"/)[1];
  const folderId = envContent.match(/GDRIVE_FOLDER_ID="(.+)"/)[1];
  
  const url = `https://www.googleapis.com/drive/v3/files?q='${folderId}' in parents&key=${apiKey}&fields=files(id,name,size)`;
  
  console.log('Fetching from URL:', url.replace(apiKey, 'HIDDEN'));
  
  const res = await fetch(url);
  const data = await res.json();
  
  console.log('Result:', JSON.stringify(data, null, 2));
}

list().catch(console.error);
