import { useState, useEffect, useRef } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom'
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa'
import './App.css'
import CandidateForm from './components/CandidateForm'
import './components/CandidateForm.css'
import PartyChart from './components/PartyChart'
import { getCandidates, addCandidate, updateCandidate, deleteCandidate, registerUser, loginUser, vote as voteApi } from './api'

function NavBar() {
  return (
    <nav className="navbar">
      <Link to="/admin">Admin</Link>
      <Link to="/">Vote</Link>
      <Link to="/fake-news">Fake News</Link>
    </nav>
  );
}

function AdminPage() {
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [view, setView] = useState('details');
  const [generating, setGenerating] = useState(false);
  const generatorRef = useRef(null);

  useEffect(() => {
    let polling = true;
    const fetchCandidates = async () => {
      try {
        const res = await getCandidates();
        setCandidates(res.data);
      } catch (err) {}
    };
    fetchCandidates();
    const interval = setInterval(() => {
      if (polling) fetchCandidates();
    }, 2000);
    return () => {
      polling = false;
      clearInterval(interval);
      if (generatorRef.current) clearInterval(generatorRef.current);
    };
  }, []);

  useEffect(() => {
    if (candidates.length > 0 && !candidates.find(c => c.id === selectedCandidate?.id)) {
      setSelectedCandidate(candidates[0]);
    } else if (candidates.length === 0) {
      setSelectedCandidate(null);
    }
  }, [candidates, selectedCandidate?.id]);

  const handleSave = async (candidateData) => {
    try {
      if (view === 'add') {
        const { name, party, image, description } = candidateData;
        await addCandidate({ name, party, image, description });
      } else if (view === 'edit') {
        await updateCandidate(candidateData.id, candidateData);
      }
      setView('details');
    } catch (error) {
      console.error('Failed to save candidate:', error);
    }
  };

  const handleDelete = async () => {
    if (selectedCandidate) {
      try {
        await deleteCandidate(selectedCandidate.id);
      } catch (error) {
        console.error('Failed to delete candidate:', error);
      }
    }
  };

  const handleStartStopGenerating = () => {
    if (!generating) {
      setGenerating(true);
      generatorRef.current = setInterval(async () => {
        try {
          const randomCandidate = {
            name: `Random ${Math.floor(Math.random() * 100)}`,
            party: ['A', 'B', 'C'][Math.floor(Math.random() * 3)],
            image: 'https://via.placeholder.com/150',
            description: 'A randomly generated candidate.'
          };
          await addCandidate(randomCandidate);
        } catch (error) {
          console.error("Failed to generate candidate", error);
        }
      }, 1000);
    } else {
      setGenerating(false);
      clearInterval(generatorRef.current);
    }
  };

  return (
    <div className="main-layout">
      <div className="app-container">
        <div className="master-view">
          <div className="master-header">
            <h1>Candidates</h1>
          </div>
          <ul>
            {candidates.map(candidate => (
              <li
                key={candidate.id}
                onClick={() => {
                  setSelectedCandidate(candidate);
                  setView('details');
                }}
                className={selectedCandidate && selectedCandidate.id === candidate.id ? 'selected' : ''}
              >
                {candidate.name}
              </li>
            ))}
          </ul>
          <div className="master-footer">
            <button onClick={() => setView('add')} className="add-btn-full">
              + Add New Candidate
            </button>
            <button onClick={handleStartStopGenerating} className={`generate-btn${generating ? ' generating' : ''}`}>
              {generating ? 'Stop Generating' : 'Start Generating'}
            </button>
          </div>
        </div>
        <div className="detail-view">
          {view === 'details' && selectedCandidate && (
            <>
              <h2>{selectedCandidate.name}</h2>
              <img src={selectedCandidate.image} alt={selectedCandidate.name} />
              <p><strong>Party:</strong> {selectedCandidate.party}</p>
              <p>{selectedCandidate.description}</p>
              <div className="detail-actions">
                <button onClick={() => setView('edit')}>Edit</button>
                <button onClick={handleDelete} className="delete-btn">Delete</button>
              </div>
            </>
          )}
          {view === 'details' && !selectedCandidate && (
            <div className="welcome-message">
              <h2>Welcome to the Elections App!</h2>
              <p>The backend is running. Add a candidate to get started.</p>
            </div>
          )}
          {(view === 'add' || view === 'edit') && (
            <CandidateForm 
              onSave={handleSave}
              onCancel={() => setView('details')}
              candidate={view === 'edit' ? selectedCandidate : null}
            />
          )}
        </div>
      </div>
      <PartyChart candidates={candidates} />
    </div>
  );
}

