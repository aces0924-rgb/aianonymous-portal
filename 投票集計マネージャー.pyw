import tkinter as tk
from tkinter import messagebox, scrolledtext
import subprocess
import threading
import os
from datetime import datetime

# パス設定
CWD = r'C:\Users\ACAC\Desktop\アニメ用\vocaloid-ai-event'
SYNC_SCRIPT = os.path.join(CWD, 'scripts', 'sync_votes.mjs')
STATS_SCRIPT = os.path.join(CWD, 'scripts', 'get_vote_stats.mjs')
EXTERNAL_SCRIPT = os.path.join(CWD, 'scripts', 'get_external_voters.mjs')

def run_node_task(script_path, log_func, enable_ui_func, *extra_args):
    try:
        if os.path.exists(script_path):
            cmd = ["node", script_path]
            for arg in extra_args:
                if arg:
                    cmd.append(arg)
            result = subprocess.run(cmd, cwd=CWD, capture_output=True, text=True, encoding='utf-8')
            log_func(result.stdout)
            if result.stderr:
                log_func("\n[エラーログ]:\n" + result.stderr)
        else:
            log_func(f"スクリプトが見つかりません: {script_path}\n")
    except Exception as e:
        log_func(f"\n予期せぬエラーが発生しました: {e}\n")
    finally:
        enable_ui_func()

class App:
    def __init__(self, root):
        self.root = root
        root.title("Anonymous Fest 投票集計マネージャー")
        root.geometry("950x750")

        # ボタンエリア
        frame_action = tk.Frame(root, pady=10, padx=15)
        frame_action.pack(fill=tk.X)

        self.btn_sync = tk.Button(frame_action, text="🔄 Googleシート取り込み", font=("Meiryo", 10, "bold"), 
                                 bg="#4CAF50", fg="white", padx=10, pady=5, command=self.start_sync)
        self.btn_sync.pack(side=tk.LEFT, padx=5)

        self.btn_stats = tk.Button(frame_action, text="📊 集計・ランキング", font=("Meiryo", 10, "bold"), 
                                  bg="#2196F3", fg="white", padx=10, pady=5, command=self.start_stats)
        self.btn_stats.pack(side=tk.LEFT, padx=5)

        self.btn_external = tk.Button(frame_action, text="👤 外部投票者一覧", font=("Meiryo", 10, "bold"), 
                                     bg="#9C27B0", fg="white", padx=10, pady=5, command=self.start_external)
        self.btn_external.pack(side=tk.LEFT, padx=5)

        # 日付入力エリア
        frame_date = tk.Frame(root, pady=5, padx=25)
        frame_date.pack(fill=tk.X)
        tk.Label(frame_date, text="ランキング基準日:", font=("Meiryo", 10)).pack(side=tk.LEFT)
        self.entry_date = tk.Entry(frame_date, font=("Meiryo", 10), width=15)
        
        # デフォルトで今日の日付を入力
        today = datetime.now().strftime("%Y/%m/%d")
        self.entry_date.insert(0, today)
        
        self.entry_date.pack(side=tk.LEFT, padx=10)
        tk.Label(frame_date, text="(※空欄で最新)", font=("Meiryo", 9), fg="#666").pack(side=tk.LEFT)

        # 自投票除外チェックボックス
        self.var_exclude_self = tk.BooleanVar(value=False)
        self.chk_exclude_self = tk.Checkbutton(frame_date, text="自投票を除外する", variable=self.var_exclude_self, 
                                               font=("Meiryo", 9), fg="#e91e63")
        self.chk_exclude_self.pack(side=tk.LEFT, padx=20)

        # ログ / 結果表示
        self.txt_log = scrolledtext.ScrolledText(root, font=("Consolas", 10), bg="#1e1e1e", fg="#d4d4d4", padx=10, pady=10)
        self.txt_log.pack(fill=tk.BOTH, expand=True, padx=15, pady=(0, 15))
        
        self.log("投票集計マネージャーを起動しました。")

    def log(self, message):
        self.txt_log.insert(tk.END, message + "\n")
        self.txt_log.see(tk.END)

    def enable_ui(self):
        self.btn_sync.config(state=tk.NORMAL, text="🔄 Googleシート取り込み", bg="#4CAF50")
        self.btn_stats.config(state=tk.NORMAL, text="📊 集計・ランキング", bg="#2196F3")
        self.btn_external.config(state=tk.NORMAL, text="👤 外部投票者一覧", bg="#9C27B0")

    def start_sync(self):
        self.btn_sync.config(state=tk.DISABLED, text="実行中...", bg="#9E9E9E")
        self.txt_log.delete(1.0, tk.END)
        self.log("--- Googleスプレッドシートからデータを取り込んでいます ---\n")
        threading.Thread(target=run_node_task, args=(SYNC_SCRIPT, self.log, self.enable_ui), daemon=True).start()

    def start_stats(self):
        target_date = self.entry_date.get().strip()
        exclude_self = "true" if self.var_exclude_self.get() else "false"
        self.btn_stats.config(state=tk.DISABLED, text="実行中...", bg="#9E9E9E")
        self.txt_log.delete(1.0, tk.END)
        
        label = target_date if target_date else "最新"
        self.log(f"--- 【{label}時点】のランキング集計を開始します (自投票除外: {exclude_self}) ---\n")
        threading.Thread(target=run_node_task, args=(STATS_SCRIPT, self.log, self.enable_ui, target_date, exclude_self), daemon=True).start()

    def start_external(self):
        self.btn_external.config(state=tk.DISABLED, text="実行中...", bg="#9E9E9E")
        self.txt_log.delete(1.0, tk.END)
        self.log("--- 外部投票者（一般参加者）の抽出を開始します ---\n")
        threading.Thread(target=run_node_task, args=(EXTERNAL_SCRIPT, self.log, self.enable_ui), daemon=True).start()

if __name__ == "__main__":
    root = tk.Tk()
    app = App(root)
    root.mainloop()
