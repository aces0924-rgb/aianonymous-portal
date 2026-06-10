import csv
import re
import requests
import os

# CSVパス
csv_path = r'c:\Users\ACAC\Desktop\アニメ用\vocaloid-ai-event\tmp\assets_latest.csv'

def check_permission(file_id):
    url = f"https://drive.google.com/uc?export=download&id={file_id}"
    try:
        # allow_redirects=False にして、ログイン画面へのリダイレクトを検知する
        res = requests.get(url, allow_redirects=False, timeout=10)
        
        # 302 リダイレクトが発生し、遷移先が accounts.google.com なら権限不足
        if res.status_code == 302:
            location = res.headers.get('Location', '')
            if 'accounts.google.com' in location:
                return "Restricted (Login Required)"
            return "Redirected (Likely OK/Warning)"
        
        # 403 / 404
        if res.status_code == 403:
            return "Forbidden (No Access)"
        if res.status_code == 404:
            return "Not Found (Invalid ID)"
            
        # 200 OK
        if res.status_code == 200:
            return "Public (Accessible)"
            
        return f"Unknown Status ({res.status_code})"
    except Exception as e:
        return f"Error: {str(e)}"

def main():
    if not os.path.exists(csv_path):
        print(f"Error: CSV not found at {csv_path}")
        return

    with open(csv_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    start_line = 0
    for i, line in enumerate(lines):
        if line.startswith('No,'):
            start_line = i
            break
    
    reader = csv.DictReader(lines[start_line:])
    
    print("="*60)
    print(f"{'No':<5} | {'Status':<25} | {'Title'}")
    print("-"*60)

    restricted_items = []

    for row in reader:
        no = row.get('No', '').strip()
        title = row.get('■ 曲タイトル', '').strip()
        
        # ロバストなDriveリンク検索
        file_id = None
        for val in row.values():
            if val and isinstance(val, str) and "drive.google.com" in val:
                match = re.search(r'(?:\/d\/|id=)([\w-]+)', val)
                if match:
                    file_id = match.group(1)
                    break
        
        if not file_id:
            # Driveリンクなし（ギガファイル便などの場合はスキップ）
            # print(f"{no:<5} | {'No Drive Link':<25} | {title}")
            continue

        status = check_permission(file_id)
        print(f"{no:<5} | {status:<25} | {title}")

        if "Restricted" in status or "Forbidden" in status or "Not Found" in status:
            restricted_items.append((no, title, status))

    print("="*60)
    print(f"Scan finished. Restricted/Error items: {len(restricted_items)}")
    
    if restricted_items:
        print("\n--- Summary of Restricted Items ---")
        for no, title, status in restricted_items:
            print(f"No.{no}: {title} [{status}]")

if __name__ == "__main__":
    main()
