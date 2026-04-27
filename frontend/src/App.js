import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [status, setStatus] = useState('Loading...');

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/health');
        const data = await response.json();
        setStatus(data.status);
      } catch (error) {
        setStatus('Server is not running');
      }
    };

    checkHealth();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Roster Management App</h1>
        <p>Backend Status: {status}</p>
      </header>
      <main>
        <section>
          <h2>Welcome to Roster App</h2>
          <p>A comprehensive solution for roster and time management.</p>
        </section>
      </main>
    </div>
  );
}

export default App;
