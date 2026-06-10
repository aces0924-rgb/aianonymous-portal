import { google } from 'googleapis';
import { Readable } from 'stream';

// 環境変数から認証情報を取得
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

async function getDriveClient() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'https://developers.google.com/oauthplayground' // リダイレクトURI
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });

  return google.drive({ version: 'v3', auth: oauth2Client });
}

/**
 * ファイルをGoogleドライブにアップロードする
 */
export async function uploadFileToDrive(
  fileBuffer: Buffer,
  fileName: string,
  folderId: string,
  mimeType: string = 'image/jpeg'
) {
  const drive = await getDriveClient();

  const fileMetadata = {
    name: fileName,
    parents: [folderId],
  };

  const media = {
    mimeType: mimeType,
    body: Readable.from(fileBuffer),
  };

  const response = await drive.files.create({
    requestBody: fileMetadata,
    media: media,
    fields: 'id',
  });

  return response.data.id;
}
