import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import XLSX from 'xlsx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function usage() {
  console.log(`
Usage:
  node scripts/extract-green-rows.js <input.xlsx> [sheetName] [output.csv]

Examples:
  node scripts/extract-green-rows.js "Recruitment.xlsx" "Form Responses 1" accepted.csv
  node scripts/extract-green-rows.js scripts/Recruitment.xlsx

Notes:
- The script inspects cell fill colors (if available) and treats a row as "accepted" if any cell in the row has a green-ish fill.
    console.log([
      'Usage:',
      '  node scripts/extract-green-rows.js <input.xlsx> [sheetName] [output.csv]',
      '',
      'Examples:',
      '  node scripts/extract-green-rows.js "Recruitment.xlsx" "Form Responses 1" accepted.csv',
      '  node scripts/extract-green-rows.js scripts/Recruitment.xlsx',
      '',
      'Notes:',
      '  - Installs: run npm install xlsx before using.',
      '  - The script inspects cell fill colors (if available) and treats a row as "accepted" if any cell in the row has a green-ish fill.',
    ].join('\n'));
`);
}

function hexToRgb(hex) {
  if (!hex) return null;
  hex = hex.replace(/^#|^0x/ig, '');
  if (hex.length === 8) hex = hex.slice(2); // remove alpha if present (AARRGGBB)
  if (hex.length !== 6) return null;
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return { r, g, b };
}

function isGreenishColor(colorObj) {
  if (!colorObj) return false;
  // colorObj may be { rgb: 'FF00FF00' } or { rgb: '00FF00' }
  const rgbRaw = (colorObj?.rgb || colorObj?.theme || colorObj?.indexed);
  let rgb = null;
  if (typeof rgbRaw === 'string') {
    rgb = hexToRgb(rgbRaw.replace(/^0x/i, '').replace(/^FF/i, ''));
  }
  if (!rgb) return false;
  // greenish heuristic: G is dominant and sufficiently bright
  return rgb.g > 100 && rgb.g > rgb.r + 20 && rgb.g > rgb.b + 20;
}

function rowHasGreenFill(ws, r, range) {
  const fromCol = range.s.c;
  const toCol = range.e.c;
  for (let c = fromCol; c <= toCol; c += 1) {
    const cellAddress = XLSX.utils.encode_cell({ r, c });
    const cell = ws[cellAddress];
    if (cell && cell.s) {
      // Different XLSX builds store fill info in different places
      // Try common locations: cell.s.fgColor, cell.s.fill.fgColor, or the style object itself
      const fg = cell.s.fgColor || (cell.s.fill && (cell.s.fill.fgColor || cell.s.fill.fg)) || cell.s;
      if (isGreenishColor(fg)) return true;
    }
  }
  return false;
}

async function main() {
  const argv = process.argv.slice(2);
  if (argv.length === 0 || argv.includes('--help') || argv.includes('-h')) {
    usage();
    return;
  }

  const inputPath = path.resolve(process.cwd(), argv[0]);
  const sheetName = argv[1] || null;
  const outputPath = argv[2] || path.join(path.dirname(inputPath), 'accepted-members.csv');

  if (!(await fs.stat(inputPath).catch(() => false))) {
    console.error('Input file not found:', inputPath);
    process.exit(1);
  }

  // Read workbook with styles
  const wb = XLSX.readFile(inputPath, { cellStyles: true });
  const sheetNames = wb.SheetNames;
  const targetSheet = sheetName || sheetNames[0];
  if (!wb.Sheets[targetSheet]) {
    console.error('Sheet not found:', targetSheet);
    process.exit(1);
  }

  const ws = wb.Sheets[targetSheet];
  const range = XLSX.utils.decode_range(ws['!ref']);

  // Convert to JSON rows but keep raw cells
  const headerRange = XLSX.utils.encode_range({ s: { r: range.s.r, c: range.s.c }, e: { r: range.s.r, c: range.e.c } });
  const headerRow = XLSX.utils.sheet_to_json(ws, { header: 1, range: headerRange, raw: true })[0];
  if (!headerRow) {
    console.error('No header row found');
    process.exit(1);
  }
  const rowsRange = XLSX.utils.encode_range({ s: { r: range.s.r + 1, c: range.s.c }, e: { r: range.e.r, c: range.e.c } });
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, range: rowsRange, raw: true });

  const accepted = [];
  for (let i = 0; i < rows.length; i += 1) {
    const rowIndex = range.s.r + 1 + i;
    if (rowHasGreenFill(ws, rowIndex, range)) {
      accepted.push(rows[i]);
    }
  }

  if (accepted.length === 0) {
    console.log('No green-highlighted rows found.');
  } else {
    // Build CSV string from headerRow + accepted rows
    const escapeCell = (v) => {
      if (v === null || v === undefined) return '';
      const s = String(v);
      if (s.includes(',') || s.includes('\"') || s.includes('\n')) return '"' + s.replace(/"/g, '""') + '"';
      return s;
    };

    const lines = [];
    lines.push(headerRow.map(escapeCell).join(','));
    for (const r of accepted) lines.push(r.map(escapeCell).join(','));

    await fs.writeFile(outputPath, lines.join('\n'), 'utf8');
    console.log(`Wrote ${accepted.length} accepted rows to ${outputPath}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
