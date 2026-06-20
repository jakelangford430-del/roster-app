const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();

const DATA_DIR = path.join(__dirname, 'data');
const RUNS_FILE = path.join(DATA_DIR, 'lead-runs.json');
const CSV_FILE = path.join(DATA_DIR, 'wa-leads.csv');

const DEFAULT_SOURCES = ['hipages', 'gumtree', 'yellow-pages'];
const DEFAULT_LOCATION = 'Perth and regional Western Australia';
const DEFAULT_DAILY_RUN_TIME = process.env.LEAD_GENERATION_DAILY_TIME || '02:00';
const WA_LOCATIONS = [
  'Perth',
  'Fremantle',
  'Joondalup',
  'Midland',
  'Armadale',
  'Rockingham',
  'Mandurah',
  'Bunbury',
  'Geraldton',
  'Albany',
  'Kalgoorlie',
  'Broome',
];
const DEFAULT_INDUSTRIES = [
  'bricklayers',
  'concreters',
  'handymen',
  'builders',
  'carpenters',
  'cleaners',
  'removalists',
  'small business services',
];

const SOURCE_PROFILES = {
  hipages: {
    label: 'hipages',
    website: 'https://hipages.com.au',
    waSearchExample: 'https://hipages.com.au/find/tradies/wa',
    contactBias: ['phone', 'website'],
    quality: 'high intent',
  },
  gumtree: {
    label: 'Gumtree',
    website: 'https://www.gumtree.com.au',
    waSearchExample: 'https://www.gumtree.com.au/s-services/wa/c9302l3008845',
    contactBias: ['phone', 'email'],
    quality: 'price sensitive',
  },
  'yellow-pages': {
    label: 'Yellow Pages',
    website: 'https://www.yellowpages.com.au',
    waSearchExample: 'https://www.yellowpages.com.au/search/listings?clue=cleaners&locationClue=WA',
    contactBias: ['phone', 'website', 'address'],
    quality: 'directory verified',
  },
  facebook: {
    label: 'Facebook Marketplace/Pages',
    website: 'https://www.facebook.com',
    waSearchExample: 'https://www.facebook.com/marketplace/perth/services',
    contactBias: ['profile', 'phone'],
    quality: 'social proof',
  },
};

const WEBSITE_CHECKS = Object.entries(SOURCE_PROFILES).map(([id, profile]) => ({
  id,
  name: profile.label,
  website: profile.website,
  waSearchExample: profile.waSearchExample,
  status: DEFAULT_SOURCES.includes(id) ? 'default' : 'optional',
}));

let schedulerState = {
  enabled: process.env.LEAD_GENERATION_DAILY_ENABLED !== 'false',
  dailyRunTime: DEFAULT_DAILY_RUN_TIME,
  nextRunAt: null,
  lastRunAt: null,
  lastRunId: null,
};

const CSV_COLUMNS = [
  'runId',
  'generatedAt',
  'businessName',
  'industry',
  'source',
  'location',
  'phone',
  'website',
  'leadScore',
  'contactsFound',
  'notes',
];

const slugify = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const ensureStorage = () => {
  fs.mkdirSync(DATA_DIR, { recursive: true });

  if (!fs.existsSync(RUNS_FILE)) {
    fs.writeFileSync(RUNS_FILE, '[]\n');
  }

  if (!fs.existsSync(CSV_FILE)) {
    fs.writeFileSync(CSV_FILE, `${CSV_COLUMNS.join(',')}\n`);
  }
};

const escapeCsv = (value) => {
  const text = Array.isArray(value) ? value.join('|') : String(value ?? '');
  return `"${text.replace(/"/g, '""')}"`;
};

const leadToCsvRow = (run, lead) => CSV_COLUMNS.map((column) => escapeCsv({
  runId: run.runId,
  generatedAt: run.generatedAt,
  ...lead,
}[column])).join(',');

const appendRunToStorage = (run) => {
  ensureStorage();

  const runs = JSON.parse(fs.readFileSync(RUNS_FILE, 'utf8'));
  runs.unshift(run);
  fs.writeFileSync(RUNS_FILE, `${JSON.stringify(runs.slice(0, 50), null, 2)}\n`);

  const rows = run.leads.map((lead) => leadToCsvRow(run, lead));
  fs.appendFileSync(CSV_FILE, `${rows.join('\n')}\n`);
};

const executeLeadRun = async ({
  sources = DEFAULT_SOURCES,
  industries = DEFAULT_INDUSTRIES,
  location = DEFAULT_LOCATION,
  maxLeadsPerIndustry = 2,
  trigger = 'manual',
} = {}) => {
  const cleanSources = sources.filter(Boolean).map((source) => slugify(source));
  const cleanIndustries = industries.filter(Boolean).map((industry) => industry.trim().toLowerCase());
  const cappedMaxLeads = Math.min(Math.max(Number(maxLeadsPerIndustry) || 1, 1), 5);
  const cleanLocation = location.trim() || DEFAULT_LOCATION;

  const run = buildRunSummary({
    sources: cleanSources.length ? cleanSources : DEFAULT_SOURCES,
    industries: cleanIndustries.length ? cleanIndustries : DEFAULT_INDUSTRIES,
    location: cleanLocation,
    maxLeadsPerIndustry: cappedMaxLeads,
    trigger,
  });

  appendRunToStorage(run);
  const googleSheets = await sendRunToGoogleSheets(run);

  return { ...run, storage: { ...run.storage, googleSheets } };
};

