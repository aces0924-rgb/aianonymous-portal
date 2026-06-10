'use client'

import { deleteAllTracks } from '@/app/admin/actions'

export default function ResetButton() {
  return (
    <form action={deleteAllTracks} onSubmit={(e) => {
      if(!confirm("登録されているすべての楽曲データを削除しますか？")) {
        e.preventDefault();
      }
    }}>
      <button type="submit" className="text-red-500 text-xs font-bold border border-red-100 px-3 py-1 rounded-lg hover:bg-red-50 transition-colors">
        🗑 データをリセットする
      </button>
    </form>
  )
}
