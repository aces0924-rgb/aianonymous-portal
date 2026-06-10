const fs = require('fs');

let c = fs.readFileSync('src/app/admin/events/[id]/settings/page.tsx', 'utf8');

// Add ColorInput for btnPrimaryColor and btnSecondaryColor
c = c.replace(
  /<div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">/,
  `<div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">メインボタン色 (HEX)</label>
                <ColorInput name="btnPrimaryColor" defaultValue={defaultTheme.btnPrimaryColor} />
                <p className="text-[10px] text-gray-400 mt-1">応募・投票ボタンの色</p>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">サブボタン色 (HEX)</label>
                <ColorInput name="btnSecondaryColor" defaultValue={defaultTheme.btnSecondaryColor} />
                <p className="text-[10px] text-gray-400 mt-1">YouTube等のボタンの色</p>
              </div>`
);

// Add to defaultTheme
c = c.replace(
  /mainColor: themeConfig\.mainColor \|\| '#00f0ff',/,
  `mainColor: themeConfig.mainColor || '#00f0ff',
    btnPrimaryColor: themeConfig.btnPrimaryColor || '#8b5cf6',
    btnSecondaryColor: themeConfig.btnSecondaryColor || '#ea580c',`
);

// Add to updateEventConfig (finding the lines where variables are defined)
c = c.replace(
  /const logoUrl = formData\.get\('logoUrl'\) as string/,
  `const logoUrl = formData.get('logoUrl') as string
            const btnPrimaryColor = formData.get('btnPrimaryColor') as string
            const btnSecondaryColor = formData.get('btnSecondaryColor') as string`
);

c = c.replace(
  /await updateEventConfig\(id, 'themeConfig', \{ mainColor, bgColor, textColor, surfaceColor, enableNeon, bgUrl, logoUrl \}\)/,
  `await updateEventConfig(id, 'themeConfig', { mainColor, bgColor, textColor, surfaceColor, enableNeon, bgUrl, logoUrl, btnPrimaryColor, btnSecondaryColor })`
);

fs.writeFileSync('src/app/admin/events/[id]/settings/page.tsx', c);
console.log('Updated admin settings page');
