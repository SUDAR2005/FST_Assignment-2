import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { createSession } from '../redux/slices/sessionSlice';
import '../styles.css';

function NewSession() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.user.currentUser);
  const loading = useSelector((state) => state.sessions.loading);

  const [formData, setFormData] = useState({
    topic: '',
    difficulty: 'Medium',
  });

  const topics = [
    'JavaScript',
    'React',
    'Node.js',
    'Python',
    'Data Structures',
    'Algorithms',
    'System Design',
    'Database (SQL)',
    'Database (NoSQL)',
    'REST API',
    'DevOps',
    'Cloud Computing',
    'Machine Learning',
    'Behavioral Questions',
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      alert('Please login first');
      navigate('/login');
      return;
    }

    try {
      const result = await dispatch(createSession({
        userId: currentUser._id,
        topic: formData.topic,
        difficulty: formData.difficulty,
      })).unwrap();

      navigate(`/interview/${result._id}`);
    } catch (error) {
      alert('Error creating session: ' + error.message);
    }
  };

  return (
    <div className="new-session-page">
      <div className="new-session-container">
        <h1>Start New Interview Session</h1>
        <p className="session-subtitle">
          Choose your topic and difficulty level to begin
        </p>

        <form onSubmit={handleSubmit} className="session-form">
          <div className="form-group">
            <label>Interview Topic</label>
            <select
              name="topic"
              value={formData.topic}
              onChange={handleChange}
              required
              className="topic-select"
            >
              <option value="">Select a topic</option>
              {topics.map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Difficulty Level</label>
            <div className="difficulty-options">
              {['Easy', 'Medium', 'Hard'].map((level) => (
                <label key={level} className="radio-option">
                  <input
                    type="radio"
                    name="difficulty"
                    value={level}
                    checked={formData.difficulty === level}
                    onChange={handleChange}
                  />
                  <span className={`difficulty-label ${level.toLowerCase()}`}>
                    {level}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-info">
            <h3>What to expect:</h3>
            <ul>
              <li>🤖 AI-generated questions tailored to your topic</li>
              <li>💡 Instant feedback on your answers</li>
              <li>📊 Performance scoring and tracking</li>
              <li>⏱️ Practice at your own pace</li>
            </ul>
          </div>

          <button 
            type="submit" 
            className="start-session-btn"
            disabled={loading}
          >
            {loading ? 'Creating Session...' : 'Start Interview 🚀'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default NewSession;