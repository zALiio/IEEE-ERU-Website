import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

// Load .env.local if it exists
function loadEnvFile() {
  const filename = fileURLToPath(import.meta.url);
  const dirname = path.dirname(filename);
  const envPath = path.join(dirname, '..', '.env.local');
  try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach((line) => {
      const [key, ...value] = line.split('=');
      if (key && !process.env[key]) {
        process.env[key] = value.join('=').trim();
      }
    });
  } catch (e) {
    // .env.local not found or couldn't be read, continue without it
  }
}
loadEnvFile();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_CSV_PATH = path.join(__dirname, 'members-template.csv');
const DEFAULT_MEMBER_PASSWORD = '123456';

function printUsage() {
  console.log(`
Usage:
  SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/import-members.js [csv-file] [--dry-run]

Options:
  [csv-file]   Path to a CSV file. Defaults to scripts/members-template.csv
  --dry-run    Parse and validate rows without inserting anything

Required CSV columns:
  username,name,phone,email,committee,role,points
`);
}

function parseArgs(argv) {
  const args = { csvPath: DEFAULT_CSV_PATH, dryRun: false };
  for (const value of argv.slice(2)) {
    if (value === '--help' || value === '-h') {
      args.help = true;
    } else if (value === '--dry-run') {
      args.dryRun = true;
    } else if (!value.startsWith('--')) {
      args.csvPath = path.resolve(process.cwd(), value);
    }
  }
  return args;
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        field += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      row.push(field);
      field = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') {
        i += 1;
      }
      row.push(field);
      field = '';
      if (row.some((cell) => cell.trim() !== '')) {
        rows.push(row);
      }
      row = [];
      continue;
    }

    field += char;
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    if (row.some((cell) => cell.trim() !== '')) {
      rows.push(row);
    }
  }

  if (rows.length === 0) {
    return [];
  }

  const headers = rows[0].map((value) => value.trim());
  return rows.slice(1).map((values) => {
    const record = {};
    headers.forEach((header, index) => {
      record[header] = (values[index] ?? '').trim();
    });
    return record;
  });
}

function normalizeNumber(value, fallback = 0) {
  if (value === null || value === undefined || String(value).trim() === '') {
    return fallback;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeUsername(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '');
}

function buildPayload(row) {
  const username = normalizeUsername(row.username || row.name);
  const name = row.name?.trim() || username;
  const payload = {
    username,
    name,
    phone: row.phone?.trim() || null,
    email: row.email?.trim() || null,
    committee: row.committee?.trim() || null,
    role: row.role?.trim() || 'member',
    points: normalizeNumber(row.points, 0),
    password_hash: row.password_hash?.trim() || DEFAULT_MEMBER_PASSWORD,
  };

  if (!payload.username) {
    throw new Error('Missing required value: username');
  }

  return payload;
}

async function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    printUsage();
    return;
  }

  const csvText = await fsp.readFile(args.csvPath, 'utf8');
  const records = parseCsv(csvText);

  if (records.length === 0) {
    console.log('No rows found. Nothing to import.');
    return;
  }

  const payloadByUsername = new Map();
  for (const [index, row] of records.entries()) {
    try {
      const payload = buildPayload(row);
      payloadByUsername.set(payload.username, payload);
    } catch (error) {
      throw new Error(`Row ${index + 2} failed validation: ${error.message}`);
    }
  }

  const payloads = Array.from(payloadByUsername.values());

  console.log(`Loaded ${payloads.length} member rows from ${path.basename(args.csvPath)}.`);

  if (args.dryRun) {
    console.log('Dry run complete. No rows inserted.');
    return;
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_KEY) before running this script.');
  }

  console.log('Connecting to:', supabaseUrl);
  console.log('Key (first 50 chars):', supabaseKey.substring(0, 50) + '...');
  console.log('Key length:', supabaseKey.length);

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const chunkSize = 100;
  let inserted = 0;

  for (let index = 0; index < payloads.length; index += chunkSize) {
    const chunk = payloads.slice(index, index + chunkSize);
    const { error } = await supabase
      .from('members')
      .upsert(chunk, { onConflict: 'username' });
    if (error) {
      console.error('Full error:', JSON.stringify(error, null, 2));
      throw new Error(`Upsert failed for rows ${index + 1}-${index + chunk.length}: ${error.message}`);
    }
    inserted += chunk.length;
    console.log(`Upserted ${inserted}/${payloads.length}`);
  }

  console.log('Import complete.');
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
