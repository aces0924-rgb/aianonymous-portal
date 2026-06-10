const fs = require('fs');
let c = fs.readFileSync('src/components/TrackListCard.tsx', 'utf8');

const start = c.indexOf('return (');
const end = c.indexOf('{isModalOpen && (');

if (start !== -1 && end !== -1) {
  const replacement = `return (
    <div className={\`bg-surface/40 border \${favorite ? 'border-[var(--color-cyan-400)] shadow-[0_0_15px_var(--color-glow)]' : 'border-[var(--color-cyan-400)]/30'} rounded-2xl p-4 md:p-5 hover:border-[var(--color-cyan-400)] transition-all group backdrop-blur-sm relative overflow-hidden\`}>
      <div className={\`absolute top-0 left-0 w-1 h-full \${favorite ? 'bg-[var(--color-cyan-500)]' : 'bg-transparent'} group-hover:bg-[var(--color-cyan-500)] transition-all duration-500\`}></div>
      
      <div className="flex flex-col gap-4 relative z-10">
        
        {/* Header: No. Genre and Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-surface-border/50 pb-3">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[var(--color-cyan-400)] font-mono text-xs md:text-sm font-black bg-[var(--color-cyan-500)]/20 px-2 py-0.5 rounded border border-[var(--color-cyan-400)]/30">
              No.{track.entryNo || track.id.toString().padStart(3, '0')}
            </span>
            {track.genre && (
              <span className="text-foreground/60 font-mono text-[10px] md:text-xs font-bold uppercase tracking-widest truncate max-w-[120px] md:max-w-[150px]" style={{ writingMode: 'horizontal-tb' }}>
                {track.genre}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
            {videoId && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setIsModalOpen(true);
                }}
                className="flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-full bg-surface/50 border transition-all active:scale-90 border-surface-border text-foreground/60 hover:border-[var(--color-cyan-400)] hover:text-[var(--color-cyan-400)]"
                title="サムネイルを拡大"
              >
                <svg className="w-4 h-4 md:w-4.5 md:h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
              </button>
            )}

            <button
              onClick={(e) => {
                e.preventDefault();
                toggleInterested(track.id);
              }}
              className={\`flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-full border transition-all active:scale-90 \${
                interested 
                  ? 'bg-amber-500/10 border-amber-500/50 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.2)]' 
                  : 'bg-surface/50 border-surface-border text-foreground/60 hover:border-amber-400/50 hover:text-amber-400'
              }\`}
              title="気になる！"
            >
              <svg className={\`w-4 h-4 md:w-4.5 md:h-4.5 \${interested ? 'fill-current' : 'fill-none'}\`} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            </button>

            <button
              onClick={(e) => {
                e.preventDefault();
                toggleFavorite(track.id);
              }}
              className={\`flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-full border transition-all active:scale-90 \${
                favorite 
                  ? 'bg-pink-500/10 border-pink-500/50 text-pink-400 shadow-[0_0_10px_rgba(236,72,153,0.2)]' 
                  : 'bg-surface/50 border-surface-border text-foreground/60 hover:border-pink-400/50 hover:text-pink-400'
              }\`}
              title="推す！"
            >
              <svg className={\`w-4 h-4 md:w-4.5 md:h-4.5 \${favorite ? 'fill-current' : 'fill-none'}\`} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </button>

            <Link 
              href={detailUrl} 
              className="ml-1 flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 bg-purple-600/20 border border-purple-500/30 text-purple-200 rounded-full text-[10px] md:text-xs font-black hover:bg-purple-600 hover:text-white hover:border-purple-300 transition-all group/link whitespace-nowrap shadow-[0_0_10px_rgba(168,85,247,0.1)]"
            >
              <span>詳細</span>
              <span className="group-hover/link:translate-x-0.5 transition-transform">→</span>
            </Link>
          </div>
        </div>

        {/* Title and Play Button */}
        <div className="flex items-start gap-3">
          {(track.songUrl || track.audioUrl) ? (
            <button
              onClick={(e) => {
                e.preventDefault();
                playTrack(track.id, track.title, track.songUrl, track.audioUrl);
              }}
              className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-[var(--color-cyan-500)]/10 border border-[var(--color-cyan-400)]/30 text-[var(--color-cyan-400)] hover:bg-[var(--color-cyan-500)] hover:text-black transition-all active:scale-90 shrink-0 shadow-[0_0_15px_var(--color-glow)] group-hover:border-[var(--color-cyan-400)] mt-0.5"
              title="再生する"
            >
              <svg className="w-5 h-5 md:w-6 md:h-6 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          ) : (
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-red-500/5 border border-red-500/20 flex items-center justify-center text-red-500/40 shrink-0 mt-0.5" title="楽曲データなし">
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M18.36 18.36l-1.41-1.41M6.34 6.34l-1.41-1.41M2 12h2M20 12h2M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          )}

          <Link href={detailUrl} className="flex-1 min-w-0 group/titlelink">
            <h3 className="text-base md:text-xl font-bold text-foreground group-hover/titlelink:text-[var(--color-cyan-400)] transition-colors leading-tight break-words">
              {track.title}
            </h3>
          </Link>
        </div>
      </div>

      `;
  
  c = c.substring(0, start) + replacement + c.substring(end);
  fs.writeFileSync('src/components/TrackListCard.tsx', c);
  console.log('Successfully updated TrackListCard.tsx');
} else {
  console.log('Could not find start or end tags');
  console.log('Start index: ' + start);
  console.log('End index: ' + end);
}
