const fs = require('fs');

// 1. Update src/app/[eventSlug]/page.tsx
let pagePath = 'src/app/[eventSlug]/page.tsx';
let c = fs.readFileSync(pagePath, 'utf-8');

// Add enableAwards to defaultFeatures
c = c.replace(
  `  const defaultFeatures = {
    enableRandomPlay: featureFlags.enableRandomPlay ?? true,
    enablePlaylistInfo: featureFlags.enablePlaylistInfo ?? true
  }`,
  `  const defaultFeatures = {
    enableRandomPlay: featureFlags.enableRandomPlay ?? true,
    enablePlaylistInfo: featureFlags.enablePlaylistInfo ?? true,
    enableAwards: featureFlags.enableAwards ?? false
  }`
);

// Conditionally render AWARDS in the array
c = c.replace(
  `                { 
                  href: \`/\${eventSlug}/awards/preview\`, 
                  label: 'AWARDS', `,
  `                defaultFeatures.enableAwards ? { 
                  href: \`/\${eventSlug}/awards/preview\`, 
                  label: 'AWARDS', `
);

// We need to close the ternary for AWARDS item
c = c.replace(
  `                    </svg>
                  )
                },
                { 
                  href: '#schedule', `,
  `                    </svg>
                  )
                } : null,
                { 
                  href: '#schedule', `
);

// We need to filter out nulls in the array map
c = c.replace(
  `              ].map((link, idx) => (
                <Link key={idx} href={link.href}`,
  `              ].filter(Boolean).map((link, idx) => (
                <Link key={idx} href={link.href}`
);

fs.writeFileSync(pagePath, c);
console.log('Updated page.tsx with enableAwards');


// 2. Update admin settings page
let settingsPath = 'src/app/admin/events/[id]/settings/page.tsx';
let sc = fs.readFileSync(settingsPath, 'utf-8');

sc = sc.replace(
  `            const enablePlaylistInfo = formData.get('enablePlaylistInfo') === 'true'
            const enableShowCreators = formData.get('enableShowCreators') === 'true'`,
  `            const enablePlaylistInfo = formData.get('enablePlaylistInfo') === 'true'
            const enableShowCreators = formData.get('enableShowCreators') === 'true'
            const enableAwards = formData.get('enableAwards') === 'true'`
);

sc = sc.replace(
  `await updateEventConfig(id, 'featureFlags', { enableRandomPlay, enableThumbSubmit, enablePlaylistInfo, enableShowCreators })`,
  `await updateEventConfig(id, 'featureFlags', { enableRandomPlay, enableThumbSubmit, enablePlaylistInfo, enableShowCreators, enableAwards })`
);

sc = sc.replace(
  `    enablePlaylistInfo: featureFlags.enablePlaylistInfo ?? true,
    enableShowCreators: featureFlags.enableShowCreators ?? false
  }`,
  `    enablePlaylistInfo: featureFlags.enablePlaylistInfo ?? true,
    enableShowCreators: featureFlags.enableShowCreators ?? false,
    enableAwards: featureFlags.enableAwards ?? false
  }`
);

// Add the UI toggle next to enableShowCreators
sc = sc.replace(
  `              <div className="flex-1"></div>
            </div>
            <button type="submit"`,
  `              <div className="flex-1">
                <label className="text-xs font-bold text-gray-500 block mb-1">AWARDSボタン</label>
                <select name="enableAwards" defaultValue={defaultFeatures.enableAwards ? 'true' : 'false'} className="w-full border p-2 rounded text-sm bg-white">
                  <option value="true">表示する (ON)</option>
                  <option value="false">非表示 (OFF)</option>
                </select>
              </div>
            </div>
            <button type="submit"`
);

fs.writeFileSync(settingsPath, sc);
console.log('Updated admin settings with enableAwards');
