const fs = require('fs');
let c = fs.readFileSync('prisma/schema.prisma', 'utf8');

c = c.replace(
  /model Rule \{\n  id      Int    @id @default\(autoincrement\(\)\)\n  eventId String\n  event   Event  @relation\(fields: \[eventId\], references: \[id\], onDelete: Cascade\)\n  content String/,
  `model Rule {
  id      Int    @id @default(autoincrement())
  eventId String
  event   Event  @relation(fields: [eventId], references: [id], onDelete: Cascade)
  title   String @default("タイトル")
  icon    String @default("✨")
  content String`
);

fs.writeFileSync('prisma/schema.prisma', c);
console.log('Updated schema.prisma');
