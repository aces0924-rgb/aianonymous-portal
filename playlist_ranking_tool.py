import tkinter as tk
from tkinter import ttk, messagebox, scrolledtext, filedialog
import subprocess
import json
import os
import csv

PROJECT_ROOT = r'C:\Users\ACAC\Desktop\アニメ用\vocaloid-ai-event'
NODE_SCRIPT = os.path.join(PROJECT_ROOT, 'scripts', 'aggregate_playlists.js')

class RankingApp:
    def __init__(self, root):
        self.root = root
        self.root.title("推しリスト集計ランキング（メイン/サブ別）")
        self.root.geometry("1000x850")
        self.root.configure(bg="#f8fafc")
        
        self.ranking_data = []
        self.unselected_data = []

        header = tk.Frame(root, bg="#0f172a", pady=20)
        header.pack(fill=tk.X)
        tk.Label(header, text="推しリスト楽曲集計ランキング（本投票数連動版）", font=("Meiryo", 14, "bold"), bg="#0f172a", fg="#22d3ee").pack()

        ctrl_frame = tk.Frame(root, pady=15, bg="#f8fafc")
        ctrl_frame.pack(fill=tk.X)
        
        self.btn_refresh = tk.Button(ctrl_frame, text="ランキングを更新", font=("Meiryo", 10, "bold"), 
                                     bg="#0284c7", fg="white", padx=20, pady=8, relief="flat", command=self.fetch_ranking)
        self.btn_refresh.pack(side=tk.LEFT, padx=(60, 20))

        self.btn_csv = tk.Button(ctrl_frame, text="CSVで保存 (全曲)", font=("Meiryo", 10, "bold"), 
                                 bg="#10b981", fg="white", padx=20, pady=8, relief="flat", 
                                 state=tk.DISABLED, command=self.save_csv)
        self.btn_csv.pack(side=tk.LEFT, padx=10)

        self.btn_unselected = tk.Button(ctrl_frame, text="未選曲リストを表示", font=("Meiryo", 10, "bold"), 
                                         bg="#f43f5e", fg="white", padx=20, pady=8, relief="flat", 
                                         state=tk.DISABLED, command=self.show_unselected)
        self.btn_unselected.pack(side=tk.LEFT)

        self.exclude_self_var = tk.BooleanVar(value=False)
        self.chk_exclude_self = tk.Checkbutton(ctrl_frame, text="自推薦分を差し引く", variable=self.exclude_self_var, font=("Meiryo", 10, "bold"), bg="#f8fafc", command=self.fetch_ranking)
        self.chk_exclude_self.pack(side=tk.LEFT, padx=20)

        self.lbl_status = tk.Label(root, text="待機中...", font=("Meiryo", 9), bg="#f8fafc", fg="#64748b")
        self.lbl_status.pack()

        # テーブル設定
        style = ttk.Style()
        style.configure("Treeview", rowheight=25)
        
        self.tree_frame = tk.Frame(root, bg="#f8fafc")
        self.tree_frame.pack(pady=10, padx=20, fill=tk.BOTH, expand=True)

        cols = ("rank", "no", "title", "artist", "main", "sub", "total", "vote", "thumb")
        self.tree = ttk.Treeview(self.tree_frame, columns=cols, show="headings")
        self.tree.heading("rank", text="順位")
        self.tree.heading("no", text="曲番号")
        self.tree.heading("title", text="楽曲タイトル")
        self.tree.heading("artist", text="アーティスト")
        self.tree.heading("main", text="メイン")
        self.tree.heading("sub", text="サブ")
        self.tree.heading("total", text="合計")
        self.tree.heading("vote", text="本投票")
        self.tree.heading("thumb", text="サムネ状態")
        
        self.tree.column("rank", width=55, anchor="center")
        self.tree.column("no", width=65, anchor="center")
        self.tree.column("title", width=250, anchor="w")
        self.tree.column("artist", width=120, anchor="w")
        self.tree.column("main", width=75, anchor="center")
        self.tree.column("sub", width=75, anchor="center")
        self.tree.column("total", width=75, anchor="center")
        self.tree.column("vote", width=80, anchor="center")
        self.tree.column("thumb", width=85, anchor="center")
        
        self.tree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)

        scrollbar = ttk.Scrollbar(self.tree_frame, orient=tk.VERTICAL, command=self.tree.yview)
        self.tree.configure(yscroll=scrollbar.set)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)

        self.log_area = scrolledtext.ScrolledText(root, height=5, bg="#f1f5f9", font=("Consolas", 9))
        self.log_area.pack(fill=tk.X, padx=20, pady=10)

    def fetch_ranking(self):
        self.btn_refresh.config(state=tk.DISABLED)
        self.log_area.delete(1.0, tk.END)
        self.root.update()

        try:
            result = subprocess.run(["node", NODE_SCRIPT], cwd=PROJECT_ROOT, capture_output=True, text=True, encoding='utf-8')
            if result.stdout:
                data = json.loads(result.stdout.strip())
                if "error" in data:
                    self.log_area.insert(tk.END, f"Error: {data['error']}\n")
                    return

                for item in self.tree.get_children(): self.tree.delete(item)
                
                self.ranking_data = []
                # 1. まず1票以上ある曲（ranking）を挿入
                current_rank = 1
                previous_score = None
                
                exclude_self = self.exclude_self_var.get()
                
                # 並び替え（チェック状態に応じて）
                sorted_ranking = sorted(data["ranking"], key=lambda x: (x["totalNet"] if exclude_self else x["totalCount"], x["mainNet"] if exclude_self else x["mainCount"]), reverse=True)
                
                for i, item in enumerate(sorted_ranking):
                    main_c = item["mainNet"] if exclude_self else item["mainCount"]
                    sub_c = item["subNet"] if exclude_self else item["subCount"]
                    total_c = item["totalNet"] if exclude_self else item["totalCount"]
                    
                    # 合計が0の場合は表示しない（未選曲に回す）
                    if total_c == 0:
                        continue

                    current_score = (total_c, main_c)
                    if previous_score is None:
                        previous_score = current_score
                    elif current_score != previous_score:
                        current_rank = i + 1
                        previous_score = current_score
                        
                    row = (current_rank, item["no"], item["title"], item["artist"], main_c, sub_c, total_c, item["voteCount"], item.get("thumbStatus", "未登録"))
                    self.tree.insert("", tk.END, values=row)
                    self.ranking_data.append(row)
                
                # 2. 次に0票の未発掘曲（unselected）を「順位: 未選曲」として挿入！
                base_unselected = data.get("unselected", [])
                self.unselected_data = list(base_unselected)
                
                # 自推薦除外によって0票になった曲も未選曲リストに追加
                if exclude_self:
                    for item in data["ranking"]:
                        total_c = item["totalNet"]
                        if total_c == 0:
                            self.unselected_data.append(item)
                
                # 曲番号でソート
                self.unselected_data.sort(key=lambda x: x["no"])

                for item in self.unselected_data:
                    row = ("未選曲", item["no"], item["title"], item["artist"], 0, 0, 0, item.get("voteCount", 0), item.get("thumbStatus", "未登録"))
                    self.tree.insert("", tk.END, values=row)
                    self.ranking_data.append(row)
                
                status_text = f"分析完了: メイン {data['totalMain']}件 / サブ {data['totalSub']}件"
                if self.unselected_data:
                    status_text += f" (未発掘・未選曲: {len(self.unselected_data)}件)"
                
                self.lbl_status.config(text=status_text)
                self.btn_csv.config(state=tk.NORMAL)
                self.btn_unselected.config(state=tk.NORMAL)
                self.log_area.insert(tk.END, "ランキングおよび本投票数を正常に更新・結合しました！0票の未発掘曲の本投票数も表示されています。\n")
        except Exception as e:
            messagebox.showerror("Error", str(e))
        finally:
            self.btn_refresh.config(state=tk.NORMAL)

    def save_csv(self):
        file_path = filedialog.asksaveasfilename(defaultextension=".csv", initialfile="ranking_all_tracks.csv")
        if file_path:
            try:
                with open(file_path, 'w', newline='', encoding='utf-8-sig') as f:
                    writer = csv.writer(f)
                    writer.writerow(["順位", "曲番号", "楽曲タイトル", "アーティスト", "メイン回数", "サブ回数", "合計回数", "本投票数", "サムネ状態"])
                    writer.writerows(self.ranking_data)
                messagebox.showinfo("成功", f"全曲CSVファイルを保存しました:\n{file_path}")
            except Exception as e:
                messagebox.showerror("エラー", f"保存に失敗しました:\n{str(e)}")

    def show_unselected(self):
        if not self.unselected_data:
            messagebox.showinfo("情報", "まだ推しリストに選ばれていない（0票）楽曲はありません。")
            return
        
        win = tk.Toplevel(self.root)
        win.title("まだ誰の推しリストにも選ばれていない楽曲（0票の未発掘曲）")
        win.geometry("850x600")
        win.configure(bg="#f8fafc")
        
        header = tk.Frame(win, bg="#0f172a", pady=15)
        header.pack(fill=tk.X)
        tk.Label(header, text="まだ誰の推しリストにも選ばれていない楽曲一覧 (本投票の得票数も表示)", font=("Meiryo", 11, "bold"), bg="#0f172a", fg="#f43f5e").pack()
        
        info_frame = tk.Frame(win, bg="#fff1f2", pady=8, bd=1, relief="solid")
        info_frame.pack(fill=tk.X, padx=15, pady=10)
        tk.Label(info_frame, text=f"合計 {len(self.unselected_data)} 曲がまだ選ばれていません (未発掘状態)", font=("Meiryo", 9, "bold"), bg="#fff1f2", fg="#be123c").pack()

        # テーブル表示エリア（Treeviewで綺麗に表示！）
        tree_frame = tk.Frame(win, bg="#f8fafc")
        tree_frame.pack(pady=10, padx=20, fill=tk.BOTH, expand=True)

        cols = ("no", "title", "artist", "main", "sub", "total", "vote", "thumb")
        unselected_tree = ttk.Treeview(tree_frame, columns=cols, show="headings")
        unselected_tree.heading("no", text="曲番号")
        unselected_tree.heading("title", text="楽曲タイトル")
        unselected_tree.heading("artist", text="アーティスト")
        unselected_tree.heading("main", text="メイン")
        unselected_tree.heading("sub", text="サブ")
        unselected_tree.heading("total", text="合計")
        unselected_tree.heading("vote", text="本投票")
        unselected_tree.heading("thumb", text="サムネ状態")
        
        unselected_tree.column("no", width=80, anchor="center")
        unselected_tree.column("title", width=250, anchor="w")
        unselected_tree.column("artist", width=130, anchor="w")
        unselected_tree.column("main", width=75, anchor="center")
        unselected_tree.column("sub", width=75, anchor="center")
        unselected_tree.column("total", width=75, anchor="center")
        unselected_tree.column("vote", width=80, anchor="center")
        unselected_tree.column("thumb", width=85, anchor="center")
        
        unselected_tree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)

        scrollbar = ttk.Scrollbar(tree_frame, orient=tk.VERTICAL, command=unselected_tree.yview)
        unselected_tree.configure(yscroll=scrollbar.set)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)

        # 0票のデータをテーブルに挿入（本投票数は実際の得票数！）
        for item in self.unselected_data:
            unselected_tree.insert("", tk.END, values=(item['no'], item['title'], item['artist'], 0, 0, 0, item['voteCount'], item.get("thumbStatus", "未登録")))

        btn_frame = tk.Frame(win, bg="#f8fafc", pady=15)
        btn_frame.pack(fill=tk.X)
        
        def save_unselected_csv():
            file_path = filedialog.asksaveasfilename(defaultextension=".csv", initialfile="unselected_tracks.csv", parent=win)
            if file_path:
                try:
                    with open(file_path, 'w', newline='', encoding='utf-8-sig') as f:
                        writer = csv.writer(f)
                        writer.writerow(["曲番号", "楽曲タイトル", "アーティスト", "メイン回数", "サブ回数", "合計回数", "本投票数", "サムネ状態"])
                        for item in self.unselected_data:
                            writer.writerow([item['no'], item['title'], item['artist'], 0, 0, 0, item['voteCount'], item.get("thumbStatus", "未登録")])
                    messagebox.showinfo("成功", f"CSVファイルを保存しました:\n{file_path}", parent=win)
                except Exception as e:
                    messagebox.showerror("エラー", f"保存に失敗しました:\n{str(e)}", parent=win)
                    
        btn_save = tk.Button(btn_frame, text="未選曲リストをCSVで保存", font=("Meiryo", 10, "bold"), 
                             bg="#10b981", fg="white", padx=20, pady=8, relief="flat", command=save_unselected_csv)
        btn_save.pack()

if __name__ == "__main__":
    root = tk.Tk()
    app = RankingApp(root)
    root.mainloop()
