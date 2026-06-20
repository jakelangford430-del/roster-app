import React, { useState, useEffect } from 'react';
import './App.css';

const API_BASE = 'http://localhost:5000/api';
const DEFAULT_INDUSTRIES = 'bricklayers, concreters, handyman, builders, carpenters, cleaners, removalists, small business services';
const DEFAULT_LOCATION = 'Perth and regional Western Australia';

function App() {
  const [status, setStatus] = useState('Loading...');
  const [sources, setSources] = useState(['hipages', 'gumtree', 'yellow-pages']);
  const [industries, setIndustries] = useState(DEFAULT_INDUSTRIES);
  const [location, setLocation] = useState(DEFAULT_LOCATION);
  const [maxLeadsPerIndustry, setMaxLeadsPerIndustry] = useState(2);
  const [run, setRun] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState('');
  const [config, setConfig] = useState(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch(`${API_BASE}/health`);
        const data = await response.json();
        setStatus(data.status);
      } catch (requestError) {
        setStatus('Server is not running');
      }
    };

    const loadConfig = async () => {
      try {
        const response = await fetch(`${API_BASE}/lead-generation/config`);
        setConfig(await response.json());
      } catch (requestError) {
        setConfig(null);
      }
    };

    checkHealth();
    loadConfig();
  }, []);

  const toggleSource = (source) => {
    setSources((currentSources) => (
      currentSources.includes(source)
        ? currentSources.filter((item) => item !== source)
        : [...currentSources, source]
    ));
  };

  const runLeadGeneration = async (event) => {
    event.preventDefault();
    setIsRunning(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE}/lead-generation/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sources,
          industries: industries.split(',').map((item) => item.trim()).filter(Boolean),
          location,
          maxLeadsPerIndustry,
        }),
      });

      if (!response.ok) {
        throw new Error('Lead generation request failed');
      }

      setRun(await response.json());
    } catch (requestError) {
      setError('Unable to start the lead generation run. Check the backend connection and try again.');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="App">
      <header className="hero">
        <div>
          <p className="eyebrow">Lead generation automation</p>
          <h1>Find Western Australian service businesses advertising across public directories</h1>
          <p className="hero-copy">
            Configure a compliant Western Australia prospecting run for hipages, Gumtree, Yellow Pages, cleaners,
            removalists, trades, and other small businesses that publicly advertise their services.
          </p>
        </div>
        <div className="status-card">
          <span>Backend Status</span>
          <strong>{status}</strong>
        </div>
      </header>

      <main className="dashboard">
        <section className="panel form-panel">
          <h2>Automation setup</h2>
          <p>
            This planner generates the WA run configuration, stores each run on the backend, and prepares a CSV
            that can be opened directly in Google Sheets. Connect approved source adapters only after confirming terms, robots.txt, and consent rules.
          </p>

          <form onSubmit={runLeadGeneration}>
            <label>
              Target WA location
              <input value={location} onChange={(event) => setLocation(event.target.value)} />
            </label>

            <label>
              Industries and service categories
              <textarea
                value={industries}
                onChange={(event) => setIndustries(event.target.value)}
                rows="4"
              />
            </label>

            <fieldset>
              <legend>Public advertising sources</legend>
              {['hipages', 'gumtree', 'yellow-pages', 'facebook'].map((source) => (
                <label className="checkbox" key={source}>
                  <input
                    type="checkbox"
                    checked={sources.includes(source)}
                    onChange={() => toggleSource(source)}
                  />
                  {source.replace('-', ' ')}
                </label>
              ))}
            </fieldset>

            <label>
              Leads per industry/source
              <input
                type="number"
                min="1"
                max="5"
                value={maxLeadsPerIndustry}
                onChange={(event) => setMaxLeadsPerIndustry(event.target.value)}
              />
            </label>

            <button type="submit" disabled={isRunning || sources.length === 0}>
              {isRunning ? 'Running automation...' : 'Run lead generation'}
            </button>
          </form>
          {error && <p className="error">{error}</p>}

          {config && (
            <div className="website-panel">
              <h3>Websites checked</h3>
              <ul>
                {config.checkedWebsites.map((website) => (
                  <li key={website.id}>
                    <strong>{website.name}</strong>
                    <a href={website.website}>{website.website}</a>
                    <span>{website.status === 'default' ? 'Runs by default' : 'Optional source'}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <section className="panel results-panel">
          <h2>Run output</h2>
          <a className="export-link" href={`${API_BASE}/lead-generation/export.csv`}>Download WA leads CSV for Google Sheets</a>
          {config && (
            <p className="schedule-note">
              Daily autorun is {config.scheduler.enabled ? 'enabled' : 'disabled'} at {config.scheduler.dailyRunTime}.
              {config.scheduler.nextRunAt ? ` Next run: ${new Date(config.scheduler.nextRunAt).toLocaleString()}.` : ' It will schedule when the backend starts.'}
            </p>
          )}
          {!run && <p className="empty-state">Run the automation to preview leads and compliance checks.</p>}
          {run && (
            <>
              <div className="metrics">
                <div><span>Leads</span><strong>{run.leads.length}</strong></div>
                <div><span>Sources</span><strong>{run.targetSources.length}</strong></div>
                <div><span>Industries</span><strong>{run.targetIndustries.length}</strong></div>
              </div>

              <div className="storage-note">
                <strong>Stored locally:</strong> {run.storage.localCsv}
                <span>Upload this CSV to Google Sheets, or set GOOGLE_SHEETS_WEBHOOK_URL to push future runs automatically.</span>
              </div>

              <h3>Compliance checklist</h3>
              <ul className="checklist">
                {run.complianceChecklist.map((item) => <li key={item}>{item}</li>)}
              </ul>

              <div className="lead-list">
                {run.leads.slice(0, 8).map((lead) => (
                  <article className="lead-card" key={lead.id}>
                    <div>
                      <h3>{lead.businessName}</h3>
                      <p>{lead.industry} • {lead.location} • {lead.source}</p>
                    </div>
                    <strong>{lead.leadScore}</strong>
                    <small>{lead.notes}</small>
                  </article>
                ))}
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
