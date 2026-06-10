import csv
import os

# 設定
source_csv = r'C:\Users\ACAC\.gemini\antigravity\brain\2db20337-8cf8-4fda-84c7-da70a91597c8\.system_generated\steps\2960\content.md'
output_dir = r'G:\マイドライブ\AI-anonymousFES\動画作成\歌詞'
target_nos = ['084', '085', '086', '087', '088']

def sanitize_filename(filename):
    # ファイル名に使えない文字を置換
    invalid_chars = '<>:"/\\|?*'
    for char in invalid_chars:
        filename = filename.replace(char, '_')
    return filename.strip()

def main():
    print(f"Reading source: {source_csv}")
    if not os.path.exists(output_dir):
        print(f"Creating directory: {output_dir}")
        os.makedirs(output_dir, exist_ok=True)

    with open(source_csv, 'r', encoding='utf-8') as f:
        # スプレッドシートのCSVエクスポート形式を想定
        # 最初の数行（Source等）をスキップする必要があるか確認
        lines = f.readlines()
        
        # 実際のCSVデータが始まる行（No,タイムスタンプ...）を探す
        start_idx = 0
        for i, line in enumerate(lines):
            if line.startswith('No,'):
                start_idx = i
                break
        
        csv_data = lines[start_idx:]
        reader = csv.reader(csv_data)
        header = next(reader)
        
        processed_count = 0
        for row in reader:
            if not row: continue
            
            no = row[0].strip().zfill(3) # '084' 形式に揃える
            if no in target_nos:
                title = sanitize_filename(row[3])
                lyrics = row[6]
                
                file_name = f"{no}_{title}.txt"
                file_path = os.path.join(output_dir, file_name)
                
                # BOM付きUTF-8で保存
                with open(file_path, 'w', encoding='utf-8-sig') as out_f:
                    out_f.write(lyrics)
                
                print(f"✅ Saved: {file_name}")
                processed_count += 1

    print(f"\nTarget processed: {processed_count}/5")

if __name__ == "__main__":
    main()
