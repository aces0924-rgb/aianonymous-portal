const fs = require('fs');
let c = fs.readFileSync('src/app/admin/events/[id]/settings/page.tsx', 'utf8');

if (!c.includes('ToastSubmitButton')) {
  c = c.replace(/import \{ logout \} from '\.\.\/\.\.\/login\/actions'/, "import { logout } from '../../login/actions'\nimport { ToastSubmitButton } from '@/components/admin/ToastSubmitButton'");
}

c = c.replace(/<button type="submit" className="([^"]+)">([^<]+)<\/button>/g, (match, cls, label) => {
  if (cls.includes('text-red-600') && cls.includes('bg-red-100')) {
    return match; // skip logout button
  }
  return `<ToastSubmitButton label="${label}" className="${cls}" />`;
});

fs.writeFileSync('src/app/admin/events/[id]/settings/page.tsx', c);
