import csv
import re
import requests
import os

# 設定
CSV_PATH = r'c:\Users\ACAC\Desktop\アニメ用\vocaloid-ai-event\tmp\assets_latest.csv'
SIZE_THRESHOLD_MB = 1.0 # 1MB

def audit_track(no, title, row):
    # ロバストなDriveリンク検索
    file_id = None
    for val in row.values():
        if val and isinstance(val, str) and "drive.google.com" in val:
            match = re.search(r'(?:\/d\/|id=)([\w-]+)', val)
            if match:
                file_id = match.group(1)
                break
    
    if not file_id:
        return None # Driveリンクなし

    url = f"https://drive.google.com/uc?export=download&id={file_id}"
    
    try:
        # ヘッダー情報のみ取得（まずは権限と形式、サイズ予測）
        # Google Driveはucボタンの場合、一旦303/302リダイレクトされる
        res = requests.get(url, allow_redirects=True, stream=True, timeout=15)
        
        # 最終的なリダイレクト先を確認
        final_url = res.url
        if 'accounts.google.com' in final_url or 'ServiceLogin' in final_url:
            return "Restricted (Permission Denied)"

        content_type = res.headers.get('Content-Type', '').lower()
        content_length = res.headers.get('Content-Length')
        
        # サイズ判定
        size_mb = 0
        if content_length:
            size_mb = int(content_length) / (1024 * 1024)
        else:
            # Content-Lengthがない場合（チャンク転送等）、少しだけ読み込んでみる
            content_sample = b""
            for chunk in res.iter_content(chunk_size=1024):
                content_sample += chunk
                if len(content_sample) > 1024 * 5: # 5KB程度
                    break
            # もしファイル全体が小さい場合、ここで終わっている可能性がある
            # 実際にはここではサイズ確定は難しいが、1MB以下チェックのため
            # 少し読み込んだ後の全体サイズが判明する場合がある（あるいは最後まで読めてしまう）
            pass

        # 判定：形式
        is_audio = "audio/mpeg" in content_type or "audio/wav" in content_type or "audio/x-wav" in content_type or "audio/mp3" in content_type
        
        # 判定：HTML（ログイン画面等）
        if "text/html" in content_type:
             return f"Invalid Format (HTML/Login Page)"

        # 判定結果まとめ
        issues = []
        if not is_audio:
            issues.append(f"Format: {content_type}")
        if content_length and size_mb < SIZE_THRESHOLD_MB:
            issues.append(f"Small Size: {size_mb:.2f}MB")
        
        if issues:
            return " / ".join(issues)
            
        return "Healthy"

    except Exception as e:
        return f"Error: {str(e)}"

def main():
    if not os.path.exists(CSV_PATH):
        print(f"Error: CSV not found at {CSV_PATH}")
        return

    with open(CSV_PATH, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    start_line = 0
    for i, line in enumerate(lines):
        if line.startswith('No,'):
            start_line = i
            break
    
    reader = csv.DictReader(lines[start_line:])
    
    print("="*80)
    print(f"{'No':<5} | {'Health Status':<40} | {'Title'}")
    print("-"*80)

    problem_list = []

    for row in reader:
        no = row.get('No', '').strip()
        title = row.get('■ 曲タイトル', '').strip()
        if not no or not title: continue

        status = audit_track(no, title, row)
        
        if status:
            print(f"{no:<5} | {status:<40} | {title}")
            if status != "Healthy":
                problem_list.append((no, title, status))

    print("="*80)
    print(f"Audit Finished. Issues found: {len(problem_list)}")
    
    if problem_list:
        print("\n--- Summary of Problematic Tracks ---")
        for no, title, status in problem_list:
            print(f"No.{no}: {title} -> {status}")

if __name__ == "__main__":
    main()
