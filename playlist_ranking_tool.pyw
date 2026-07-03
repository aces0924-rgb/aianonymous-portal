import tkinter as tk
from tkinter import ttk, messagebox, scrolledtext, filedialog
import subprocess
import json
import os
import csv
import random
import urllib.request
import urllib.parse
from urllib.error import URLError
import re
import traceback

PROJECT_ROOT = r'C:\Users\ACAC\Desktop\アニメ用\aianonymous-portal'
NODE_SCRIPT = os.path.join(PROJECT_ROOT, 'scripts', 'aggregate_playlists.js')
GET_EVENTS_SCRIPT = os.path.join(PROJECT_ROOT, 'scripts', 'get_events.js')

class RankingApp:
    def __init__(self, root):
        self.root = root
        self.root.title("推しリスト集計ランキング（イベント・種別対応版）")
        self.root.geometry("1100x850")
        self.root.configure(bg="#f8fafc")
        
        self.ranking_data = []
        self.unselected_data = []
        self.events_data = []

        header = tk.Frame(root, bg="#0f172a", pady=20)
        header.pack(fill=tk.X)
        tk.Label(header, text="推しリスト集計ランキング（本投票数連動版）", font=("Meiryo", 14, "bold"), bg="#0f172a", fg="#22d3ee").pack()

        # 設定エリア (イベント選択 & 音楽/イラスト選択)
        settings_frame = tk.Frame(root, pady=10, bg="#e2e8f0")
        settings_frame.pack(fill=tk.X, padx=20, pady=10)

        tk.Label(settings_frame, text="対象イベント:", font=("Meiryo", 10, "bold"), bg="#e2e8f0").pack(side=tk.LEFT, padx=(10, 5))
        self.event_cb = ttk.Combobox(settings_frame, state="readonly", width=30)
        self.event_cb.pack(side=tk.LEFT, padx=5)

        tk.Label(settings_frame, text="集計対象:", font=("Meiryo", 10, "bold"), bg="#e2e8f0").pack(side=tk.LEFT, padx=(30, 5))
        self.type_var = tk.StringVar(value="music")
        tk.Radiobutton(settings_frame, text="音楽", variable=self.type_var, value="music", bg="#e2e8f0", font=("Meiryo", 9), command=self.toggle_dl_frame).pack(side=tk.LEFT)
        tk.Radiobutton(settings_frame, text="イラスト", variable=self.type_var, value="illustration", bg="#e2e8f0", font=("Meiryo", 9), command=self.toggle_dl_frame).pack(side=tk.LEFT)

        ctrl_frame = tk.Frame(root, pady=10, bg="#f8fafc")
        ctrl_frame.pack(fill=tk.X)
        
        self.btn_refresh = tk.Button(ctrl_frame, text="ランキングを更新", font=("Meiryo", 10, "bold"), 
                                     bg="#0284c7", fg="white", padx=20, pady=8, relief="flat", command=self.fetch_ranking)
        self.btn_refresh.pack(side=tk.LEFT, padx=(20, 10))

        self.btn_csv = tk.Button(ctrl_frame, text="CSVで保存 (全件)", font=("Meiryo", 10, "bold"), 
                                 bg="#10b981", fg="white", padx=20, pady=8, relief="flat", 
                                 state=tk.DISABLED, command=self.save_csv)
        self.btn_csv.pack(side=tk.LEFT, padx=10)

        self.btn_unselected = tk.Button(ctrl_frame, text="未選択リストを表示", font=("Meiryo", 10, "bold"), 
                                         bg="#f43f5e", fg="white", padx=20, pady=8, relief="flat", 
                                         state=tk.DISABLED, command=self.show_unselected)
        self.btn_unselected.pack(side=tk.LEFT, padx=10)

        self.exclude_self_var = tk.BooleanVar(value=False)
        self.chk_exclude_self = tk.Checkbutton(ctrl_frame, text="自推薦分を差し引く", variable=self.exclude_self_var, font=("Meiryo", 10, "bold"), bg="#f8fafc", command=self.fetch_ranking)
        self.chk_exclude_self.pack(side=tk.LEFT, padx=20)

        # ダウンロード設定エリア (イラスト用)
        self.dl_frame = tk.Frame(root, pady=10, bg="#e0f2fe", bd=1, relief="solid")
        self.dl_frame.pack(fill=tk.X, padx=20, pady=5)
        
        tk.Label(self.dl_frame, text="【イラスト限定】ランダム順位・一括ダウンロード機能:", font=("Meiryo", 9, "bold"), bg="#e0f2fe", fg="#0369a1").pack(side=tk.LEFT, padx=10)
        
        tk.Label(self.dl_frame, text="上位固定枠(N):", font=("Meiryo", 9), bg="#e0f2fe").pack(side=tk.LEFT, padx=(10, 2))
        self.top_n_var = tk.IntVar(value=3)
        tk.Spinbox(self.dl_frame, from_=1, to=100, textvariable=self.top_n_var, width=5).pack(side=tk.LEFT)
        
        tk.Label(self.dl_frame, text="総枠数(M):", font=("Meiryo", 9), bg="#e0f2fe").pack(side=tk.LEFT, padx=(15, 2))
        self.total_m_var = tk.IntVar(value=30)
        tk.Spinbox(self.dl_frame, from_=1, to=300, textvariable=self.total_m_var, width=5).pack(side=tk.LEFT)
        
        self.btn_select_dir = tk.Button(self.dl_frame, text="保存先を選択", font=("Meiryo", 9), bg="#f8fafc", command=self.select_dl_dir)
        self.btn_select_dir.pack(side=tk.LEFT, padx=(15, 5))
        
        self.dl_dir_var = tk.StringVar(value="")
        self.lbl_dl_dir = tk.Label(self.dl_frame, textvariable=self.dl_dir_var, font=("Meiryo", 8), bg="#e0f2fe", fg="#334155", width=25, anchor="w")
        self.lbl_dl_dir.pack(side=tk.LEFT)
        
        self.btn_exec_dl = tk.Button(self.dl_frame, text="ダウンロード開始", font=("Meiryo", 9, "bold"), bg="#0ea5e9", fg="white", state=tk.DISABLED, command=self.execute_download)
        self.btn_exec_dl.pack(side=tk.LEFT, padx=10)

        self.lbl_status = tk.Label(root, text="イベント一覧を取得中...", font=("Meiryo", 9), bg="#f8fafc", fg="#64748b")
        self.lbl_status.pack()

        # テーブル設定
        style = ttk.Style()
        style.configure("Treeview", rowheight=25)
        
        self.tree_frame = tk.Frame(root, bg="#f8fafc")
        self.tree_frame.pack(pady=10, padx=20, fill=tk.BOTH, expand=True)

        cols = ("rank", "no", "title", "artist", "main", "sub", "total", "vote", "thumb")
        self.tree = ttk.Treeview(self.tree_frame, columns=cols, show="headings")
        self.tree.heading("rank", text="順位")
        self.tree.heading("no", text="番号")
        self.tree.heading("title", text="タイトル")
        self.tree.heading("artist", text="制作者")
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

        # イベント情報の取得を非同期的に開始（GUI描画後）
        self.root.after(100, self.load_events)
        
        # 初期状態では音楽なのでダウンロード枠を消しておく
        self.toggle_dl_frame()

    def toggle_dl_frame(self):
        if self.type_var.get() == "illustration":
            self.dl_frame.pack(fill=tk.X, padx=20, pady=5, after=self.btn_unselected.master)
        else:
            self.dl_frame.pack_forget()

    def load_events(self):
        try:
            result = subprocess.run(["node", GET_EVENTS_SCRIPT], cwd=PROJECT_ROOT, capture_output=True, text=True, encoding='utf-8')
            if result.stdout:
                data = json.loads(result.stdout.strip())
                if isinstance(data, list):
                    self.events_data = data
                    # (slug) Title 形式で表示
                    event_names = [f"({e['slug']}) {e['title']}" for e in self.events_data]
                    # 先頭に「全イベント（絞り込みなし）」を追加
                    event_names.insert(0, "すべてのイベント")
                    
                    self.event_cb['values'] = event_names
                    self.event_cb.current(0)
                    self.lbl_status.config(text="イベント一覧を取得しました。条件を選んで「更新」を押してください。")
                else:
                    self.log_area.insert(tk.END, f"Events Load Error: {data}\n")
                    self.lbl_status.config(text="イベント一覧の取得に失敗しました。")
        except Exception as e:
            self.log_area.insert(tk.END, f"Events Load Exception: {e}\n")
            self.lbl_status.config(text="イベント一覧の取得に失敗しました。")

    def fetch_ranking(self):
        self.btn_refresh.config(state=tk.DISABLED)
        self.log_area.delete(1.0, tk.END)
        self.root.update()

        # パラメータ取得
        sel_idx = self.event_cb.current()
        event_id = ""
        if sel_idx > 0 and len(self.events_data) >= sel_idx:
            event_id = self.events_data[sel_idx - 1]["id"]
            
        target_type = self.type_var.get()
        
        # UIのラベルを種別に応じて変更
        if target_type == "illustration":
            self.tree.heading("no", text="作品番号")
            self.tree.heading("title", text="作品タイトル")
            self.tree.heading("artist", text="イラストレーター")
        else:
            self.tree.heading("no", text="曲番号")
            self.tree.heading("title", text="楽曲タイトル")
            self.tree.heading("artist", text="アーティスト")

        try:
            # Nodeスクリプト実行: node scripts/aggregate_playlists.js <eventId> <type>
            cmd = ["node", NODE_SCRIPT]
            if event_id:
                cmd.append(event_id)
            else:
                cmd.append("") # 空の引数
            cmd.append(target_type)

            result = subprocess.run(cmd, cwd=PROJECT_ROOT, capture_output=True, text=True, encoding='utf-8')
            if result.stdout:
                data = json.loads(result.stdout.strip())
                if "error" in data:
                    self.log_area.insert(tk.END, f"Error: {data['error']}\n")
                    return

                # 生のJSONデータを保存（ダウンロード機能用）
                self.raw_ranking_data = list(data.get("ranking", []))
                self.raw_unselected_data = list(data.get("unselected", []))

                # デバッグ情報をGUIに出力
                self.log_area.insert(tk.END, f"[Debug] main: {data.get('totalMain')}, ranking_len: {len(data.get('ranking', []))}, unselected_len: {len(data.get('unselected', []))}, tracks: {data.get('debugTracksCount')}, infoKeys: {data.get('debugTrackInfoKeys')}\n")

                for item in self.tree.get_children(): self.tree.delete(item)
                
                self.ranking_data = []
                current_rank = 1
                previous_score = None
                
                exclude_self = self.exclude_self_var.get()
                
                sorted_ranking = sorted(data["ranking"], key=lambda x: (x["totalNet"] if exclude_self else x["totalCount"], x["mainNet"] if exclude_self else x["mainCount"]), reverse=True)
                
                for i, item in enumerate(sorted_ranking):
                    main_c = item["mainNet"] if exclude_self else item["mainCount"]
                    sub_c = item["subNet"] if exclude_self else item["subCount"]
                    total_c = item["totalNet"] if exclude_self else item["totalCount"]
                    
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
                
                base_unselected = data.get("unselected", [])
                self.unselected_data = list(base_unselected)
                
                if exclude_self:
                    for item in data["ranking"]:
                        total_c = item["totalNet"]
                        if total_c == 0:
                            self.unselected_data.append(item)
                
                self.unselected_data.sort(key=lambda x: x["no"])

                for item in self.unselected_data:
                    row = ("未選択", item["no"], item["title"], item["artist"], 0, 0, 0, item.get("voteCount", 0), item.get("thumbStatus", "未登録"))
                    self.tree.insert("", tk.END, values=row)
                    self.ranking_data.append(row)
                
                status_text = f"分析完了: メイン {data['totalMain']}件 / サブ {data['totalSub']}件"
                if self.unselected_data:
                    status_text += f" (未選択: {len(self.unselected_data)}件)"
                
                self.lbl_status.config(text=status_text)
                self.btn_csv.config(state=tk.NORMAL)
                self.btn_unselected.config(state=tk.NORMAL)
                if self.type_var.get() == "illustration":
                    self.btn_exec_dl.config(state=tk.NORMAL if self.dl_dir_var.get() else tk.DISABLED)
                
                self.log_area.insert(tk.END, f"ランキングを更新しました！（対象: {'イラスト' if target_type == 'illustration' else '音楽'}）\n")
            else:
                self.log_area.insert(tk.END, f"Error: No output from script.\n")
        except Exception as e:
            messagebox.showerror("Error", str(e))
        finally:
            self.btn_refresh.config(state=tk.NORMAL)

    def select_dl_dir(self):
        d = filedialog.askdirectory(title="ダウンロード先フォルダを選択")
        if d:
            self.dl_dir_var.set(d)
            if hasattr(self, 'ranking_data') or hasattr(self, 'unselected_data'):
                self.btn_exec_dl.config(state=tk.NORMAL)

    def execute_download(self):
        target_dir = self.dl_dir_var.get()
        if not target_dir or not os.path.isdir(target_dir):
            messagebox.showerror("エラー", "正しい保存先フォルダを選択してください。")
            return
            
        if self.type_var.get() != "illustration":
            messagebox.showerror("エラー", "イラスト集計モードでのみ実行可能です。")
            return
            
        if not hasattr(self, 'raw_ranking_data') or not hasattr(self, 'raw_unselected_data'):
            messagebox.showerror("エラー", "先に「ランキングを更新」を実行してください。")
            return

        N = self.top_n_var.get()
        M = self.total_m_var.get()
        
        if N > M:
            messagebox.showerror("エラー", "上位固定枠(N) は 総枠数(M) 以下にしてください。")
            return

        self.btn_exec_dl.config(state=tk.DISABLED)
        self.log_area.insert(tk.END, f"\n=== ダウンロード処理開始 ===\n")
        self.root.update()

        try:
            exclude_self = self.exclude_self_var.get()
            # 1. 実際の集計ランキングを再ソート（GUI表示と同じ順序）
            sorted_ranking = sorted(self.raw_ranking_data, key=lambda x: (x["totalNet"] if exclude_self else x["totalCount"], x["mainNet"] if exclude_self else x["mainCount"]), reverse=True)
            
            # exclude_selfが有効で0票になったものをunselectedに合流させる
            actual_ranking = []
            additional_unselected = []
            current_rank = 1
            previous_score = None

            for i, item in enumerate(sorted_ranking):
                total_c = item["totalNet"] if exclude_self else item["totalCount"]
                main_c = item["mainNet"] if exclude_self else item["mainCount"]

                if total_c == 0:
                    additional_unselected.append(item)
                    continue
                
                current_score = (total_c, main_c)
                if previous_score is None:
                    previous_score = current_score
                elif current_score != previous_score:
                    current_rank = i + 1
                    previous_score = current_score
                    
                new_item = dict(item)
                new_item["_real_rank"] = current_rank
                actual_ranking.append(new_item)

            # 2. 上位固定枠 (実際の順位が N 以下 の作品すべて)
            top_n_list = [item for item in actual_ranking if item["_real_rank"] <= N]
            actual_n = len(top_n_list)
            
            # 3. 残りのリストを作成
            # (N位より下の作品) + (unselected) + (0票になって落ちた作品)
            rest_list = [item for item in actual_ranking if item["_real_rank"] > N] + self.raw_unselected_data + additional_unselected
            
            # 4. 残りリストからランダム抽出 (M - actual_n 件)
            needed_random_count = M - actual_n
            if needed_random_count > 0:
                if len(rest_list) > needed_random_count:
                    random_selected = random.sample(rest_list, needed_random_count)
                else:
                    random_selected = rest_list # 全部取る
            else:
                random_selected = []
                
            # ランダム抽出枠に、通し番号（actual_n + 1 から）を付与する
            for i, item in enumerate(random_selected):
                new_item = dict(item)
                new_item["_real_rank"] = actual_n + i + 1
                random_selected[i] = new_item
                
            # 5. 結合して最終出力リストを作成
            final_list = top_n_list + random_selected
            
            # 6. ダウンロード実行
            success_count = 0
            for item in final_list:
                rank = item["_real_rank"]
                artist_name = item.get("artist", "匿名")
                # ファイル名に使えない文字を置換
                safe_artist = re.sub(r'[\\/*?:"<>|]', '_', artist_name)
                
                image_url = item.get("imageUrl")
                if not image_url:
                    self.log_area.insert(tk.END, f"[{rank}位] {safe_artist} - 画像URLがありません。スキップします。\n")
                    self.root.update()
                    continue
                
                # 拡張子の判定（基本は.jpg、URLに.pngがあれば.png）
                ext = ".jpg"
                if ".png" in image_url.lower():
                    ext = ".png"
                elif ".gif" in image_url.lower():
                    ext = ".gif"
                
                filename = f"{rank:02d}_{safe_artist}{ext}"
                filepath = os.path.join(target_dir, filename)
                
                try:
                    # User-Agentを設定してダウンロード
                    req = urllib.request.Request(image_url, headers={'User-Agent': 'Mozilla/5.0'})
                    with urllib.request.urlopen(req) as response, open(filepath, 'wb') as out_file:
                        data = response.read()
                        out_file.write(data)
                    self.log_area.insert(tk.END, f"[{rank}位] {filename} を保存しました。\n")
                    success_count += 1
                except Exception as e:
                    self.log_area.insert(tk.END, f"[{rank}位] {filename} のダウンロード失敗: {str(e)}\n")
                
                self.root.update()
                
            messagebox.showinfo("完了", f"ダウンロードが完了しました。\n全 {len(final_list)} 件中 {success_count} 件成功。")
            self.log_area.insert(tk.END, f"=== ダウンロード処理完了 ===\n")
            
        except Exception as e:
            messagebox.showerror("エラー", f"ダウンロード処理中にエラーが発生しました:\n{str(e)}")
            self.log_area.insert(tk.END, f"ダウンロードエラー: {str(e)}\n")
        finally:
            self.btn_exec_dl.config(state=tk.NORMAL)
            self.root.update()

    def save_csv(self):
        target_type = self.type_var.get()
        prefix = "illustration" if target_type == "illustration" else "music"
        file_path = filedialog.asksaveasfilename(defaultextension=".csv", initialfile=f"ranking_all_{prefix}.csv")
        if file_path:
            try:
                with open(file_path, 'w', newline='', encoding='utf-8-sig') as f:
                    writer = csv.writer(f)
                    if target_type == "illustration":
                        writer.writerow(["順位", "作品番号", "作品タイトル", "イラストレーター", "メイン回数", "サブ回数", "合計回数", "本投票数", "サムネ状態"])
                    else:
                        writer.writerow(["順位", "曲番号", "楽曲タイトル", "アーティスト", "メイン回数", "サブ回数", "合計回数", "本投票数", "サムネ状態"])
                    writer.writerows(self.ranking_data)
                messagebox.showinfo("成功", f"全件CSVファイルを保存しました:\n{file_path}")
            except Exception as e:
                messagebox.showerror("エラー", f"保存に失敗しました:\n{str(e)}")

    def show_unselected(self):
        if not self.unselected_data:
            messagebox.showinfo("情報", "まだリストに選ばれていない（0票）作品はありません。")
            return
        
        target_type = self.type_var.get()
        title_word = "作品" if target_type == "illustration" else "楽曲"
        
        win = tk.Toplevel(self.root)
        win.title(f"まだ誰のリストにも選ばれていない{title_word}（0票の未発掘{title_word}）")
        win.geometry("850x600")
        win.configure(bg="#f8fafc")
        
        header = tk.Frame(win, bg="#0f172a", pady=15)
        header.pack(fill=tk.X)
        tk.Label(header, text=f"まだ誰のリストにも選ばれていない{title_word}一覧 (本投票の得票数も表示)", font=("Meiryo", 11, "bold"), bg="#0f172a", fg="#f43f5e").pack()
        
        info_frame = tk.Frame(win, bg="#fff1f2", pady=8, bd=1, relief="solid")
        info_frame.pack(fill=tk.X, padx=15, pady=10)
        tk.Label(info_frame, text=f"合計 {len(self.unselected_data)} の{title_word}がまだ選ばれていません (未発掘状態)", font=("Meiryo", 9, "bold"), bg="#fff1f2", fg="#be123c").pack()

        tree_frame = tk.Frame(win, bg="#f8fafc")
        tree_frame.pack(pady=10, padx=20, fill=tk.BOTH, expand=True)

        cols = ("no", "title", "artist", "main", "sub", "total", "vote", "thumb")
        unselected_tree = ttk.Treeview(tree_frame, columns=cols, show="headings")
        
        if target_type == "illustration":
            unselected_tree.heading("no", text="作品番号")
            unselected_tree.heading("title", text="作品タイトル")
            unselected_tree.heading("artist", text="イラストレーター")
        else:
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

        for item in self.unselected_data:
            row = (item["no"], item["title"], item["artist"], 0, 0, 0, item.get("voteCount", 0), item.get("thumbStatus", "未登録"))
            unselected_tree.insert("", tk.END, values=row)

        btn_frame = tk.Frame(win, bg="#f8fafc", pady=15)
        btn_frame.pack(fill=tk.X)
        
        def save_unselected_csv():
            prefix = "illustration" if target_type == "illustration" else "music"
            file_path = filedialog.asksaveasfilename(defaultextension=".csv", initialfile=f"unselected_{prefix}.csv", parent=win)
            if file_path:
                try:
                    with open(file_path, 'w', newline='', encoding='utf-8-sig') as f:
                        writer = csv.writer(f)
                        if target_type == "illustration":
                            writer.writerow(["作品番号", "作品タイトル", "イラストレーター", "メイン回数", "サブ回数", "合計回数", "本投票数", "サムネ状態"])
                        else:
                            writer.writerow(["曲番号", "楽曲タイトル", "アーティスト", "メイン回数", "サブ回数", "合計回数", "本投票数", "サムネ状態"])
                        for item in self.unselected_data:
                            writer.writerow([item['no'], item['title'], item['artist'], 0, 0, 0, item['voteCount'], item.get("thumbStatus", "未登録")])
                    messagebox.showinfo("成功", f"CSVファイルを保存しました:\n{file_path}", parent=win)
                except Exception as e:
                    messagebox.showerror("エラー", f"保存に失敗しました:\n{str(e)}", parent=win)
                    
        btn_save = tk.Button(btn_frame, text="未選択リストをCSVで保存", font=("Meiryo", 10, "bold"), 
                             bg="#10b981", fg="white", padx=20, pady=8, relief="flat", command=save_unselected_csv)
        btn_save.pack()

if __name__ == "__main__":
    try:
        root = tk.Tk()
        app = RankingApp(root)
        root.mainloop()
    except Exception as e:
        import tkinter.messagebox
        tkinter.messagebox.showerror("Fatal Error", f"起動時にエラーが発生しました:\n{traceback.format_exc()}")
