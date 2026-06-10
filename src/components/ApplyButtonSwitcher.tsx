'use client'

import { updateApplyButtonSetting } from '@/app/admin/actions'

interface ApplyButtonSwitcherProps {
  show: boolean
}

export default function ApplyButtonSwitcher({ show }: ApplyButtonSwitcherProps) {
  return (
    <form action={updateApplyButtonSetting} className="flex items-center gap-2 bg-gray-100 p-1.5 rounded-xl border border-gray-200">
      <select 
        name="showApplyButton" 
        defaultValue={show ? "true" : "false"}
        onChange={(e) => e.target.form?.requestSubmit()}
        className="bg-transparent text-sm font-bold px-2 py-1 outline-none text-black cursor-pointer"
      >
        <option value="true">✅ 表示 (Show)</option>
        <option value="false">🔒 非表示 (Hidden)</option>
      </select>
    </form>
  )
}
