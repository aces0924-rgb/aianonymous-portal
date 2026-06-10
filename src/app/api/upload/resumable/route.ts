import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function POST(request: Request) {
  try {
    const { fileName, mimeType } = await request.json();

    if (!fileName || !mimeType) {
      return NextResponse.json({ error: 'fileName and mimeType are required' }, { status: 400 });
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });

    const { token } = await oauth2Client.getAccessToken();

    if (!token) {
      throw new Error('Failed to retrieve access token');
    }

    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

    const origin = request.headers.get('origin') || 'http://localhost:3000';

    // Create a resumable upload session
    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Upload-Content-Type': mimeType,
        'Origin': origin,
      },
      body: JSON.stringify({
        name: fileName,
        parents: [folderId],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to create resumable upload session:', errorText);
      throw new Error('Google Drive API Error');
    }

    const sessionUri = response.headers.get('location');

    if (!sessionUri) {
      throw new Error('Location header missing in Drive API response');
    }

    return NextResponse.json({ sessionUri });
  } catch (error) {
    console.error('Resumable Upload Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
