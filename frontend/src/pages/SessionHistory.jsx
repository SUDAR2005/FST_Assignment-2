import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchSessions, deleteSession } from '../redux/slices/sessionSlice';
import '../styles.css';

function SessionHistory() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.user.currentUser);
  const sessions = useSelector((state) => state.sessions.sessions);
  const loading = useSelector((state) => state.sessions.loading);

  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  useEffect(() => {
    if (currentUser) {
      dispatch(fetchSessions(currentUser._id));
    }
  }, [currentUser, dispatch]);

  const handleDelete = async (sessionId, e) => {
    e.stopPropagation();
    
    if (window.confirm('Are you sure you want to delete this session?')) {
      try {
        await dispatch(deleteSession(sessionId)).unwrap();
        alert('Session deleted successfully');
      } catch (error) {
        alert('Error deleting session: ' + error.message);
      }
    }
  };

  const filteredSessions = sessions.filter((session) => {
    if (filter === 'all') return true;
    return session.difficulty === filter;
  });

  const sortedSessions = [...filteredSessions].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else if (sortBy === 'score') {
      return (b.score || 0) - (a.score || 0);
    } else if (sortBy === 'questions') {
      return b.questions.length - a.questions.length;
    }
    return 0;
  });

  return (
    <div className="history-page">
      <div className="history-header">
        <h1>Session History</h1>
        <p>Review your past interview sessions</p>
      </div>

      <div className="filters-section">
        <div className="filter-group">
          <label>Filter by Difficulty:</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Levels</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Sort by:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="date">Date</option>
            <option value="score">Score</option>
            <option value="questions">Questions</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading sessions...</div>
      ) : sortedSessions.length > 0 ? (
        <div className="sessions-grid">
          {sortedSessions.map((session) => (
            <div
              key={session._id}
              className="history-card"
              onClick={() => navigate(`/session/${session._id}`)}
            >
              <div className="card-header">
                <h3>{session.topic}</h3>
                <button
                  onClick={(e) => handleDelete(session._id, e)}
                  className="delete-btn"
                  title="Delete session"
                >
                  🗑️
                </button>
              </div>

              <div className="card-badges">
                <span className={`difficulty-badge ${session.difficulty.toLowerCase()}`}>
                  {session.difficulty}
                </span>
                <span className="score-badge">
                  ⭐ {session.score || 0}
                </span>
              </div>

              <div className="card-stats">
                <div className="stat">
                  <span className="stat-icon">📝</span>
                  <span>{session.questions.length} Questions</span>
                </div>
                <div className="stat">
                  <span className="stat-icon">📅</span>
                  <span>{new Date(session.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="stat">
                  <span className="stat-icon">⏰</span>
                  <span>{new Date(session.createdAt).toLocaleTimeString()}</span>
                </div>
              </div>

              <button className="view-details-btn">
                View Details →
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-sessions">
          <div className="empty-state">
            <span className="empty-icon">📭</span>
            <h3>No sessions found</h3>
            <p>Start your first interview practice session</p>
            <button
              onClick={() => navigate('/new-session')}
              className="start-new-btn"
            >
              Start New Session
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SessionHistory;