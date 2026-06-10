'use client'

import { updateCTAButtonMode } from '@/app/admin/actions'

interface CTAButtonSwitcherProps {
  mode: string // 'apply', 'vote', 'hidden'
}

export default function CTAButtonSwitcher({ mode }: CTAButtonSwitcherProps) {
  return (
    <form action={updateCTAButtonMode} className="flex items-center gap-2 bg-gray-100 p-1.5 rounded-xl border border-gray-200">
      <select 
        name="ctaMode" 
        defaultValue={mode}
        onChange={(e) => e.target.form?.requestSubmit()}
        className="bg-transparent text-sm font-bold px-2 py-1 outline-none text-black cursor-pointer"
      >
        <option value="apply">📝 応募する (Apply)</option>
        <option value="vote">🗳️ 投票する (Vote)</option>
        <option value="hidden">🔒 非表示 (Hidden)</option>
      </select>
    </form>
  )
}
