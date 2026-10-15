// Build the offline deliverable from the editable dist files (Node.js).
const fs = require('fs');
const html = fs.readFileSync(__dirname + '/dist/index.html', 'utf8');
const css = fs.readFileSync(__dirname + '/dist/style.css', 'utf8');
const js = fs.readFileSync(__dirname + '/dist/game.js', 'utf8');
new (require('vm').Script)(js);
const bundled = html.replace('<link rel="stylesheet" href="style.css">', () => '<style>' + css + '</style>')
  .replace('<script src="game.js"></script>', () => '<script>' + js + '</script>');
fs.writeFileSync(__dirname + '/BREACH.html', bundled, 'utf8');
console.log('Built self-contained BREACH.html (' + Buffer.byteLength(bundled) + ' bytes).');
