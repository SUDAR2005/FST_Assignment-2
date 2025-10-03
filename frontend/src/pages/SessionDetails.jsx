import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchSessionById, deleteSession } from '../redux/slices/sessionSlice';
import './Common.css';

function SessionDetail() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const currentSession = useSelector((state) => state.sessions.currentSession);
  const loading = useSelector((state) => state.sessions.loading);

  useEffect(() => {
    dispatch(fetchSessionById(sessionId));
  }, [sessionId, dispatch]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this session?')) {
      try {
        await dispatch(deleteSession(sessionId)).unwrap();
        alert('Session deleted successfully');
        navigate('/history');
      } catch (error) {
        alert('Error deleting session: ' + error.message);
      }
    }
  };

  if (loading || !currentSession) {
    return <div className="loading">Loading session details...</div>;
  }

  return (
    <div className="session-detail-page">
      <div className="detail-header">
        <button onClick={() => navigate('/history')} className="back-btn">
          ← Back to History
        </button>
        <button onClick={handleDelete} className="delete-session-btn">
          Delete Session
        </button>
      </div>

      <div className="session-summary">
        <h1>{currentSession.topic}</h1>
        <div className="summary-badges">
          <span className={`difficulty-badge ${currentSession.difficulty.toLowerCase()}`}>
            {currentSession.difficulty}
          </span>
          <span className="score-badge">⭐ Score: {currentSession.score || 0}</span>
        </div>

        <div className="summary-stats">
          <div className="stat-item">
            <span className="stat-label">Total Questions:</span>
            <span className="stat-value">{currentSession.questions.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Date:</span>
            <span className="stat-value">
              {new Date(currentSession.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Time:</span>
            <span className="stat-value">
              {new Date(currentSession.createdAt).toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>

      <div className="questions-review">
        <h2>Questions & Answers Review</h2>
        {currentSession.questions.length > 0 ? (
          <div className="questions-list">
            {currentSession.questions.map((item, index) => (
              <div key={index} className="question-review-card">
                <div className="question-number">Question {index + 1}</div>
                
                <div className="review-section">
                  <h4>❓ Question:</h4>
                  <p className="question-text">{item.question}</p>
                </div>

                <div className="review-section">
                  <h4>💬 Your Answer:</h4>
                  <p className="answer-text">{item.answer}</p>
                </div>

                <div className="review-section feedback-section">
                  <h4>✨ AI Feedback:</h4>
                  <div className="feedback-text">{item.feedback}</div>
                </div>

                <div className="timestamp">
                  Answered at: {new Date(item.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-questions">
            <p>No questions were answered in this session.</p>
          </div>
        )}
      </div>

      <div className="detail-actions">
        <button 
          onClick={() => navigate('/new-session')}
          className="action-btn primary"
        >
          Start New Session
        </button>
        <button 
          onClick={() => navigate('/dashboard')}
          className="action-btn secondary"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}

export default SessionDetail;