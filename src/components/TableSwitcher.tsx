'use client'

import { updateActiveTrackTable } from '@/app/admin/actions'

interface TableSwitcherProps {
  activeTable: string
}

export default function TableSwitcher({ activeTable }: TableSwitcherProps) {
  return (
    <form action={updateActiveTrackTable} className="flex items-center gap-2 bg-gray-100 p-1.5 rounded-xl border border-gray-200">
      <select 
        name="activeTable" 
        defaultValue={activeTable}
        onChange={(e) => e.target.form?.requestSubmit()}
        className="bg-transparent text-sm font-bold px-2 py-1 outline-none text-black cursor-pointer"
      >
        <option value="track">📁 準備用 (track)</option>
        <option value="track_honban">🚀 本番用 (track_honban)</option>
      </select>
    </form>
  )
}
