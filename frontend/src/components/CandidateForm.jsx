import { useState, useEffect } from 'react';
import './CandidateForm.css';

function CandidateForm({ onSave, onCancel, candidate }) {
  const [formData, setFormData] = useState({
    name: '',
    party: '',
    image: '',
    description: ''
  });

  useEffect(() => {
    if (candidate) {
      setFormData(candidate);
    }
  }, [candidate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...formData });
  };

  return (
    <div className="form-container">
      <h2>{candidate ? 'Edit Candidate' : 'Add Candidate'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input id="name" name="name" value={formData.name} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="party">Party</label>
          <input id="party" name="party" value={formData.party} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="image">Image URL</label>
          <input id="image" name="image" value={formData.image} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea id="description" name="description" value={formData.description} onChange={handleChange} required />
        </div>
        <div className="form-actions">
          <button type="submit">Save</button>
          <button type="button" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </div>
  );
}

export default CandidateForm; 