const fs = require('fs');
let c = fs.readFileSync('src/app/[eventSlug]/page.tsx', 'utf8');

// 1. Add rules to the Prisma include
c = c.replace(/const event = await prisma.event.findUnique\(\{\n\s*where: \{ slug: eventSlug \},\n\s*include: \{\n\s*trackHonbans: true,\n\s*settings: true\n\s*\}\n\s*\}\)/, 
`const event = await prisma.event.findUnique({
    where: { slug: eventSlug },
    include: {
      trackHonbans: true,
      settings: true,
      rules: { orderBy: { order: 'asc' } }
    }
  })`);

// 2. Remove the 3 hardcoded cards
const startIndex = c.indexOf('{/* 01. フェスコンセプト */}');
const scheduleIndex = c.indexOf('{/* Schedule Section */}');

if (startIndex > -1 && scheduleIndex > -1) {
  const newCards = `
            {/* 募集要項 (統合版) */}
            {(event.description || (event.rules && event.rules.length > 0)) && (
              <div className="group relative">
                <div className="relative bg-gradient-to-br from-surface via-background to-surface border border-surface-border p-8 md:p-14 rounded-[2.5rem] overflow-hidden shadow-2xl transition-all group-hover:border-surface-border">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-cyan-400)]/10 blur-[100px] rounded-full pointer-events-none"></div>
                  <div className="relative z-10 space-y-12">
                    <h3 className="text-3xl font-black text-foreground tracking-tighter">募集要項</h3>
                    
                    {event.description && (
                      <div className="prose prose-invert prose-p:text-foreground prose-headings:text-foreground prose-a:text-[var(--color-cyan-400)] max-w-none px-0 custom-quill-content">
                        <div dangerouslySetInnerHTML={{ __html: event.description }} />
                      </div>
                    )}
                    
                    {event.rules && event.rules.length > 0 && (
                      <div className="grid grid-cols-1 gap-4 pt-6 border-t border-surface-border/50">
                        {event.rules.map((rule, i) => (
                          <div key={rule.id} className="flex items-start gap-4 bg-surface/30 p-5 rounded-2xl border border-surface-border/50 hover:border-[var(--color-cyan-400)]/40 transition-all">
                            <span className="text-xs font-black text-[var(--color-cyan-400)] tracking-widest mt-1">[{rule.order > 0 ? rule.order : String(i+1).padStart(2, '0')}]</span>
                            <span className="text-foreground text-lg font-light">{rule.content}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
`;
  
  c = c.substring(0, startIndex) + newCards + '\n          ' + c.substring(scheduleIndex);
  fs.writeFileSync('src/app/[eventSlug]/page.tsx', c);
  console.log('Successfully updated page.tsx');
} else {
  console.log('Could not find markers', startIndex, scheduleIndex);
}
