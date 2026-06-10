'use client'

import { useState } from 'react'

export default function ColorInput({ name, defaultValue }: { name: string, defaultValue: string }) {
  const [val, setVal] = useState(defaultValue || '#000000')

  return (
    <div className="flex gap-2 items-center">
      <input 
        type="color" 
        name={name} 
        value={val} 
        onChange={(e) => setVal(e.target.value)} 
        className="w-10 h-10 border-none bg-transparent cursor-pointer" 
      />
      <input 
        type="text" 
        value={val} 
        onChange={(e) => setVal(e.target.value)} 
        className="border p-2 rounded text-sm bg-white flex-1 font-mono uppercase" 
        pattern="^#[0-9A-Fa-f]{6}$"
      />
    </div>
  )
}
