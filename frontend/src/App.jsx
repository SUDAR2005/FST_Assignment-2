import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './redux/store';
import './App.css';

// Components
import Navbar from './component/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NewSession from './pages/NewSession';
import InterviewSession from './pages/InterviewSession';
import SessionHistory from './pages/SessionHistory';
import SessionDetails from './pages/SessionDetails';
import Profile from './pages/Profile';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="App">
          <Navbar />
          <div className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/new-session" element={<NewSession />} />
              <Route path="/interview/:sessionId" element={<InterviewSession />} />
              <Route path="/history" element={<SessionHistory />} />
              <Route path="/session/:sessionId" element={<SessionDetails />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </div>
      </Router>
    </Provider>
  );
}

export default App;