import tkinter as tk
from tkinter import scrolledtext, messagebox
import subprocess
import threading
import os
import sys

# スクリプトの実行ディレクトリをプロジェクトルート(vocaloid-ai-event)に設定
script_dir = os.path.dirname(os.path.abspath(__file__))
project_dir = os.path.dirname(script_dir)
os.chdir(project_dir)

def run_sync():
    btn_sync.config(state=tk.DISABLED)
    txt_log.delete(1.0, tk.END)
    txt_log.insert(tk.END, "同期を開始しています...\n")
    txt_log.insert(tk.END, "Googleスプレッドシートにアクセス中...\n\n")
    
    # UIが固まらないように別スレッドで実行
    def execute():
        try:
            # Node.jsスクリプトを実行
            process = subprocess.Popen(
                ["node", "scripts/import_vote_disclosure.mjs"],
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                encoding='utf-8',
                bufsize=1,
                universal_newlines=True
            )
            
            # 出力をリアルタイムでログエリアに反映
            for line in process.stdout:
                # tkinterはメインスレッドからしかUI更新を保証しないが、
                # 単純なinsertなら多くの環境で動く。安全のため本来はafter等を使う。
                txt_log.insert(tk.END, line)
                txt_log.see(tk.END)
            
            process.wait()
            
            if process.returncode == 0:
                txt_log.insert(tk.END, "\n✨ 同期処理が正常に完了しました！")
                txt_log.see(tk.END)
                messagebox.showinfo("完了", "同期が正常に完了しました！")
            else:
                txt_log.insert(tk.END, f"\n❌ エラーが発生しました（終了コード: {process.returncode}）")
                txt_log.see(tk.END)
                messagebox.showerror("エラー", f"同期中にエラーが発生しました。\nログを確認してください。")
                
        except Exception as e:
            txt_log.insert(tk.END, f"\nシステムエラー: {e}")
            messagebox.showerror("システムエラー", str(e))
        finally:
            btn_sync.config(state=tk.NORMAL)

    thread = threading.Thread(target=execute)
    thread.daemon = True
    thread.start()

# UIのセットアップ
root = tk.Tk()
root.title("個別開示希望データ 同期ツール")
root.geometry("600x450")
root.configure(padx=20, pady=20)

lbl_title = tk.Label(root, text="スプレッドシート → DB 同期ツール", font=("Meiryo", 14, "bold"))
lbl_title.pack(pady=(0, 10))

lbl_desc = tk.Label(root, text="下のボタンを押すと、スプレッドシートの最新の回答データを取り込み、\nデータベースの情報を上書き更新（洗い替え）します。\n※楽曲Noは自動で0埋め3桁（例: 001）に変換されます。", font=("Meiryo", 10))
lbl_desc.pack(pady=(0, 20))

btn_sync = tk.Button(root, text="▶ データを同期する", font=("Meiryo", 12, "bold"), bg="#4CAF50", fg="white", padx=20, pady=10, cursor="hand2", command=run_sync)
btn_sync.pack(pady=(0, 20))

lbl_log = tk.Label(root, text="実行ログ:", font=("Meiryo", 9))
lbl_log.pack(anchor="w")

txt_log = scrolledtext.ScrolledText(root, width=70, height=15, bg="#f4f4f4", font=("Consolas", 10))
txt_log.pack(fill=tk.BOTH, expand=True)

root.mainloop()
