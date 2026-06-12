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
import SelectionIndicator from '@/components/SelectionIndicator';

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
  
  const isArtistMain = defaultFeatures?.enableArtistMain && !!track.artistName;
  const mainText = isArtistMain ? track.artistName : track.title;
  const subText = isArtistMain ? track.title : null;

  const extractSunoId = (url?: string | null) => {
    if (!url) return null;
    const match = url.match(/suno\.com\/(?:song|embed)\/([a-zA-Z0-9\-]+)/);
    return match ? match[1] : null;
  };
  const sunoId = extractSunoId(track.songUrl) || extractSunoId(track.audioUrl);

  const renderThumbnailButton = (className: string) => {
    if (isPreviewMode || !defaultFeatures?.enableThumbSubmit) return null;
    
    const isSubmitted = thumbnail && (thumbnail.status === 'PENDING' || thumbnail.status === 'APPROVED');
    
    if (isSubmitted) {
      return (
        <div className={`w-full py-4 rounded-2xl bg-surface/50 border border-surface-border text-foreground/60 items-center justify-center gap-2 cursor-not-allowed flex ${className}`}>
          <span className="text-lg">✅</span>
          <span className="text-sm font-black tracking-widest uppercase">サムネイル採用済み</span>
        </div>
      );
    }

    return (
      <Link 
        href={`/${eventSlug}/submit-thumbnail?trackId=${track.id}${preview === 'honban' ? '&preview=honban' : ''}`}
        className={`w-full py-5 rounded-2xl bg-gradient-to-r from-[var(--color-cyan-400)] via-blue-600 to-purple-600 hover:from-[var(--color-cyan-400)] hover:to-purple-500 text-white items-center justify-center gap-4 transition-all hover:scale-[1.03] active:scale-[0.97] shadow-[0_0_30px_var(--color-glow)] hover:shadow-[0_0_50px_var(--color-glow)] border-2 border-surface-border group flex ${className}`}
        style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
      >
        <svg className="w-6 h-6 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.6)] group-hover:rotate-12 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/>
        </svg>
        <span className="text-base font-black tracking-widest uppercase italic">
          この楽曲のサムネイルを投稿する
        </span>
      </Link>
    );
  };

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-purple-500 selection:text-foreground font-sans overflow-x-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none opacity-20" style={{
        backgroundImage: 'radial-gradient(circle at 80% 20%, #bc13fe 0%, transparent 40%), radial-gradient(circle at 20% 80%, var(--color-glow) 0%, transparent 40%)'
      }}></div>

      {/* Fixed Top Navigation Frame */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-background/60 backdrop-blur-xl border-b border-surface-border shadow-2xl">
        <div className="max-w-6xl mx-auto px-4 h-16 md:h-20 flex items-center justify-between gap-4">
          <Link href={tracksListUrl} className="text-[var(--color-cyan-400)] hover:text-[var(--color-cyan-400)] transition-colors flex items-center gap-2 text-xs md:text-sm font-bold shrink-0">
            <span className="text-lg">◀</span> <span className="hidden sm:inline">参加作品一覧へ</span>
          </Link>
          
          <div className="hidden lg:block">
            <TrackJumpInput 
              tracks={allTracks} 
              eventSlug={eventSlug} 
              isArtistMain={isArtistMain} 
            />
          </div>

          <div className="flex items-center gap-2 md:gap-3 scale-90 md:scale-100 origin-right">
            <RandomTrackButton trackIds={trackIds} activeTable={activeTable} label="ランダム" />
            
            <div className="flex items-center gap-1 md:gap-2">
              {prevTrack && (
                <Link 
                  href={`/${eventSlug}/tracks/${(prevTrack as any).id}${tableQuery}`} 
                  className="px-3 md:px-5 py-2 md:py-3 rounded-full bg-white/5 hover:bg-white/10 text-foreground text-[10px] md:text-xs font-black transition-all border border-surface-border flex items-center gap-1 backdrop-blur-sm whitespace-nowrap"
                >
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-foreground/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6"/>
                  </svg>
                  <span>前へ</span>
                </Link>
              )}
              {nextTrack && (
                <Link 
                  href={`/${eventSlug}/tracks/${(nextTrack as any).id}${tableQuery}`} 
                  className="px-3 md:px-5 py-2 md:py-3 rounded-full bg-[var(--color-cyan-500)]/10 hover:bg-[var(--color-cyan-500)]/20 text-foreground text-[10px] md:text-xs font-black transition-all border border-[var(--color-cyan-400)]/30 flex items-center gap-1 backdrop-blur-sm whitespace-nowrap"
                >
                  <span>次へ</span>
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-[var(--color-cyan-400)] drop-shadow-[0_0_5px_var(--color-glow)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 pt-20 md:pt-32 pb-8 md:pb-12 relative z-10">
        
        {/* Mobile only thumbnail button at the very top */}
        {renderThumbnailButton("mb-6 lg:hidden")}

        {/* Top Section: Title, Player & Lyrics Grid */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 mb-2">
          
          {/* Left Column: Title & Player */}
          <div className="lg:w-[55%] flex flex-col">
            <div className="border-l-8 border-[var(--color-cyan-400)] pl-6 flex-grow flex flex-col">
              <div className="flex items-center gap-4 mb-6">
                <span className="text-[var(--color-cyan-400)] font-mono text-base font-black tracking-[0.2em] bg-[var(--color-cyan-500)]/40 px-5 py-2.5 rounded-xl border-2 border-[var(--color-cyan-400)]/30 shadow-[0_0_15px_rgba(0,255,255,0.1)]">
                  No.{(track as any).entryNo || track.id.toString().padStart(3, '0')}
                </span>
                <InterestedButton trackId={track.id} />
                <FavoriteButton trackId={track.id} enableArtistMain={defaultFeatures?.enableArtistMain} />
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold text-foreground mb-2 md:mb-4 leading-tight tracking-tighter flex items-start gap-2 md:gap-3">
                {isArtistMain ? (
                  <svg className="w-8 h-8 md:w-10 md:h-10 opacity-70 shrink-0 mt-1 md:mt-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                ) : (
                  <svg className="w-8 h-8 md:w-10 md:h-10 opacity-70 shrink-0 mt-1 md:mt-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
                  </svg>
                )}
                <span>{mainText}</span>
              </h1>
              {subText && (
                <p className={`text-lg md:text-2xl font-bold text-foreground/70 mb-8 flex items-center gap-2 ${isArtistMain ? 'text-[var(--color-cyan-500)]' : ''}`}>
                  {isArtistMain ? (
                    <svg className="w-5 h-5 opacity-70 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 opacity-70 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  )}
                  <span>{subText}</span>
                </p>
              )}

              {/* ニコニコ動画への直リンク */}
              {audioSource && /(?:nicovideo\.jp\/watch\/|nico\.ms\/)(sm\d+|nm\d+|so\d+)/.test(audioSource) && (
                <div className={`mt-6 w-full ${!subText ? 'pt-2' : ''}`}>
                  <a 
                    href={audioSource} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 hover:-translate-y-0.5 transition-all text-sm font-bold text-foreground/90 hover:text-white shadow-lg backdrop-blur-sm group"
                  >
                    <svg className="w-5 h-5 text-white/80 group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect>
                      <polyline points="17 2 12 7 7 2"></polyline>
                    </svg>
                    ニコニコ動画でコメントする
                    <svg className="w-3.5 h-3.5 ml-1 opacity-50 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                      <polyline points="15 3 21 3 21 9"></polyline>
                      <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                  </a>
                </div>
              )}

              <div className={`mt-6 w-full ${!subText ? 'pt-4' : ''}`}>
                {sunoId ? (
                  <div className="w-full rounded-xl overflow-hidden shadow-[0_0_20px_var(--color-glow)] border border-[var(--color-cyan-400)]/30">
                    <iframe 
                      width="100%" 
                      height="120" 
                      src={`https://suno.com/embed/${sunoId}`} 
                      title="Suno Player" 
                      frameBorder="0" 
                      allow="clipboard-write" 
                      style={{ borderRadius: '8px' }}>
                    </iframe>
                  </div>
                ) : (
                  <AudioPlayer audioSource={audioSource || null} trackId={track.id} isPreviewMode={isPreviewMode} />
                )}
              </div>

              {/* Creator Info or Anonymity Policy */}
              {isArtistMain ? (
                // Artist-Main mode: Ignore showCreators setting. Only show Illustrator if thumbnail exists.
                thumbnail && (
                  <div className="mt-8 p-5 rounded-2xl bg-gradient-to-r from-[var(--color-cyan-400)]/30 to-[var(--color-cyan-600)]/10 border border-[var(--color-cyan-400)]/30 flex items-start gap-4 md:gap-5 animate-in fade-in slide-in-from-bottom-4 duration-1000 shadow-[0_0_20px_rgba(0,255,255,0.05)]">
                    <div className="p-2.5 bg-[var(--color-cyan-500)]/10 rounded-xl border border-[var(--color-cyan-400)]/30 shadow-[0_0_15px_rgba(0,255,255,0.15)] shrink-0">
                      <svg className="w-5 h-5 text-[var(--color-cyan-400)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                    </div>
                    <div className="space-y-3 w-full pt-1">
                      <p className="text-[10px] font-black tracking-[0.3em] text-[var(--color-cyan-400)]/80 uppercase">Creator Information</p>
                      <div className="text-sm md:text-base text-foreground/80 leading-relaxed font-bold space-y-3">
                        <div className="flex items-center gap-3">
                          <svg className="w-4 h-4 text-blue-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="flex items-center flex-wrap gap-2">
                            イラスト：
                            {!thumbnail.isAnonymous ? (
                              <span className="text-foreground">{thumbnail.artistName || '不明'}</span>
                            ) : (
                              <span className="text-foreground/60 text-sm font-medium">匿名</span>
                            )}
                            {!thumbnail.isXAnonymous && thumbnail.twitterId && (
                              <a href={`https://x.com/${thumbnail.twitterId.replace(/^@/, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-2.5 py-0.5 ml-1 rounded-full bg-[var(--color-cyan-500)]/60 border border-[var(--color-cyan-400)]/80 hover:bg-[var(--color-cyan-500)] transition-colors group">
                                <svg className="w-3 h-3 text-[var(--color-cyan-400)] group-hover:text-[var(--color-cyan-400)]" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                                <span className="text-[var(--color-cyan-400)] font-mono tracking-wider text-xs">@{thumbnail.twitterId.replace(/^@/, '')}</span>
                              </a>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              ) : (
                // Track-Main mode
                showCreators ? (
                  <div className="mt-8 p-5 rounded-2xl bg-gradient-to-r from-[var(--color-cyan-400)]/30 to-[var(--color-cyan-600)]/10 border border-[var(--color-cyan-400)]/30 flex items-start gap-4 md:gap-5 animate-in fade-in slide-in-from-bottom-4 duration-1000 shadow-[0_0_20px_rgba(0,255,255,0.05)]">
                    <div className="p-2.5 bg-[var(--color-cyan-500)]/10 rounded-xl border border-[var(--color-cyan-400)]/30 shadow-[0_0_15px_rgba(0,255,255,0.15)] shrink-0">
                      <svg className="w-5 h-5 text-[var(--color-cyan-400)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                    </div>
                    <div className="space-y-3 w-full pt-1">
                      <p className="text-[10px] font-black tracking-[0.3em] text-[var(--color-cyan-400)]/80 uppercase">Creator Information</p>
                      <div className="text-sm md:text-base text-foreground/80 leading-relaxed font-bold space-y-3">
                        <div className="flex items-center gap-3">
                          <svg className="w-4 h-4 text-purple-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                          </svg>
                          <span className="flex items-center flex-wrap gap-2">
                            楽曲制作：
                            <span className="text-foreground">{track.artistName}</span>
                          </span>
                        </div>
                        {thumbnail && (
                          <div className="flex items-center gap-3">
                            <svg className="w-4 h-4 text-blue-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="flex items-center flex-wrap gap-2">
                              イラスト：
                              {!thumbnail.isAnonymous ? (
                                <span className="text-foreground">{thumbnail.artistName || '不明'}</span>
                              ) : (
                                <span className="text-foreground/60 text-sm font-medium">匿名</span>
                              )}
                              {!thumbnail.isXAnonymous && thumbnail.twitterId && (
                                <a href={`https://x.com/${thumbnail.twitterId.replace(/^@/, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-2.5 py-0.5 ml-1 rounded-full bg-[var(--color-cyan-500)]/60 border border-[var(--color-cyan-400)]/80 hover:bg-[var(--color-cyan-500)] transition-colors group">
                                  <svg className="w-3 h-3 text-[var(--color-cyan-400)] group-hover:text-[var(--color-cyan-400)]" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                                  <span className="text-[var(--color-cyan-400)] font-mono tracking-wider text-xs">@{thumbnail.twitterId.replace(/^@/, '')}</span>
                                </a>
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : defaultFeatures?.applicationFormType === 'anonymous' ? (
                  <div className="mt-8 p-5 rounded-2xl bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-900/50 flex items-start gap-4 md:gap-5 animate-in fade-in slide-in-from-bottom-4 duration-1000 shadow-[0_0_20px_rgba(234,179,8,0.05)]">
                    <div className="p-2.5 bg-yellow-100 dark:bg-yellow-500/10 rounded-xl border border-yellow-200 dark:border-yellow-500/20 shrink-0">
                      <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <div className="space-y-1 pt-1" style={{ textShadow: 'none' }}>
                      <p className="text-[10px] font-black tracking-[0.3em] text-yellow-700 dark:text-yellow-500/80 uppercase">Anonymity Policy</p>
                      <p className="text-xs md:text-sm text-yellow-900 dark:text-yellow-200/90 leading-relaxed font-bold">
                        本フェスは匿名性を楽しむイベントです。SNS等での制作者の特定や推測に関する投稿は、投票期間終了後までお控えいただけますようお願い申し上げます。
                      </p>
                    </div>
                  </div>
                ) : null
              )}
            </div>
          </div>

          {/* Right Column: Lyrics Box & Submission Button */}
          <div className="lg:w-[45%] flex flex-col relative">
            <div className="flex flex-col gap-4 mb-4 lg:mb-0 lg:absolute lg:inset-0">
              <h2 className="text-lg md:text-2xl font-black flex items-center gap-3 tracking-tighter text-[var(--color-cyan-400)]/80 uppercase shrink-0">
                {defaultLabels.lyricsTab || 'LYRICS'}
              </h2>
              <div className="bg-surface/40 border border-surface-border rounded-3xl p-6 md:p-8 backdrop-blur-sm flex-grow overflow-y-auto custom-scrollbar max-h-[600px] lg:max-h-none">
                <pre className="text-foreground/90 whitespace-pre-wrap font-sans leading-loose text-base md:text-lg">
                  {track.lyrics || "歌詞は登録されていません。"}
                </pre>
              </div>

              {/* Desktop only thumbnail button */}
              {renderThumbnailButton("hidden lg:flex shrink-0")}
            </div>
          </div>
        </div>

        {/* Bottom Section: Analysis & Review (Full Width, No Header) */}
        <div className="mb-20 border-t border-white/5 pt-4">
          <div className="w-full">
            <AnalysisTabs 
              analysis={track.analysis} 
              review={(track as any).review} 
              defaultLabels={defaultLabels}
            />
            <div className="mt-4 text-right text-[10px] text-foreground/50 font-mono tracking-widest uppercase opacity-50">
              {defaultLabels.lyricsAnalysisAttribution || 'Lyrics Analysis generated by Google Gemini AI'}
            </div>
          </div>
        </div>

      </div>

      {/* Selection UI */}
      <SelectionIndicator />
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.2);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: var(--color-glow);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: var(--color-glow);
        }
      `}} />
    </main>
  );
}
