import csv
import os
import re

# パス設定
CSV_PATH = r'C:\Users\ACAC\Desktop\アニメ用\vocaloid-ai-event\tmp\assets_latest.csv'
AUDIO_DIR = r'G:\マイドライブ\AI-anonymousFES\動画作成\音源'
LYRICS_DIR = r'G:\マイドライブ\AI-anonymousFES\動画作成\歌詞'
START_NO = 21

os.makedirs(LYRICS_DIR, exist_ok=True)

def get_safe_filename(title):
    # bulk_sync.pyと同じロジック
    return "".join([c for c in title if c.isalnum() or c in (' ', '_', '-')]).rstrip()

def main():
    if not os.path.exists(CSV_PATH):
        print(f"Error: CSV not found at {CSV_PATH}")
        return

    # 現存する音源ファイルのリスト取得
    audio_files = os.listdir(AUDIO_DIR)
    
    # CSV読み込み
    with open(CSV_PATH, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    start_line = 0
    for i, line in enumerate(lines):
        if line.startswith('No,タイムスタンプ'):
            start_line = i
            break
    
    reader = csv.DictReader(lines[start_line:])
    
    audit_results = []
    lyrics_synced = []

    print("="*80)
    print(f"Audit & Sync Analysis (Starting from No.{START_NO})")
    print("="*80)

    for row in reader:
        no_raw = row.get('No', '').strip()
        if not no_raw: continue
        
        try:
            no_int = int(no_raw)
            if no_int < START_NO: continue
        except ValueError:
            continue

        no_padded = no_raw.zfill(3)
        title = row.get('■ 曲タイトル', '').strip()
        lyrics = row.get('■ 歌詞（任意）', '').strip()
        
        safe_title = get_safe_filename(title)
        expected_base = f"{no_padded}_{safe_title}"
        
        # 音源チェック
        found_audio = None
        for f in audio_files:
            if f.startswith(f"{no_padded}_"):
                found_audio = f
                break
        
        status = "OK"
        detail = ""
        
        if not found_audio:
            status = "Missing"
            detail = "音源ファイルが見つかりません"
        else:
            # 拡張子を除いたベース名の比較
            actual_base = os.path.splitext(found_audio)[0]
            if actual_base != expected_base:
                status = "Mismatched Name"
                detail = f"Expected: {expected_base} / Found: {actual_base}"
        
        audit_results.append({
            "no": no_padded,
            "title": title,
            "status": status,
            "detail": detail
        })

        # 歌詞保存 (No.21以降一括)
        if lyrics:
            lyrics_filename = f"{expected_base}.txt"
            lyrics_path = os.path.join(LYRICS_DIR, lyrics_filename)
            try:
                with open(lyrics_path, 'w', encoding='utf-8-sig') as lf:
                    lf.write(lyrics)
                lyrics_synced.append(lyrics_filename)
            except Exception as e:
                print(f"Error saving lyrics for No.{no_padded}: {e}")

    # レポート表示
    print(f"{'No':<5} | {'Status':<15} | {'Title'}")
    print("-" * 80)
    for res in audit_results:
        print(f"{res['no']:<5} | {res['status']:<15} | {res['title']}")
        if res['detail']:
            print(f"      -> {res['detail']}")

    print("="*80)
    print(f"Results Summary:")
    print(f"- Checked Tracks: {len(audit_results)}")
    print(f"- Lyrics Synced: {len(lyrics_synced)}")
    print(f"- Missing Audio: {len([r for r in audit_results if r['status'] == 'Missing'])}")
    print(f"- Name Mismatches: {len([r for r in audit_results if r['status'] == 'Mismatched Name'])}")
    print("="*80)

if __name__ == "__main__":
    main()
