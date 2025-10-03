import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { createUserProfile, fetchUserByEmail } from '../redux/slices/userSlice';
import './Common.css';

function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    targetRole: '',
    experience: '',
    skills: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (isSignup) {
        // Create new user
        const skillsArray = formData.skills.split(',').map(s => s.trim());
        await dispatch(createUserProfile({
          ...formData,
          skills: skillsArray,
        })).unwrap();
        alert('Account created successfully!');
        navigate('/dashboard');
      } else {
        // Login existing user
        const result = await dispatch(fetchUserByEmail(formData.email)).unwrap();
        if (result) {
          navigate('/dashboard');
        } else {
          alert('User not found. Please sign up first.');
        }
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <h2>{isSignup ? 'Create Account' : 'Welcome Back'}</h2>
          <p className="login-subtitle">
            {isSignup ? 'Sign up to start your interview prep' : 'Login to continue'}
          </p>

          <form onSubmit={handleSubmit} className="login-form">
            {isSignup && (
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your full name"
                />
              </div>
            )}

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
              />
            </div>

            {isSignup && (
              <>
                <div className="form-group">
                  <label>Target Role</label>
                  <input
                    type="text"
                    name="targetRole"
                    value={formData.targetRole}
                    onChange={handleChange}
                    placeholder="e.g., Full Stack Developer"
                  />
                </div>

                <div className="form-group">
                  <label>Experience Level</label>
                  <select
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                  >
                    <option value="">Select experience</option>
                    <option value="Fresher">Fresher</option>
                    <option value="0-2 years">0-2 years</option>
                    <option value="2-5 years">2-5 years</option>
                    <option value="5+ years">5+ years</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Skills (comma-separated)</label>
                  <input
                    type="text"
                    name="skills"
                    value={formData.skills}
                    onChange={handleChange}
                    placeholder="e.g., React, Node.js, MongoDB"
                  />
                </div>
              </>
            )}

            <button type="submit" className="submit-btn">
              {isSignup ? 'Sign Up' : 'Login'}
            </button>
          </form>

          <p className="toggle-form">
            {isSignup ? 'Already have an account?' : "Don't have an account?"}
            <button
              onClick={() => setIsSignup(!isSignup)}
              className="toggle-btn"
            >
              {isSignup ? 'Login' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;