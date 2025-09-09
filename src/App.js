import React, { useState, useEffect } from 'react';
import './App.css';

function parseCSV(text) {
  const lines = text.trim().split('\n').filter(line => line.trim() !== '');
  const headers = lines[0].split(';');
  return lines.slice(1)
    .filter(line => line.split(';').length === headers.length)
    .map(line => {
      const values = line.split(';');
      const obj = {};
      headers.forEach((header, i) => {
        obj[header] = values[i];
      });
      return obj;
    });
}

function getRandomPlayer(players) {
  return players[Math.floor(Math.random() * players.length)];
}

function App() {
  const [players, setPlayers] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [guess, setGuess] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isCorrect, setIsCorrect] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(process.env.PUBLIC_URL + '/sports_data.csv')
      .then(res => res.text())
      .then(text => {
        const parsed = parseCSV(text);
        // Only show players with FG > 4
        const filtered = parsed.filter(p => {
          const fg = parseFloat(p.FG);
          return !isNaN(fg) && fg > 4;
        });
        setPlayers(filtered);
        setCurrentPlayer(getRandomPlayer(filtered));
        setLoading(false);
      });
  }, []);

  const handleGuess = (e) => {
    e.preventDefault();
    if (!currentPlayer) return;
    if (guess.trim().toLowerCase() === currentPlayer['Player'].trim().toLowerCase()) {
      setFeedback('Correct!');
      setIsCorrect(true);
    } else {
      setFeedback(`Incorrect! The correct answer is ${currentPlayer['Player']}`);
      setIsCorrect(false);
    }
  };

  const handleNext = () => {
    setCurrentPlayer(getRandomPlayer(players));
    setGuess('');
    setFeedback('');
    setIsCorrect(null);
  };

  const appBgStyle = {
    minHeight: '100vh',
    width: '100vw',
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: -1,
    backgroundImage: 'url("/nba_logo.jpg")',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    opacity: 0.75,
  };

  if (loading) {
    return <div className="App"><h2>Loading player stats...</h2></div>;
  }

  if (!currentPlayer) {
    return <div className="App"><h2>No player data found.</h2></div>;
  }

  // Only show the required fields with custom display names
  const statMap = {
    Pos: 'Position',
    Tm: 'Team',
    PTS: 'Points',
    '3P': '3-Point Field Goals',
    AST: 'Assists',
    STL: 'Steals',
    BLK: 'Blocks',
    DRB: 'Defensive Rebounds',
  };
  const statKeys = Object.keys(statMap);

  return (
    <>
      <div style={appBgStyle}></div>
      <div className="App" style={{ maxWidth: 900, margin: '2rem auto', padding: '2rem', background: 'linear-gradient(135deg, #e3f2fd 0%, #fce4ec 100%)', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
        <h2 style={{ textAlign: 'center', color: '#1976d2', marginBottom: '1.5rem', fontWeight: 700 }}>Guess the NBA Player!</h2>
        <div style={{ marginBottom: '1.5rem', background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: '1rem' }}>
          <h4 style={{ color: '#000', marginBottom: '1rem', fontWeight: 600 }}>Player Statistics (2023-2024):</h4>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem', fontSize: '1rem' }}>
            <thead>
              <tr>
                {statKeys.map(key => (
                  <th key={key} style={{ borderBottom: '2px solid #1976d2', padding: '0.75rem', textAlign: 'left', background: '#e3f2fd', color: '#1976d2' }}>{statMap[key]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {statKeys.map(key => (
                  <td key={key} style={{ padding: '0.75rem', borderBottom: '1px solid #eee', background: '#fff' }}>{currentPlayer[key]}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        <form onSubmit={handleGuess} style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <input
            type="text"
            value={guess}
            onChange={e => setGuess(e.target.value)}
            placeholder="Enter the player name"
            style={{ padding: '0.75rem', width: '60%', fontSize: '1rem', borderRadius: 6, border: '1px solid #bdbdbd', marginRight: '0.75rem' }}
          />
          <button type="submit" style={{ padding: '0.75rem 1.5rem', background: '#1976d2', color: 'white', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: '1rem', cursor: 'pointer' }}>Guess</button>
        </form>
        {feedback && (
          <div style={{
            marginBottom: '1rem',
            fontWeight: 'bold',
            padding: '1rem',
            borderRadius: 8,
            background: isCorrect === true ? '#c8e6c9' : '#ffcdd2',
            color: isCorrect === true ? '#388e3c' : '#b71c1c',
            border: isCorrect === true ? '2px solid #388e3c' : '2px solid #b71c1c',
            textAlign: 'center',
          }}>
            {feedback}
          </div>
        )}
        <button onClick={handleNext} style={{ padding: '0.75rem 1.5rem', background: '#d81b60', color: 'white', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: '1rem', cursor: 'pointer' }}>Try Another Player</button>
      </div>
    </>
  );
}

export default App;
