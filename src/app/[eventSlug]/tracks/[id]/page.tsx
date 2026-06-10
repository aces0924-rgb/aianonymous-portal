export const revalidate = 3600

import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import AnalysisTabs from '@/components/AnalysisTabs'
import { getDirectStreamUrl } from '@/lib/audio'
import AudioPlayer from '@/components/AudioPlayer'
import RandomTrackButton from '@/components/RandomTrackButton'
import FavoriteButton from '@/components/FavoriteButton'
import InterestedButton from '@/components/InterestedButton'
import SelectionIndicator from '@/components/SelectionIndicator'
import TrackJumpInput from '@/components/TrackJumpInput'
import TrackDetailView from '@/components/TrackDetailView'

export default async function TrackPage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ eventSlug: string, id: string }>,
  searchParams: Promise<{ table?: string, preview?: string, reveal?: string }>
}) {
  const resolvedParams = await params;
  const { eventSlug } = resolvedParams;
  const event = await prisma.event.findUnique({ where: { slug: eventSlug } });
  if (!event) return notFound();
  const { table, preview, reveal } = await searchParams;
  const labelConfig = JSON.parse(event.labelConfig || '{}');
  const featureFlags = JSON.parse(event.featureFlags || '{}');
  const defaultLabels = {
    anonymityPolicy: labelConfig.anonymityPolicy || '{defaultLabels.anonymityPolicy}',
    lyricsAnalysisAttribution: labelConfig.lyricsAnalysisAttribution || '{defaultLabels.lyricsAnalysisAttribution}',
    thumbnailSubmit: labelConfig.thumbnailSubmit || '{defaultLabels.thumbnailSubmit}',
    lyricsTab: labelConfig.lyricsTab || 'LYRICS',
    analysisTab: labelConfig.analysisTab || '歌詞考察',
    analysisNote: labelConfig.analysisNote || '※AIが歌詞から導き出した独自の考察です。制作者の意図や公式の解釈を示すものではありません。',
    disclaimer: labelConfig.disclaimer || '【免責事項】この考察はAIによる独自の解釈であり、作者様の意図と異なる場合があります。',
    siteTitle: labelConfig.siteTitle || 'AI-anonymous MUSIC FES.',
    guidelinesTitle: labelConfig.guidelinesTitle || '募集要項'
  };
  const defaultFeatures = {
    enableThumbnailSubmit: featureFlags.enableThumbnailSubmit ?? true,
    enableAnonymityPolicy: featureFlags.enableAnonymityPolicy ?? true,
    enableShowCreators: featureFlags.enableShowCreators ?? false,
    enableArtistMain: featureFlags.enableArtistMain ?? false,
  };
  const trackId = parseInt(resolvedParams.id, 10);
  if (isNaN(trackId)) return notFound();
  
  const activeTableSetting = await prisma.setting.findFirst({ where: { eventId: event.id, key: 'ACTIVE_TRACK_TABLE' } });
  
  const isHonban = preview === 'honban' || table === 'track_honban';
  const activeTable = isHonban ? 'track_honban' : (activeTableSetting?.value || 'track');

  const track = activeTable === 'track_honban'
    ? await prisma.trackHonban.findFirst({ where: { id: trackId, eventId: event.id } })
    : await prisma.track.findFirst({ where: { id: trackId, eventId: event.id } });

  const thumbnail = await prisma.trackThumbnail.findUnique({
    where: { trackId: trackId }
  });

  if (!track) return notFound();

  // Fetch only necessary fields for navigation
  const navigationSelect = { id: true, entryNo: true, title: true, artistName: true };
  const allTracks = activeTable === 'track_honban'
    ? await prisma.trackHonban.findMany({
        where: { eventId: event.id, published: true },
        select: navigationSelect,
        orderBy: { entryNo: 'asc' }
      })
    : await prisma.track.findMany({
        where: { eventId: event.id, published: true },
        select: navigationSelect,
        orderBy: { entryNo: 'asc' }
      });

  const currentIndex = allTracks.findIndex((t: any) => t.id === trackId);
  const nextTrack = allTracks.length > 0 
    ? allTracks[(currentIndex + 1) % allTracks.length] 
    : null;
  const prevTrack = allTracks.length > 0
    ? allTracks[(currentIndex - 1 + allTracks.length) % allTracks.length]
    : null;
  const trackIds = allTracks.map((t: any) => t.id);

  const audioSource = getDirectStreamUrl(track.audioUrl || track.songUrl);

  const tracksListUrl = preview === 'honban' ? `/${eventSlug}/tracks?preview=honban` : `/${eventSlug}/tracks`;
  // プレビューモード（手動パラメータ指定）中のみクエリを引き継ぐ
  let tableQuery = preview === 'honban' ? '?preview=honban' : (table === 'track_honban' ? '?table=track_honban' : '?');
  if (tableQuery === '?') tableQuery = '';
  if (reveal === 'true') tableQuery += (tableQuery ? '&' : '?') + 'reveal=true';

  const isShowCreatorsDb = defaultFeatures.enableShowCreators;
  const showCreators = isShowCreatorsDb || reveal === 'true';

      return (
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
