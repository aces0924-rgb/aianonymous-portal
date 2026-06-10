import csv
import json
import os

csv_path = r'C:\Users\ACAC\Desktop\アニメ用\vocaloid-ai-event\tmp\assets_latest.csv'
output_json = r'C:\Users\ACAC\Desktop\アニメ用\vocaloid-ai-event\tmp\lyrics_for_analysis_21.json'

def main():
    if not os.path.exists(csv_path):
        print("CSV not found.")
        return

    with open(csv_path, 'r', encoding='utf-8-sig') as f:
        lines = f.readlines()

    start = 0
    for i, l in enumerate(lines):
        if l.startswith('No,'):
            start = i
            break
    
    reader = csv.DictReader(lines[start:])
    results = []

    for row in reader:
        no_str = row.get('No', '').strip()
        if not no_str: continue
        try:
            no = int(no_str)
            if no >= 21:
                results.append({
                    "no": no,
                    "title": row.get('■ 曲タイトル', '').strip(),
                    "lyrics": row.get('■ 歌詞（任意）', '').strip()
                })
        except ValueError:
            continue

    with open(output_json, 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    
    print(f"Extraction complete. {len(results)} tracks (No.21+) saved to {output_json}")

if __name__ == "__main__":
    main()
