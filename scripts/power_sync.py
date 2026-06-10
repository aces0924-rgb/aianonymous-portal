import csv
import os
import re
import requests
import sys
import json

# スキル実行時に一時保存されるCSVのパス
csv_path = r'C:\Users\ACAC\Desktop\アニメ用\vocaloid-ai-event\tmp\assets_latest.csv'

# 宛先パス
audio_base_dir = r'G:\マイドライブ\AI-anonymousFES\動画作成\音源'
lyrics_base_dir = r'G:\マイドライブ\AI-anonymousFES\動画作成\歌詞'
gigafile_list_path = r'C:\Users\ACAC\Desktop\アニメ用\vocaloid-ai-event\tmp\gigafile_links.json'

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

def download_direct_file(url, destination):
    response = requests.get(url, stream=True)
    if response.status_code == 200:
        save_response_content(response, destination)
    else:
        raise Exception(f"HTTP Status {response.status_code}")

def get_confirm_token(response):
    for key, value in response.cookies.items():
        if key.startswith('download_warning'):
            return value
    return None

def save_response_content(response, destination):
    CHUNK_SIZE = 32768
    with open(destination, "wb") as f:
        for chunk in response.iter_content(CHUNK_SIZE):
            if chunk: f.write(chunk)

# メイン処理
if not os.path.exists(csv_path):
    print(f"Error: CSV file not found at {csv_path}")
    sys.exit(1)

with open(csv_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

start_line = 0
for i, line in enumerate(lines):
    if line.startswith('No,タイムスタンプ'):
        start_line = i
        break

# スクリプト引数から開始Noを取得（デフォルトは1）
start_no = 1
if len(sys.argv) > 1:
    try:
        start_no = int(sys.argv[1])
        print(f"Starting sync from No.{start_no} onwards...")
    except ValueError:
        print(f"Warning: Invalid start No '{sys.argv[1]}', defaulting to 1.")

reader = csv.DictReader(lines[start_line:])

synced_files = []
skipped_files = []
gigafile_links = []

for row in reader:
    no_str = row.get('No', '').strip()
    if not no_str: continue
    
    try:
        current_no = int(no_str)
        if current_no < start_no: continue
    except ValueError:
        continue

    no = no_str.zfill(3) 
    title = row.get('■ 曲タイトル', '').strip()
    lyrics = row.get('■ 歌詞（任意）', '').strip()
    audio_url = row.get('■ 楽曲URL ※必須', '').strip()
    drive_url = row.get('■ 音源データURL（任意）', '').strip()
    
    if not title: continue

    safe_title = "".join([c for c in title if c.isalnum() or c in (' ', '_', '-')]).rstrip()
    filename_base = f"{no}_{safe_title}"
    
    print(f"\n--- Processing: No.{no} [{title}] ---")

    # 歌詞保存
    try:
        lyrics_file = os.path.join(lyrics_base_dir, f"{filename_base}.txt")
        # 既存チェック（上書きしない場合はコメントを外す）
        # if not os.path.exists(lyrics_file):
        with open(lyrics_file, 'w', encoding='utf-8-sig') as lf:
            lf.write(lyrics)
        print(f"Synced Lyrics: {filename_base}.txt")
    except Exception as e:
        print(f"Failed to save lyrics for {title}: {e}")
    
    # 音源同期
    target_url = drive_url if drive_url and "http" in drive_url else audio_url
    
    # 拡張子の特定
    if ".wav" in target_url.lower(): ext = ".wav"
    else: ext = ".mp3" # デフォルト

    dest = os.path.join(audio_base_dir, f"{filename_base}{ext}")

    if os.path.exists(dest):
        print(f"Audio already exists, skipping download: {filename_base}{ext}")
        synced_files.append(f"{filename_base} (Existing)")
        continue

    if "drive.google.com" in target_url:
        match = re.search(r'(?:\/d\/|id=)([\w-]+)', target_url)
        if match:
            file_id = match.group(1)
            try:
                print(f"Downloading audio from Google Drive...")
                download_file_from_google_drive(file_id, dest)
                print(f"Synced Audio: {filename_base}{ext}")
                synced_files.append(filename_base)
            except Exception as e:
                print(f"Failed to sync audio from Drive: {e}")
    elif any(target_url.lower().endswith(e) for e in ['.mp3', '.wav', '.m4a', '.flac']):
        try:
            print(f"Downloading direct file: {target_url}")
            download_direct_file(target_url, dest)
            print(f"Synced Audio (Direct): {filename_base}{ext}")
            synced_files.append(filename_base)
        except Exception as e:
            print(f"Failed to sync direct file: {e}")
    elif "gigafile.nu" in target_url:
        print(f"Identified GigaFile Link: {target_url}")
        gigafile_links.append({"no": no, "title": safe_title, "url": target_url})
    else:
        print(f"Skipped Audio: Unhandled URL type for {title} ({target_url})")
        skipped_files.append(title)

# GigaFileリンクの保存
with open(gigafile_list_path, 'w', encoding='utf-8') as f:
    json.dump(gigafile_links, f, ensure_ascii=False, indent=2)

print("\n" + "="*40)
print("Power Sync Phase 1 Finished.")
print(f"Total Synced: {len(synced_files)}")
print(f"GigaFile(Pending): {len(gigafile_links)}")
if skipped_files:
    print(f"Skipped Items: {len(skipped_files)}")
print(f"GigaFile list saved to: {gigafile_list_path}")
print("="*40)
