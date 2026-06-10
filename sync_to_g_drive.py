import csv
import os
import re
import requests

csv_path = r'C:\Users\ACAC\.gemini\antigravity\brain\e643d229-b479-4155-817f-25e90d694adf\.system_generated\steps\907\content.md'

# ユーザー指定のGドライブパス
audio_base_dir = r'G:\マイドライブ\AI-anonymousFES\動画作成\音源'
lyrics_base_dir = r'G:\マイドライブ\AI-anonymousFES\動画作成\歌詞'

# フォルダが存在することを確認（存在しない場合は作成を試みるが、Gドライブのマウント状況に依存）
os.makedirs(audio_base_dir, exist_ok=True)
os.makedirs(lyrics_base_dir, exist_ok=True)

def download_file_from_google_drive(id, destination):
    URL = "https://drive.google.com/uc?export=download"
    session = requests.Session()
    response = session.get(URL, params = { 'id' : id }, stream = True)
    token = get_confirm_token(response)
    if token:
        params = { 'id' : id, 'confirm' : token }
        response = session.get(URL, params = params, stream = True)
    save_response_content(response, destination)    

def get_confirm_token(response):
    for key, value in response.cookies.items():
        if key.startswith('download_warning'):
            return value
    return None

def save_response_content(response, destination):
    CHUNK_SIZE = 32768
    with open(destination, "wb") as f:
        for chunk in response.iter_content(CHUNK_SIZE):
            if chunk:
                f.write(chunk)

# CSVデータの読み込み
with open(csv_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

start_line = 0
for i, line in enumerate(lines):
    if line.startswith('No,タイムスタンプ'):
        start_line = i
        break

reader = csv.DictReader(lines[start_line:])

for row in reader:
    no = row.get('No', '').strip()
    title = row.get('■ 曲タイトル', '').strip()
    lyrics = row.get('■ 歌詞（任意）', '').strip()
    audio_url = row.get('■ 楽曲URL ※必須', '').strip()
    drive_url = row.get('■ 音源データURL（任意）', '').strip()
    
    if not title: continue

    safe_title = "".join([c for c in title if c.isalnum() or c in (' ', '_', '-')]).rstrip()
    filename_base = f"{no}_{safe_title}"
    
    # 歌詞保存 (Gドライブ)
    lyrics_file = os.path.join(lyrics_base_dir, f"{filename_base}.txt")
    print(f"Saving lyrics: {filename_base}.txt")
    with open(lyrics_file, 'w', encoding='utf-8-sig') as lf:
        lf.write(lyrics)
    
    # 音源ダウンロード (Gドライブ)
    target_drive_url = drive_url if "drive.google.com" in drive_url else audio_url
    if "drive.google.com" in target_drive_url:
        match = re.search(r'/d/([^/]+)', target_drive_url)
        if match:
            file_id = match.group(1)
            dest = os.path.join(audio_base_dir, f"{filename_base}.mp3")
            print(f"Downloading audio to G-Drive: {filename_base}.mp3")
            try:
                download_file_from_google_drive(file_id, dest)
                print(f"Successfully synced to G-Drive: {dest}")
            except Exception as e:
                print(f"Failed to sync {title}: {e}")
    else:
        print(f"Skipping audio for {title}: Only Drive links are auto-synced (URL: {target_drive_url})")

print(f"\nAll operations completed. Files are synced via G-Drive for Desktop.")
