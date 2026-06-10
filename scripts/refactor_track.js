const fs = require('fs');

function buildComponent() {
  let c = fs.readFileSync('src/app/[eventSlug]/tracks/[id]/page.tsx', 'utf8');

  // We need the entire return ( ... ) block
  const start = c.search(/return \(\s*<main className="min-h-screen/);
  const end = c.lastIndexOf('</main>');

  if (start === -1) {
    console.error('Could not find start');
    return;
  }

  const jsx = c.substring(start, end + 7);

  const viewComponent = `
'use client'

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import AnalysisTabs from '@/components/AnalysisTabs';
import AudioPlayer from '@/components/AudioPlayer';
import RandomTrackButton from '@/components/RandomTrackButton';
import FavoriteButton from '@/components/FavoriteButton';
import InterestedButton from '@/components/InterestedButton';
import TrackJumpInput from '@/components/TrackJumpInput';

interface TrackDetailViewProps {
  track: any;
  eventSlug: string;
  audioSource?: string | null;
  isPreviewMode?: boolean;
  showCreators?: boolean;
  defaultFeatures?: any;
  defaultLabels?: any;
  tracksListUrl?: string;
  allTracks?: any[];
  prevTrack?: any;
  nextTrack?: any;
  trackIds?: number[];
  tableQuery?: string;
  activeTable?: string;
  thumbnail?: any;
  preview?: string;
}

export default function TrackDetailView({
  track,
  eventSlug,
  audioSource,
  isPreviewMode = false,
  showCreators = false,
  defaultFeatures = {},
  defaultLabels = {},
  tracksListUrl = '#',
  allTracks = [],
  prevTrack,
  nextTrack,
  trackIds = [],
  tableQuery = '',
  activeTable = 'track',
  thumbnail,
  preview
}: TrackDetailViewProps) {
  
  const shareBasePostUrl = track.title;

  const renderThumbnailButton = (className: string) => {
    if (isPreviewMode) return null;
    
    const isSubmitted = thumbnail && (thumbnail.status === 'PENDING' || thumbnail.status === 'APPROVED');
    
    if (isSubmitted) {
      return (
        <div className={\`w-full py-4 rounded-2xl bg-gray-800/50 border border-surface-border text-gray-500 items-center justify-center gap-2 cursor-not-allowed flex \${className}\`}>
          <span className="text-lg">✅</span>
          <span className="text-sm font-black tracking-widest uppercase">サムネイル採用済み</span>
        </div>
      );
    }

    return (
      <Link 
        href={\`/\${eventSlug}/submit-thumbnail?trackId=\${track.id}\${preview === 'honban' ? '&preview=honban' : ''}\`}
        className={\`w-full py-5 rounded-2xl bg-gradient-to-r from-[var(--color-cyan-400)] via-blue-600 to-purple-600 hover:from-[var(--color-cyan-400)] hover:to-purple-500 text-white items-center justify-center gap-4 transition-all hover:scale-[1.03] active:scale-[0.97] shadow-[0_0_30px_var(--color-glow)] hover:shadow-[0_0_50px_var(--color-glow)] border-2 border-white/10 group flex \${className}\`}
      >
        <svg className="w-6 h-6 text-foreground drop-shadow-[0_0_8px_rgba(255,255,255,0.6)] group-hover:rotate-12 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/>
        </svg>
        <span className="text-base font-black tracking-widest uppercase italic">
          この楽曲のサムネイルを投稿する
        </span>
      </Link>
    );
  };

  ${jsx.replace('return (', 'return (')}
}
`;

  fs.writeFileSync('src/components/TrackDetailView.tsx', viewComponent);
  console.log('Created TrackDetailView.tsx');
  
  let beforeReturn = c.substring(0, start);
  beforeReturn = beforeReturn.replace(/const renderThumbnailButton[\s\S]*?};\r?\n\r?\n/g, '');

  if (!beforeReturn.includes('import TrackDetailView')) {
    beforeReturn = beforeReturn.replace(
      "import TrackJumpInput from '@/components/TrackJumpInput'",
      "import TrackJumpInput from '@/components/TrackJumpInput'\nimport TrackDetailView from '@/components/TrackDetailView'"
    );
  }

  const newReturn = `  return (
    <TrackDetailView
      track={track}
      eventSlug={eventSlug}
      audioSource={audioSource}
      showCreators={showCreators}
      defaultFeatures={defaultFeatures}
      defaultLabels={defaultLabels}
      tracksListUrl={tracksListUrl}
      allTracks={allTracks}
      prevTrack={prevTrack}
      nextTrack={nextTrack}
      trackIds={trackIds}
      tableQuery={tableQuery}
      activeTable={activeTable}
      thumbnail={thumbnail}
      preview={preview}
    />
  );
}
`;

  fs.writeFileSync('src/app/[eventSlug]/tracks/[id]/page.tsx', beforeReturn + newReturn);
  console.log('Updated page.tsx');
}

buildComponent();
