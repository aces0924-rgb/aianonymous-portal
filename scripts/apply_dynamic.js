const fs = require('fs');
let content = fs.readFileSync('src/app/[eventSlug]/page.tsx', 'utf-8');

// 1. Config Parsing
content = content.replace(
  'const shareBasePostUrl = shareBasePostUrlSetting?.value || "";',
  `const shareBasePostUrl = shareBasePostUrlSetting?.value || "";

  const themeConfig = JSON.parse(event.themeConfig || '{}')
  const featureFlags = JSON.parse(event.featureFlags || '{}')
  const labelConfig = JSON.parse(event.labelConfig || '{}')

  const defaultTheme = {
    mainColor: themeConfig.mainColor || '#00f0ff',
    bgUrl: themeConfig.bgUrl || '/images/hero-bg.jpg',
    logoUrl: themeConfig.logoUrl || '/images/logo.png'
  }
  const defaultLabels = {
    siteTitle: labelConfig.siteTitle || 'AI-anonymous MUSIC FES.',
  }
  const defaultFeatures = {
    enableRandomPlay: featureFlags.enableRandomPlay ?? true,
    enablePlaylistInfo: featureFlags.enablePlaylistInfo ?? true
  }`
);

// 2. Logo in Header
content = content.replace(
  /<img\s*src="\/images\/logo\.png"\s*alt="AI Anonymous Music Fes"\s*className="h-16 md:h-32 w-auto hover:scale-105 transition-transform duration-300 drop-shadow-\[0_0_20px_rgba\(0,240,255,0\.4\)\]"\s*\/>/g,
  '<img src={defaultTheme.logoUrl} alt={defaultLabels.siteTitle} className="h-16 md:h-32 w-auto hover:scale-105 transition-transform duration-300 drop-shadow-[0_0_20px_rgba(0,240,255,0.4)]" style={{ objectFit: \'contain\' }} />'
);

// 3. Hero Background
content = content.replace(
  /backgroundImage: "url\('\/images\/hero-bg\.jpg'\)"/g,
  'backgroundImage: `url(${defaultTheme.bgUrl})`'
);

// 4. YouTube Playlist condition
content = content.replace(
  /\{playlistUrl && \(/g,
  '{playlistUrl && defaultFeatures.enablePlaylistInfo && ('
);

// 5. Random Button condition
content = content.replace(
  /<RandomTrackButton trackIds=\{tracks\.map\(\(t: any\) => t\.id\)\} preview=\{preview\} variant="hero" label="ランダムで曲を聴く" \/>/g,
  `{defaultFeatures.enableRandomPlay && (
                <RandomTrackButton trackIds={tracks.map((t: any) => t.id)} preview={preview} variant="hero" label="ランダムで曲を聴く" />
              )}`
);

// 6. X Share
content = content.replace(
  /【AI-アノニマスミュージックフェス】\\n完全制作者匿名の音楽祭を応援しています！\\n\\n#アノフェス\\n\\nhttps:\/\/aianonymous\.vercel\.app\/\\n\\n\$\{shareBasePostUrl\}/g,
  `【\${defaultLabels.siteTitle}】\\n素晴らしい音楽祭を応援しています！\\n\\nhttps://\${event.slug}.example.com/\\n\\n\${shareBasePostUrl}`
);

// 7. Large Hero Logo
content = content.replace(
  /<Image\s*src="\/images\/logo\.png"\s*alt="AI-anonymous MUSIC FES\."\s*width=\{2400\}\s*height=\{1000\}\s*priority\s*className="w-full max-w-\[1000px\] md:max-w-\[2000px\] lg:max-w-\[2400px\] h-auto drop-shadow-\[0_0_80px_rgba\(188,19,254,0\.6\)\] transition-all duration-700 group-hover:drop-shadow-\[0_0_120px_rgba\(0,240,255,0\.8\)\] group-hover:scale-\[1\.08\]"\s*style=\{\{ mixBlendMode: 'screen' \}\}\s*\/>/g,
  `<img src={defaultTheme.logoUrl} alt={defaultLabels.siteTitle} className="w-full max-w-[1000px] md:max-w-[2000px] lg:max-w-[2400px] h-auto drop-shadow-[0_0_80px_rgba(188,19,254,0.6)] transition-all duration-700 group-hover:drop-shadow-[0_0_120px_rgba(0,240,255,0.8)] group-hover:scale-[1.08]" style={{ mixBlendMode: 'screen', objectFit: 'contain' }} />`
);

// 8. Tagline
content = content.replace(
  />AI Anonymous Music</g,
  `>{defaultLabels.siteTitle}<`
);
content = content.replace(
  />Fully AI Analyzed</g,
  `>Music Event Portal<`
);

// 9. Footer Logo
content = content.replace(
  /<Image\s*src="\/images\/logo\.png"\s*alt="Logo"\s*width=\{128\}\s*height=\{50\}\s*className="w-32 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500"\s*style=\{\{ mixBlendMode: 'screen' \}\}\s*\/>/g,
  `<img src={defaultTheme.logoUrl} alt="Logo" className="w-32 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500" style={{ mixBlendMode: 'screen', objectFit: 'contain' }} />`
);

// 10. Footer Copy
content = content.replace(
  />© 2026 AI-ANONYMOUS MUSIC FES\.</g,
  `>© {new Date().getFullYear()} {defaultLabels.siteTitle}<`
);
content = content.replace(
  />Beyond the Boundaries of Music</g,
  `>Powered by Portal System<`
);

fs.writeFileSync('src/app/[eventSlug]/page.tsx', content);
console.log('Dynamic page.tsx updated successfully');
