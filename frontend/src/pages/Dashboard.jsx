import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchSessions } from '../redux/slices/sessionSlice';
import './Common.css';

function Dashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.user.currentUser);
  const sessions = useSelector((state) => state.sessions.sessions);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    dispatch(fetchSessions(currentUser._id));
  }, [currentUser, dispatch, navigate]);

  const recentSessions = sessions.slice(0, 5);
  const totalSessions = sessions.length;
  const averageScore = sessions.length > 0
    ? (sessions.reduce((sum, s) => sum + (s.score || 0), 0) / sessions.length).toFixed(1)
    : 0;

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Welcome back, {currentUser?.name}! 👋</h1>
        <p>Ready to ace your next interview?</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>{totalSessions}</h3>
            <p>Total Sessions</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <h3>{averageScore}</h3>
            <p>Average Score</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <h3>{currentUser?.targetRole || 'Not Set'}</h3>
            <p>Target Role</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💼</div>
          <div className="stat-content">
            <h3>{currentUser?.experience || 'N/A'}</h3>
            <p>Experience</p>
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <button 
            onClick={() => navigate('/new-session')}
            className="action-btn primary"
          >
            🚀 Start New Interview
          </button>
          <button 
            onClick={() => navigate('/history')}
            className="action-btn secondary"
          >
            📜 View History
          </button>
          <button 
            onClick={() => navigate('/profile')}
            className="action-btn secondary"
          >
            👤 Edit Profile
          </button>
        </div>
      </div>

      <div className="recent-sessions">
        <h2>Recent Sessions</h2>
        {recentSessions.length > 0 ? (
          <div className="sessions-list">
            {recentSessions.map((session) => (
              <div 
                key={session._id} 
                className="session-card"
                onClick={() => navigate(`/session/${session._id}`)}
              >
                <div className="session-header">
                  <h3>{session.topic}</h3>
                  <span className={`difficulty-badge ${session.difficulty.toLowerCase()}`}>
                    {session.difficulty}
                  </span>
                </div>
                <div className="session-info">
                  <span>📝 {session.questions.length} questions</span>
                  <span>⭐ Score: {session.score || 0}</span>
                  <span>📅 {new Date(session.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-sessions">
            <p>No sessions yet. Start your first interview practice!</p>
            <button 
              onClick={() => navigate('/new-session')}
              className="start-btn"
            >
              Start Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;