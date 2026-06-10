import csv
import os
import re
import requests
import io

# 最新のGoogleスプレッドシートからデータを取得
SHEET_URL = "https://docs.google.com/spreadsheets/d/1q3rESt0GZG_rs8hk0hU1beeURRttxQKQ1mGFBJNrlyg/export?format=csv&gid=1297990899"
base_dir = r'G:\マイドライブ\AI-anonymousFES\動画作成'
lyrics_dir = os.path.join(base_dir, '歌詞')
audio_dir = os.path.join(base_dir, '音源')

print(f"Fetching latest sheet data...")
response = requests.get(SHEET_URL)
response.encoding = 'utf-8'
csv_content = response.text

os.makedirs(lyrics_dir, exist_ok=True)
os.makedirs(audio_dir, exist_ok=True)

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
            if chunk: # filter out keep-alive new chunks
                f.write(chunk)

# 開始番号の設定（指示がある場合はここを変更、または実行時に指定）
START_NO = int(os.environ.get('START_NO', 1))

# CSVデータの読み込み（メモリ上のテキストから直接生成）
f = io.StringIO(csv_content)
reader = csv.DictReader(f)

print(f"Syncing assets from No.{START_NO} onwards...")

for row in reader:
    no_str = row.get('No', '').strip()
    if not no_str: continue
    
    try:
        no_val = int(no_str)
        if no_val < START_NO: continue
    except ValueError:
        continue

    title = row.get('■ 曲タイトル', '').strip()
    lyrics = row.get('■ 歌詞（任意）', '').strip()
    audio_url = row.get('■ 楽曲URL ※必須', '').strip()
    drive_url = row.get('■ 音源データURL（任意）', '').strip()
    
    if not title: continue

    safe_title = "".join([c for c in title if c.isalnum() or c in (' ', '_', '-')]).rstrip()
    filename_base = f"{no_str}_{safe_title}"
    
    # 歌詞保存
    lyrics_file = os.path.join(lyrics_dir, f"{filename_base}.txt")
    if not os.path.exists(lyrics_file):
        with open(lyrics_file, 'w', encoding='utf-8-sig') as lf:
            lf.write(lyrics)
        print(f"Saved lyrics: {lyrics_file}")
    
    # 音源ダウンロード
    target_drive_url = drive_url if "drive.google.com" in drive_url else audio_url
    if "drive.google.com" in target_drive_url:
        match = re.search(r'/d/([^/]+)', target_drive_url)
        if match:
            file_id = match.group(1)
            dest = os.path.join(audio_dir, f"{filename_base}.mp3")
            
            if os.path.exists(dest):
                print(f"Skipping {title} (Already exists)")
                continue

            print(f"Downloading {title} from Google Drive...")
            try:
                download_file_from_google_drive(file_id, dest)
                print(f"Successfully downloaded: {dest}")
            except Exception as e:
                print(f"Failed to download {title}: {e}")
    else:
        print(f"Skipping {title}: URL is not a Google Drive link ({target_drive_url})")

print(f"\nProcessing finished. Assets are in {base_dir}")
