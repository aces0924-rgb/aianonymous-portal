'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminHelpButton from './AdminHelpButton';

export default function HostAdminForm({ 
  eventId, 
  initialHosts, 
  initialEnableHostSection 
}: { 
  eventId: string, 
  initialHosts: Array<{ role: string, name: string, xUrl: string, iconUrl: string }>,
  initialEnableHostSection: boolean
}) {
  const router = useRouter();
  const [hosts, setHosts] = useState(initialHosts || []);
  const [enableHostSection, setEnableHostSection] = useState(initialEnableHostSection);
  const [isSaving, setIsSaving] = useState(false);

  const handleAddHost = () => {
    setHosts([...hosts, { role: '主催', name: '', xUrl: '', iconUrl: '' }]);
  };

  const handleRemoveHost = (index: number) => {
    setHosts(hosts.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, field: string, value: string) => {
    const newHosts = [...hosts];
    newHosts[index] = { ...newHosts[index], [field]: value };
    setHosts(newHosts);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('enableHostSection', String(enableHostSection));
      formData.append('hosts', JSON.stringify(hosts));

      const res = await fetch(`/api/admin/events/${eventId}/hosts`, {
        method: 'POST',
        body: formData
      });
      
      if (res.ok) {
        alert('主催者設定を保存しました。');
        router.refresh();
      } else {
        alert('保存に失敗しました。');
      }
    } catch (e) {
      alert('エラーが発生しました。');
    }
    setIsSaving(false);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow border-l-4 border-green-500 space-y-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <h2 className="text-xl font-bold text-green-800">主催者・運営メンバー設定 (HOST)</h2>
          <AdminHelpButton contentKey="host" />
        </div>
        <label className="flex items-center gap-2 cursor-pointer bg-gray-50 px-3 py-2 rounded-lg border">
          <input 
            type="checkbox" 
            checked={enableHostSection}
            onChange={(e) => setEnableHostSection(e.target.checked)}
            className="w-5 h-5 accent-green-600 rounded cursor-pointer" 
          />
          <span className="text-sm font-bold text-foreground">主催者セクションを表示する</span>
        </label>
      </div>

      <div className="space-y-4">
        {hosts.map((host, i) => (
          <div key={i} className="flex flex-wrap md:flex-nowrap gap-2 items-start p-4 border border-gray-200 rounded-xl bg-gray-50 relative group">
            <button 
              onClick={() => handleRemoveHost(i)}
              className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full text-xs font-bold shadow-sm md:opacity-0 md:group-hover:opacity-100 transition flex items-center justify-center"
              title="削除"
            >
              ×
            </button>
            
            <div className="w-full md:w-32 shrink-0">
              <label className="text-[10px] font-bold text-foreground block mb-1">役職 (Role)</label>
              <input 
                value={host.role} 
                onChange={(e) => handleChange(i, 'role', e.target.value)} 
                placeholder="主催"
                className="w-full border p-2 rounded text-sm bg-white" 
              />
            </div>
            <div className="w-full md:flex-1">
              <label className="text-[10px] font-bold text-foreground block mb-1">名前 (Name)</label>
              <input 
                value={host.name} 
                onChange={(e) => handleChange(i, 'name', e.target.value)} 
                placeholder="アッシュカラノネコ"
                className="w-full border p-2 rounded text-sm bg-white" 
              />
            </div>
            <div className="w-full md:flex-1">
              <label className="text-[10px] font-bold text-foreground block mb-1">X (Twitter) URL</label>
              <input 
                value={host.xUrl} 
                onChange={(e) => handleChange(i, 'xUrl', e.target.value)} 
                placeholder="https://x.com/..."
                className="w-full border p-2 rounded text-sm bg-white" 
              />
            </div>
            <div className="w-full md:flex-1">
              <label className="text-[10px] font-bold text-foreground block mb-1">アイコン画像 URL</label>
              <input 
                value={host.iconUrl} 
                onChange={(e) => handleChange(i, 'iconUrl', e.target.value)} 
                placeholder="https://pbs.twimg.com/..."
                className="w-full border p-2 rounded text-sm bg-white" 
              />
            </div>
          </div>
        ))}

        <button 
          onClick={handleAddHost}
          className="w-full py-3 border-2 border-dashed border-gray-300 text-foreground font-bold rounded-xl hover:bg-gray-50 hover:text-green-600 transition"
        >
          ＋ メンバーを追加
        </button>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-green-600 text-white p-2 px-6 rounded hover:bg-green-700 text-sm font-bold w-full md:w-auto disabled:"
        >
          {isSaving ? '保存中...' : '主催者設定を保存'}
        </button>
      </div>
    </div>
  );
}
