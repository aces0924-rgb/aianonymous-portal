const fs = require('fs');
let c = fs.readFileSync('src/app/[eventSlug]/page.tsx', 'utf8');

// 1. Remove the duplicated Schedule and Guidelines sections (the old hardcoded ones)
// We know they start after the first Guidelines section.
// The first guidelines section ends right before the second schedule section.
const lines = c.split('\n');

const firstGuidelinesIdx = lines.findIndex(l => l.includes('<section id="guidelines"'));
const secondScheduleIdx = lines.findIndex((l, i) => i > firstGuidelinesIdx && l.includes('<section id="schedule"'));
const faqIdx = lines.findIndex(l => l.includes('<section id="faq"'));

console.log('firstGuidelinesIdx:', firstGuidelinesIdx);
console.log('secondScheduleIdx:', secondScheduleIdx);
console.log('faqIdx:', faqIdx);

if (secondScheduleIdx !== -1 && faqIdx !== -1 && secondScheduleIdx < faqIdx) {
  // Remove lines from secondScheduleIdx up to faqIdx (exclusive)
  lines.splice(secondScheduleIdx, faqIdx - secondScheduleIdx);
  c = lines.join('\n');
}

// 2. Replace the new guidelines block with the mapped card layout
// The new guidelines block currently has a loop for event.rules that renders a simple list.
const targetText = `                    {event.rules && event.rules.length > 0 && (
                      <div className="grid grid-cols-1 gap-4 pt-6 border-t border-surface-border/50">
                        {event.rules.map((rule, i) => (
                          <div key={rule.id} className="flex items-start gap-4 bg-surface/30 p-5 rounded-2xl border border-surface-border/50 hover:border-[var(--color-cyan-400)]/40 transition-all">
                            <span className="text-xs font-black text-[var(--color-cyan-400)] tracking-widest mt-1">[{rule.order > 0 ? rule.order : String(i+1).padStart(2, '0')}]</span>
                            <span className="text-foreground text-lg font-light">{rule.content}</span>
                          </div>
                        ))}
                      </div>
                    )}`;

const newCardsText = `                    {event.rules && event.rules.length > 0 && (
                      <div className="space-y-16 pt-10">
                        {event.rules.map((rule, i) => (
                          <div key={rule.id} className="group relative">
                            <div className="absolute top-0 left-0 -translate-x-6 -translate-y-8 text-9xl font-black text-[var(--color-cyan-400)]/10 select-none group-hover:text-[var(--color-cyan-400)]/20 transition-colors pointer-events-none">
                              {rule.order > 0 ? String(rule.order).padStart(2, '0') : String(i + 1).padStart(2, '0')}
                            </div>
                            <div className="relative bg-gradient-to-br from-surface via-background to-surface border border-surface-border p-8 md:p-14 rounded-[2.5rem] overflow-hidden shadow-2xl transition-all group-hover:border-surface-border">
                              <div className={\`absolute \${i % 2 === 0 ? 'top-0' : 'bottom-0'} right-0 w-64 h-64 bg-[var(--color-cyan-400)]/10 blur-[100px] rounded-full pointer-events-none\`}></div>
                              <div className="flex flex-col md:flex-row gap-10 items-start relative z-10">
                                <div className="flex-shrink-0">
                                  <span className="flex items-center justify-center w-16 h-16 rounded-3xl bg-[var(--color-cyan-400)]/10 text-[var(--color-cyan-400)] border border-[var(--color-cyan-400)]/20 text-3xl shadow-[0_0_30px_var(--color-glow)]">
                                    {rule.icon || '✨'}
                                  </span>
                                </div>
                                <div className="space-y-8 flex-1">
                                  <h3 className="text-3xl font-black text-foreground tracking-tighter">{rule.title || '募集要項'}</h3>
                                  <div 
                                    className="space-y-6 text-lg md:text-xl text-foreground leading-relaxed font-light custom-rule-content prose prose-invert prose-p:text-foreground prose-headings:text-foreground prose-a:text-[var(--color-cyan-400)] max-w-none"
                                    dangerouslySetInnerHTML={{ __html: rule.content }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}`;

if (c.includes(targetText)) {
  c = c.replace(targetText, newCardsText);
  console.log('Replaced simple list with card layout');
} else {
  console.log('Could not find targetText to replace');
}

fs.writeFileSync('src/app/[eventSlug]/page.tsx', c);
console.log('Updated page.tsx completely');
