const fs = require('fs');

function fixPage(path) {
  if (!fs.existsSync(path)) return;
  let c = fs.readFileSync(path, 'utf8');

  c = c.replace(
    `const allUserPlaylists = await getAllPlaylistsByUserName(playlist.userName);`,
    `const allUserPlaylists = await getAllPlaylistsByUserName(eventSlug, playlist.userName);`
  );

  c = c.replace(
    `const allUserPlaylists = await getAllIllustrationPlaylistsByUserName(playlist.userName);`,
    `const allUserPlaylists = await getAllIllustrationPlaylistsByUserName(eventSlug, playlist.userName);`
  );

  fs.writeFileSync(path, c);
  console.log('Fixed', path);
}

fixPage('src/app/[eventSlug]/selection/[id]/page.tsx');
fixPage('src/app/[eventSlug]/selection/illustration/[id]/page.tsx');

