import { useState, useEffect, useRef } from 'react'
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa'
import './App.css'
import CandidateForm from './components/CandidateForm'
import './components/CandidateForm.css'
import PartyChart from './components/PartyChart'
import { getCandidates, addCandidate, updateCandidate, deleteCandidate } from './api'

function App() {
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [view, setView] = useState('details'); // 'details', 'add', 'edit'
  const [generating, setGenerating] = useState(false);
  const generatorRef = useRef(null);

  // Polling for candidates
  useEffect(() => {
    let polling = true;
    const fetchCandidates = async () => {
      try {
        const res = await getCandidates();
        setCandidates(res.data);
      } catch (err) {
        // Optionally handle error
      }
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
              <FaPlus /> Add New Candidate
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
                <button onClick={() => setView('edit')}><FaEdit /> Edit</button>
                <button onClick={handleDelete} className="delete-btn"><FaTrash /> Delete</button>
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
  )
}

export default App
