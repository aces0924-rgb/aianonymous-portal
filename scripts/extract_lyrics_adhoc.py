import csv
import os

csv_path = r'c:\Users\ACAC\Desktop\アニメ用\vocaloid-ai-event\tmp\assets_latest.csv'

def main():
    if not os.path.exists(csv_path):
        print("CSV not found.")
        return

    with open(csv_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    start = 0
    for i, l in enumerate(lines):
        if l.startswith('No,'):
            start = i
            break
    
    reader = csv.DictReader(lines[start:])
    for row in reader:
        no = row.get('No')
        if not no: continue
        try:
            if int(no) >= 15:
                print(f"--- No.{no} [{row.get('■ 曲タイトル')}] ---")
                print(row.get('■ 歌詞（任意）'))
                print("\n")
        except ValueError:
            continue

if __name__ == "__main__":
    main()
