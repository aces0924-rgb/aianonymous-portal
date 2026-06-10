'use client'

import { useState, useRef, useEffect } from 'react'
import dynamic from 'next/dynamic'
import 'react-quill-new/dist/quill.snow.css'

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false })

export default function RichTextEditor({ name, defaultValue }: { name: string, defaultValue?: string }) {
  const [val, setVal] = useState(defaultValue || '')
  
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      [{ 'color': [] }, { 'background': [] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['clean']
    ]
  }

  return (
    <div className="bg-white text-black rounded">
      {/* Hidden input to hold the actual value for the server action form data */}
      <input type="hidden" name={name} value={val} />
      <ReactQuill 
        theme="snow" 
        value={val} 
        onChange={setVal} 
        modules={modules}
        className="h-64 mb-12"
      />
      <style jsx global>{`
        .ql-editor { min-height: 16rem; font-size: 16px; }
        .ql-snow .ql-picker.ql-size .ql-picker-label[data-value=huge]::before,
        .ql-snow .ql-picker.ql-size .ql-picker-item[data-value=huge]::before { content: '特大'; font-size: 2.5em; }
        .ql-snow .ql-picker.ql-size .ql-picker-label[data-value=large]::before,
        .ql-snow .ql-picker.ql-size .ql-picker-item[data-value=large]::before { content: '大'; font-size: 1.5em; }
        .ql-snow .ql-picker.ql-size .ql-picker-label[data-value=small]::before,
        .ql-snow .ql-picker.ql-size .ql-picker-item[data-value=small]::before { content: '小'; font-size: 0.75em; }
        .ql-snow .ql-picker.ql-size .ql-picker-label::before,
        .ql-snow .ql-picker.ql-size .ql-picker-item::before { content: '標準'; }
      `}</style>
    </div>
  )
}
