import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

function parseCsv(text) {
  const rows = [];
  let i = 0;
  const len = text.length;
  let row = [];
  let field = '';
  let inQuotes = false;
  while (i < len) {
    const ch = text[i];
    const next = text[i+1];
    if (ch === '"') {
      if (inQuotes && next === '"') {
        field += '"';
        i += 2;
        continue;
      }
      inQuotes = !inQuotes;
      i += 1;
      continue;
    }
    if (ch === ',' && !inQuotes) {
      row.push(field);
      field = '';
      i += 1;
      continue;
    }
    if ((ch === '\n' || ch === '\r') && !inQuotes) {
      if (ch === '\r' && text[i+1] === '\n') i += 1;
      row.push(field);
      field = '';
      if (row.some(c => c.trim() !== '')) rows.push(row);
      row = [];
      i += 1;
      continue;
    }
    field += ch;
    i += 1;
  }
  if (field !== '' || row.length) {
    row.push(field);
    if (row.some(c => c.trim() !== '')) rows.push(row);
  }
  if (rows.length === 0) return [];
  const headers = rows[0].map(h => h.trim());
  return rows.slice(1).map(r => {
    const obj = {};
    headers.forEach((h, idx) => { obj[h] = (r[idx] ?? '').trim(); });
    return obj;
  });
}

function chooseHeader(headers, variants) {
  const lowered = headers.map(h => h.toLowerCase());
  for (const v of variants) {
    for (let i = 0; i < lowered.length; i++) {
      if (lowered[i].includes(v)) return headers[i];
    }
  }
  return null;
}

function combineName(firstName, lastName) {
  return [firstName, lastName].map((part) => String(part || '').trim()).filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
}

function buildUsername(firstName, lastName) {
  return [firstName, lastName]
    .map((part) => String(part || '').trim())
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
    .replace(/\s+/g, '');
}

async function main() {
  const argv = process.argv.slice(2);
  if (argv.length === 0) {
    console.log('Usage: node scripts/normalize-accepted.js <input.csv> [output.csv]');
    process.exit(0);
  }
  const input = path.resolve(process.cwd(), argv[0]);
  const output = path.resolve(process.cwd(), argv[1] || path.join(path.dirname(input), 'members-ready-for-import.csv'));
  const raw = await fs.readFile(input, 'utf8');
  const rows = parseCsv(raw);
  if (rows.length === 0) { console.log('No rows'); return; }
  const headers = Object.keys(rows[0]);

  const map = {
    firstName: chooseHeader(headers, ['first name']),
    lastName: chooseHeader(headers, ['last name']),
    email: chooseHeader(headers, ['email','e-mail','gmail','mail']),
    phone: chooseHeader(headers, ['phone','mobile','tel']),
    committee: chooseHeader(headers, ['which position do you want to apply to?', 'committee', 'department', 'position']),
  };

  const outRows = [];
  for (const r of rows) {
    const name = combineName(map.firstName ? r[map.firstName] : '', map.lastName ? r[map.lastName] : '');
    const username = buildUsername(map.firstName ? r[map.firstName] : '', map.lastName ? r[map.lastName] : '');
    const email = map.email ? (r[map.email] || '') : '';
    const phone = map.phone ? (r[map.phone] || '') : '';
    const committee = map.committee ? (r[map.committee] || '') : '';
    const role = 'member';
    const points = '0';

    outRows.push({ username, name, phone, email, committee, role, points });
  }

  // write CSV
  const headerLine = ['username','name','phone','email','committee','role','points'].join(',');
  const escape = (v) => {
    if (v === null || v === undefined) return '';
    const s = String(v);
    if (s.includes(',') || s.includes('"') || s.includes('\n')) return '"' + s.replace(/"/g,'""') + '"';
    return s;
  };
  const lines = [headerLine];
  for (const r of outRows) {
    lines.push([r.username,r.name,r.phone,r.email,r.committee,r.role,r.points].map(escape).join(','));
  }
  await fs.writeFile(output, lines.join('\n'), 'utf8');
  console.log('Wrote', outRows.length, 'rows to', output);
}

main().catch(e=>{ console.error(e); process.exit(1); });