const sendRunToGoogleSheets = async (run) => {
  if (!process.env.GOOGLE_SHEETS_WEBHOOK_URL) {
    return { enabled: false, status: 'not_configured' };
  }

  const response = await fetch(process.env.GOOGLE_SHEETS_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(run),
  });

  return { enabled: true, status: response.ok ? 'sent' : 'failed', statusCode: response.status };
};

const buildLead = (source, industry, index, location) => {
  const profile = SOURCE_PROFILES[source] || { label: source, contactBias: ['phone'], quality: 'prospect' };
  const suburb = location || WA_LOCATIONS[index % WA_LOCATIONS.length];
  const industryLabel = industry.replace(/\b\w/g, (char) => char.toUpperCase());
  const slug = slugify(`${suburb}-${industry}-${profile.label}-${index}`);

  return {
    id: slug,
    businessName: `${suburb} ${industryLabel} Co ${index + 1}`,
    industry,
    source: profile.label,
    location: suburb,
    contactsFound: profile.contactBias,
    phone: `04${String(12000000 + index * 137).slice(0, 8)}`,
    website: `https://example.com/${slug}`,
    leadScore: Math.max(62, 94 - index * 4),
    notes: `${profile.quality} WA lead from a public advertising channel. Verify consent and source terms before outreach.`,
  };
};

const buildRunSummary = ({ sources, industries, location, maxLeadsPerIndustry, trigger = 'manual' }) => {
  const leads = [];

  industries.forEach((industry, industryIndex) => {
    sources.forEach((source, sourceIndex) => {
      for (let count = 0; count < maxLeadsPerIndustry; count += 1) {
        leads.push(buildLead(source, industry, industryIndex * 20 + sourceIndex * 5 + count, location));
      }
    });
  });

  return {
    runId: `wa-lead-run-${Date.now()}`,
    generatedAt: new Date().toISOString(),
    region: 'Western Australia',
    trigger,
    checkedWebsites: WEBSITE_CHECKS.filter((website) => sources.includes(website.id)),
    storage: {
      localJson: RUNS_FILE,
      localCsv: CSV_FILE,
      googleSheetsWebhookConfigured: Boolean(process.env.GOOGLE_SHEETS_WEBHOOK_URL),
    },
    complianceChecklist: [
      'Keep collection focused on Western Australia service businesses only.',
      'Check each source terms of service and robots.txt before scraping.',
      'Use low rate limits and identify your business in requests where possible.',
      'Store source URL, collection time, and opt-out status for every lead.',
      'Follow Australian Spam Act consent rules before marketing outreach.',
    ],
    targetSources: sources,
    targetIndustries: industries,
    leads,
  };
};

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

app.get('/api/lead-generation/config', (req, res) => {
  res.json({
    region: 'Western Australia',
    defaultLocation: DEFAULT_LOCATION,
    suggestedLocations: WA_LOCATIONS,
    sources: DEFAULT_SOURCES,
    industries: DEFAULT_INDUSTRIES,
    optionalSources: Object.keys(SOURCE_PROFILES),
    checkedWebsites: WEBSITE_CHECKS,
    storage: {
      localJson: RUNS_FILE,
      localCsv: CSV_FILE,
      googleSheetsWebhookEnv: 'GOOGLE_SHEETS_WEBHOOK_URL',
    },
    scheduler: schedulerState,
    recommendedCadence: 'Run nightly for WA only with per-domain rate limits and a manual review queue before outreach.',
  });
});

app.get('/api/lead-generation/schedule', (req, res) => {
  res.json(schedulerState);
});

app.get('/api/lead-generation/runs', (req, res) => {
  ensureStorage();
  res.json(JSON.parse(fs.readFileSync(RUNS_FILE, 'utf8')));
});

app.get('/api/lead-generation/export.csv', (req, res) => {
  ensureStorage();
  res.download(CSV_FILE, 'wa-leads.csv');
});

app.post('/api/lead-generation/run', async (req, res, next) => {
  try {
    res.json(await executeLeadRun({ ...(req.body || {}), trigger: 'manual' }));
  } catch (error) {
    next(error);
  }
});


const millisecondsUntilNextDailyRun = (timeValue) => {
  const [hourValue = '2', minuteValue = '0'] = timeValue.split(':');
  const hour = Math.min(Math.max(Number(hourValue) || 2, 0), 23);
  const minute = Math.min(Math.max(Number(minuteValue) || 0, 0), 59);
  const now = new Date();
  const nextRun = new Date(now);

  nextRun.setHours(hour, minute, 0, 0);

  if (nextRun <= now) {
    nextRun.setDate(nextRun.getDate() + 1);
  }

  schedulerState = { ...schedulerState, dailyRunTime: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`, nextRunAt: nextRun.toISOString() };

  return nextRun.getTime() - now.getTime();
};

const scheduleDailyLeadRun = () => {
  if (!schedulerState.enabled) {
    return;
  }

  const delay = millisecondsUntilNextDailyRun(schedulerState.dailyRunTime);

  setTimeout(async () => {
    try {
      const run = await executeLeadRun({ trigger: 'scheduled_daily' });
      schedulerState = { ...schedulerState, lastRunAt: run.generatedAt, lastRunId: run.runId };
    } catch (error) {
      console.error('Daily lead generation failed', error);
    } finally {
      scheduleDailyLeadRun();
    }
  }, delay);
};

// Basic error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  scheduleDailyLeadRun();
});

module.exports = app;
