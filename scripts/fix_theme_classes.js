const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    if (fs.statSync(dirPath).isDirectory()) {
      walkDir(dirPath, callback);
    } else {
      callback(dirPath);
    }
  });
}

walkDir('src', function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    // Backgrounds
    content = content.replace(/bg-black/g, 'bg-background');
    content = content.replace(/bg-gray-950/g, 'bg-surface');
    content = content.replace(/bg-gray-900/g, 'bg-surface');
    
    // Borders
    content = content.replace(/border-gray-800/g, 'border-surface-border');
    content = content.replace(/border-gray-700/g, 'border-surface-border');
    content = content.replace(/border-gray-900/g, 'border-surface-border');

    // Text on main structures (Heuristic: "text-white" followed by basic layout classes, but it's safer to just replace it in the page.tsx <main> tag and similar wrappers)
    // Actually, text-white is used everywhere. A safer bet is to leave text-white for components unless they are headers. But wait, if the theme is white, text-white is invisible.
    // Let's replace text-white with text-foreground globally, but revert it on known primary buttons?
    // Let's just do a smart regex for `<main ... text-white` and `<body ... text-white`
    content = content.replace(/className="([^"]*)text-white([^"]*)"/g, (match, p1, p2) => {
        // If it also contains bg-cyan, bg-purple, bg-fuchsia, bg-blue, bg-red, etc., keep it white
        if (match.match(/bg-(cyan|purple|fuchsia|blue|red|amber|pink|green|yellow|indigo)-[45678]00/)) {
            return match; // Keep text-white
        }
        // If it contains text-white/50, leave it or change to text-foreground/50
        if (match.includes('text-white/')) {
            return match.replace(/text-white\//g, 'text-foreground/');
        }
        return `className="${p1}text-foreground${p2}"`;
    });

    // Replace glow colors
    content = content.replace(/var\(--color-cyan-400\)/g, 'var(--color-glow)');

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      console.log('Fixed classes in', filePath);
    }
  }
});
