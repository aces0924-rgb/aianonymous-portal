import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const { fileId } = await params;
  
  if (!fileId) {
    return new NextResponse("File ID is required", { status: 400 });
  }

  const range = request.headers.get("range");
  const url = `https://docs.google.com/uc?id=${fileId}&export=download`;

  try {
    const fetchHeaders: HeadersInit = {};
    if (range) {
      fetchHeaders["Range"] = range;
    }

    const response = await fetch(url, { headers: fetchHeaders });

    // Handle large files where Google Drive might redirect or require a confirm token
    // For most music files (under 100MB), the direct uc?id=...&export=download should work.
    
    if (!response.ok && response.status !== 206) {
      console.error(`Failed to fetch from Google Drive: ${response.status} ${response.statusText}`);
      return new NextResponse("Failed to fetch audio from Google Drive", { status: response.status });
    }

    // Stream the response back to the client
    const headers = new Headers();
    
    // Copy relevant headers from the Google Drive response
    const contentType = response.headers.get("Content-Type");
    if (contentType && contentType !== "application/octet-stream") {
      headers.set("Content-Type", contentType);
    } else {
      // Force audio/mpeg for MP3 files if content-type is missing or generic
      headers.set("Content-Type", "audio/mpeg");
    }

    const contentLength = response.headers.get("Content-Length");
    if (contentLength) headers.set("Content-Length", contentLength);
    
    const contentRange = response.headers.get("Content-Range");
    if (contentRange) headers.set("Content-Range", contentRange);

    headers.set("Accept-Ranges", "bytes");
    headers.set("Cache-Control", "public, max-age=3600");
    headers.set("Access-Control-Allow-Origin", "*");

    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: headers,
    });
  } catch (error) {
    console.error("Audio Proxy Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
