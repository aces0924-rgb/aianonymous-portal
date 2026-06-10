'use client';

interface Host {
  role: string;
  name: string;
  xUrl: string;
  iconUrl: string;
}

interface HostSectionProps {
  hosts?: Host[];
}

export default function HostSection({ hosts = [] }: HostSectionProps) {
  if (!hosts || hosts.length === 0) return null;

  // Group hosts by role
  const groups = hosts.reduce((acc, host) => {
    if (!acc[host.role]) {
      acc[host.role] = [];
    }
    acc[host.role].push(host);
    return acc;
  }, {} as Record<string, Host[]>);

  // We can assign a default color scheme based on the role name or just alternate
  const getRoleTheme = (role: string) => {
    if (role.includes('主催') || role.toLowerCase().includes('host')) {
      return { titleEn: 'HOST', colorClass: 'text-purple-400' };
    }
    if (role.includes('イラスト') || role.toLowerCase().includes('illustration')) {
      return { titleEn: 'ILLUSTRATION', colorClass: 'text-[var(--color-cyan-400)]' };
    }
    if (role.includes('サポーター') || role.toLowerCase().includes('support')) {
      return { titleEn: 'SUPPORTER', colorClass: 'text-amber-400' };
    }
    return { titleEn: 'MEMBER', colorClass: 'text-pink-400' };
  };

  return (
    <section id="host" className="relative py-32 overflow-hidden">
      {/* Background with soft blue gradient and curves */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-[var(--color-cyan-400)]/10 to-[var(--color-cyan-400)]/5 z-0"></div>
      
      {/* Wave-like background decoration */}
      <div className="absolute top-40 left-0 w-full opacity-30 transform -skew-y-3 h-[800px] bg-blue-400/5 blur-3xl z-0 pointer-events-none"></div>

      <div className="max-w-6xl mx-auto px-6 relative z-10 space-y-32">
        
        {Object.entries(groups).map(([role, groupHosts], idx) => {
          const theme = getRoleTheme(role);
          return (
            <div key={idx} className="space-y-20">
              <div className="text-center">
                <h2 className={`text-xl md:text-2xl font-black tracking-[0.5em] ${theme.colorClass} uppercase mb-2`}>{theme.titleEn}</h2>
                <p className="text-4xl md:text-6xl font-black text-foreground tracking-tighter">{role}</p>
              </div>

              <div className="flex flex-wrap justify-center gap-12 max-w-4xl mx-auto">
                {groupHosts.map((host, i) => (
                  <div key={i} className="w-full max-w-sm">
                    <HostCard host={host} />
                  </div>
                ))}
              </div>
            </div>
          );
        })}

      </div>
    </section>
  );
}

function HostCard({ host }: { host: Host }) {
  // Add a fallback for empty icon URL
  const iconUrl = host.iconUrl && host.iconUrl.trim() !== '' ? host.iconUrl : '/images/default-icon.png';

  return (
    <div className="group relative">
      {/* Card Container - Increased pt to avoid icon overlap */}
      <div className="bg-white rounded-[2.5rem] pt-24 pb-12 px-8 shadow-2xl transition-all hover:translate-y-[-8px] hover:shadow-[var(--color-glow)]/30 border border-transparent hover:border-[var(--color-glow)]/20 w-full">
        
        {/* Floating Icon */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full p-2 bg-white shadow-xl transition-transform group-hover:scale-110">
          <div className="relative w-full h-full rounded-full overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center">
            <img 
              src={iconUrl} 
              alt={host.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback icon if image fails to load
                (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" fill="gray"><circle cx="50" cy="50" r="50"/></svg>';
              }}
            />
          </div>
        </div>

        <div className="text-center space-y-6">
          <div className="space-y-1">
            <p className="text-[var(--color-cyan-600)] font-black text-sm tracking-widest">{host.role}</p>
            <h3 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight leading-tight">
              {host.name || 'ゲスト'}
            </h3>
          </div>

          {/* X Button */}
          {host.xUrl && host.xUrl.trim() !== '' && (
            <div className="pt-4 flex justify-center">
              <a 
                href={host.xUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="group/btn relative inline-flex items-center justify-center w-16 h-16 bg-white border border-gray-100 rounded-2xl shadow-lg transition-all hover:bg-gray-50 hover:border-[var(--color-cyan-400)]/30"
                aria-label={`${host.name}のXプロフィールを表示`}
              >
                <svg 
                  className="w-8 h-8 text-gray-900 group-hover/btn:text-[var(--color-cyan-500)] transition-colors" 
                  fill="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
