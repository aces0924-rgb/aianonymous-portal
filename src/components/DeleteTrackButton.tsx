'use client'

import { deleteTrack } from '@/app/admin/actions'

interface DeleteTrackButtonProps {
  trackId: number;
  trackTitle: string;
}

export default function DeleteTrackButton({ trackId, trackTitle }: DeleteTrackButtonProps) {
  return (
    <form 
      action={deleteTrack.bind(null, trackId)} 
      onSubmit={(e) => {
        if(!confirm(`「${trackTitle}」を削除してもよろしいですか？\nこの操作は取り消せません。`)) {
          e.preventDefault();
        }
      }}
    >
      <button 
        type="submit" 
        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
        title="楽曲を削除"
      >
        🗑️
      </button>
    </form>
  )
}
