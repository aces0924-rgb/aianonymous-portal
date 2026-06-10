import csv
import os

csv_path = r'C:\Users\ACAC\.gemini\antigravity\brain\e643d229-b479-4155-817f-25e90d694adf\.system_generated\steps\907\content.md'
base_dir = r'C:\Users\ACAC\Desktop\アニメ用\assets_production'
lyrics_dir = os.path.join(base_dir, 'lyrics')
os.makedirs(lyrics_dir, exist_ok=True)

# CSVデータの読み込み (Skip lines until the actual CSV header)
with open(csv_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# find header
start_line = 0
for i, line in enumerate(lines):
    if line.startswith('No,タイムスタンプ'):
        start_line = i
        break

reader = csv.DictReader(lines[start_line:])
audio_list = []

for row in reader:
    no = row.get('No', '').strip()
    title = row.get('■ 曲タイトル', '').strip()
    lyrics = row.get('■ 歌詞（任意）', '').strip()
    audio_url = row.get('■ 楽曲URL ※必須', '').strip()
    
    if not title: continue # skip empty lines

    # Normalize safe filename
    safe_title = "".join([c for c in title if c.isalnum() or c in (' ', '_', '-')]).rstrip()
    filename_base = f"{no}_{safe_title}"
    
    # Write Lyrics
    lyrics_file = os.path.join(lyrics_dir, f"{filename_base}.txt")
    with open(lyrics_file, 'w', encoding='utf-8-sig') as lf:
        lf.write(lyrics)
    
    # Add to audio list
    audio_list.append(f"{no},{title},{audio_url}")

# Write Audio List for Bulk Download reference
with open(os.path.join(base_dir, 'audio_download_list.csv'), 'w', encoding='utf-8-sig') as af:
    af.write('No,Title,URL\n')
    for item in audio_list:
        af.write(item + '\n')

print(f"Export completed. Files are in {base_dir}")
