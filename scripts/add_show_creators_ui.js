const fs = require('fs');
let c = fs.readFileSync('src/app/admin/events/[id]/settings/page.tsx', 'utf-8');

c = c.replace(
  `            const enableRandomPlay = formData.get('enableRandomPlay') === 'true'
            const enableThumbSubmit = formData.get('enableThumbSubmit') === 'true'
            const enablePlaylistInfo = formData.get('enablePlaylistInfo') === 'true'`,
  `            const enableRandomPlay = formData.get('enableRandomPlay') === 'true'
            const enableThumbSubmit = formData.get('enableThumbSubmit') === 'true'
            const enablePlaylistInfo = formData.get('enablePlaylistInfo') === 'true'
            const enableShowCreators = formData.get('enableShowCreators') === 'true'`
);

c = c.replace(
  `await updateEventConfig(id, 'featureFlags', { enableRandomPlay, enableThumbSubmit, enablePlaylistInfo })`,
  `await updateEventConfig(id, 'featureFlags', { enableRandomPlay, enableThumbSubmit, enablePlaylistInfo, enableShowCreators })`
);

// Add the default feature flag for showCreators
c = c.replace(
  `  const defaultFeatures = {
    enableRandomPlay: featureFlags.enableRandomPlay ?? true,
    enableThumbSubmit: featureFlags.enableThumbSubmit ?? false,
    enablePlaylistInfo: featureFlags.enablePlaylistInfo ?? true
  }`,
  `  const defaultFeatures = {
    enableRandomPlay: featureFlags.enableRandomPlay ?? true,
    enableThumbSubmit: featureFlags.enableThumbSubmit ?? false,
    enablePlaylistInfo: featureFlags.enablePlaylistInfo ?? true,
    enableShowCreators: featureFlags.enableShowCreators ?? false
  }`
);

// Add the UI toggle for showCreators
c = c.replace(
  `            <button type="submit" className="bg-gray-600 text-white p-2 rounded hover:bg-gray-700 text-sm font-bold mt-2 w-32">ON/OFFを保存</button>`,
  `            </div>
            <div className="flex gap-4 mt-2">
              <div className="flex-1">
                <label className="text-xs font-bold text-gray-500 block mb-1">制作者名 表示設定</label>
                <select name="enableShowCreators" defaultValue={defaultFeatures.enableShowCreators ? 'true' : 'false'} className="w-full border p-2 rounded text-sm bg-white">
                  <option value="true">表示する (ON)</option>
                  <option value="false">非表示 (OFF)</option>
                </select>
              </div>
              <div className="flex-1"></div>
            </div>
            <button type="submit" className="bg-gray-600 text-white p-2 rounded hover:bg-gray-700 text-sm font-bold mt-2 w-32">ON/OFFを保存</button>`
);

fs.writeFileSync('src/app/admin/events/[id]/settings/page.tsx', c);
console.log('Settings page showCreators UI added');