function LoginPage({ setUser }) {
  const [cnp, setCnp] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const isValidCnp = cnp => /^\d{13}$/.test(cnp);

  const handleRegister = async () => {
    setError('');
    if (!isValidCnp(cnp)) {
      setError('CNP must be exactly 13 digits.');
      return;
    }
    try {
      const res = await registerUser(cnp);
      setUser(res.data);
      navigate('/vote');
    } catch (e) {
      setError('Registration failed');
    }
  };

  const handleLogin = async () => {
    setError('');
    if (!isValidCnp(cnp)) {
      setError('CNP must be exactly 13 digits.');
      return;
    }
    try {
      const res = await loginUser(cnp);
      setUser(res.data);
      navigate('/vote');
    } catch (e) {
      setError('Login failed. Please register first.');
    }
  };

  return (
    <div className="login-container">
      <h2>Login / Register by CNP</h2>
      <input
        type="text"
        placeholder="Enter CNP"
        value={cnp}
        onChange={e => setCnp(e.target.value)}
        className="login-input"
        maxLength={13}
      />
      <div className="login-actions">
        <button onClick={handleLogin}>Login</button>
        <button onClick={handleRegister}>Register</button>
      </div>
      {error && <div className="login-error">{error}</div>}
    </div>
  );
}

function VotePage({ user, setUser }) {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let polling = true;
    const fetchCandidates = async () => {
      try {
        const res = await getCandidates();
        setCandidates(res.data);
        setLoading(false);
      } catch (err) {}
    };
    fetchCandidates();
    const interval = setInterval(() => {
      if (polling) fetchCandidates();
    }, 2000);
    return () => {
      polling = false;
      clearInterval(interval);
    };
  }, []);

  const handleVote = async (candidateId) => {
    setMessage('');
    try {
      await voteApi(user.id, candidateId);
      setUser({ ...user, has_voted: true });
      setMessage('Vote recorded!');
    } catch (e) {
      setMessage('You have already voted or an error occurred.');
    }
  };

  if (!user) return null;

  return (
    <div className="vote-container">
      <h2>Welcome, CNP: {user.cnp}</h2>
      {user.has_voted ? (
        <div className="vote-message">You have already voted. Thank you!</div>
      ) : (
        <>
          <h3>Choose your candidate:</h3>
          <div className="vote-candidates">
            {loading ? (
              <div>Loading candidates...</div>
            ) : (
              candidates.map(c => (
                <div key={c.id} className="vote-candidate-card">
                  <img src={c.image} alt={c.name} />
                  <div><strong>{c.name}</strong></div>
                  <div>{c.party}</div>
                  <div>{c.description}</div>
                  <button onClick={() => handleVote(c.id)} disabled={user.has_voted}>Vote</button>
                </div>
              ))
            )}
          </div>
        </>
      )}
      {message && <div className="vote-message">{message}</div>}
    </div>
  );
}

function getRandomFakeNews(candidate) {
  const templates = [
    `${candidate.name} caught riding a unicorn to the parliament!`,
    `Shocking: ${candidate.name} claims to have invented the internet!`,
    `${candidate.name} to replace all taxes with hugs if elected!`,
    `Aliens endorse ${candidate.name} for the next election!`,
    `${candidate.name} seen having coffee with Bigfoot in downtown!`,
    `Secret revealed: ${candidate.name} is actually a time traveler from the future!`,
    `${candidate.name} promises free pizza for everyone every Friday!`,
    `Scandal: ${candidate.name} found guilty of being too awesome!`,
    `${candidate.name} to launch a new party: The Party Party!`,
    `Experts say ${candidate.name} can solve climate change with a single speech!`,
    `${candidate.name} to make Mondays illegal if elected!`,
    `New study: ${candidate.name}'s smile can power a small city!`,
    `${candidate.name} and ${candidate.party} to host the next Eurovision!`,
    `Rumor: ${candidate.name} is Batman!`,
    `World leaders consult ${candidate.name} for fashion advice!`,
  ];
  return templates[Math.floor(Math.random() * templates.length)];
}

function FakeNewsPage() {
  const [candidates, setCandidates] = useState([]);
  const [news, setNews] = useState({});

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const res = await getCandidates();
        setCandidates(res.data);
      } catch (err) {}
    };
    fetchCandidates();
  }, []);

  const handleGenerate = (candidate) => {
    setNews(prev => ({ ...prev, [candidate.id]: getRandomFakeNews(candidate) }));
  };

  return (
    <div className="vote-container">
      <h2>AI-Generated Fake News About Candidates</h2>
      <div className="vote-candidates">
        {candidates.map(c => (
          <div key={c.id} className="vote-candidate-card">
            <img src={c.image} alt={c.name} />
            <div><strong>{c.name}</strong></div>
            <div>{c.party}</div>
            <button onClick={() => handleGenerate(c)} style={{marginTop: '1rem'}}>Generate Fake News</button>
            {news[c.id] && <div className="fake-news-story">{news[c.id]}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);

  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/" element={<LoginPage setUser={setUser} />} />
        <Route path="/vote" element={<VotePage user={user} setUser={setUser} />} />
        <Route path="/fake-news" element={<FakeNewsPage />} />
      </Routes>
    </Router>
  );
}

export default App
