const { google } = require('googleapis');
const http = require('http');
const url = require('url');
require('dotenv').config({ path: '.env' });

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
const PORT = 3000;

async function main() {
  console.log('Google Drive API Token Generator (Local Server)\n');

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error('エラー: .env ファイルに GOOGLE_CLIENT_ID と GOOGLE_CLIENT_SECRET が設定されていません。');
    return;
  }

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    `http://localhost:${PORT}` // ローカルサーバーをリダイレクトURIにする
  );

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent'
  });

  console.log('【重要】事前にGoogle Cloud Consoleで以下の設定を行ってください：');
  console.log(`「APIとサービス」＞「認証情報」＞お使いのクライアントIDを開き、`);
  console.log(`「承認済みのリダイレクト URI」に http://localhost:${PORT} を追加して保存してください。\n`);
  
  console.log('設定が終わったら、以下のURLをブラウザで開いてログインしてください:');
  console.log('\n' + authUrl + '\n');
  console.log('ブラウザで許可すると、自動的にトークンが取得されます...\n');

  const server = http.createServer(async (req, res) => {
    try {
      if (req.url.indexOf('/favicon.ico') > -1) return res.end();
      
      const qs = new url.URL(req.url, `http://localhost:${PORT}`).searchParams;
      const code = qs.get('code');

      if (code) {
        res.end('Authentication successful! Please return to your terminal.');
        server.close();
        
        const { tokens } = await oauth2Client.getToken(code);
        console.log('\n✅ 認証成功！\n');
        console.log('以下のリフレッシュトークンを Vercel の環境変数 GOOGLE_REFRESH_TOKEN に設定してください:\n');
        console.log('----------------------------------------------------');
        console.log(tokens.refresh_token);
        console.log('----------------------------------------------------\n');
        console.log('※設定後、Vercelで「Redeploy」を行って設定を反映させてください。');
        process.exit(0);
      } else {
        res.end('Authentication failed or no code provided.');
      }
    } catch (e) {
      console.error(e);
      res.end('Error occurred: ' + e.message);
    }
  });

  server.listen(PORT, () => {
    console.log(`ローカルサーバーをポート${PORT}で起動しました。ブラウザのアクセスを待機しています...`);
  });
}

main();
