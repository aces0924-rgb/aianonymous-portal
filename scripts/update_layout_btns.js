const fs = require('fs');
let c = fs.readFileSync('src/app/[eventSlug]/layout.tsx', 'utf8');

c = c.replace(
  /mainColor: theme\.mainColor \|\| '#00f0ff',/,
  `mainColor: theme.mainColor || '#00f0ff',
    btnPrimaryColor: theme.btnPrimaryColor || '#8b5cf6',
    btnSecondaryColor: theme.btnSecondaryColor || '#ea580c',`
);

c = c.replace(
  /'--color-surface': hexToRgb\(themeConfig\.surfaceColor\),/,
  `'--color-surface': hexToRgb(themeConfig.surfaceColor),
          '--color-btn-primary': themeConfig.btnPrimaryColor,
          '--color-btn-secondary': themeConfig.btnSecondaryColor,`
);

fs.writeFileSync('src/app/[eventSlug]/layout.tsx', c);
console.log('Updated layout.tsx');
