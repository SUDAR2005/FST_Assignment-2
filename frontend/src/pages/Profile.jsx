import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { updateUserProfile, deleteUserProfile } from '../redux/slices/userSlice';
import '../styles.css';

function Profile() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.user.currentUser);
  const loading = useSelector((state) => state.user.loading);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    targetRole: '',
    experience: '',
    skills: '',
  });

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        targetRole: currentUser.targetRole || '',
        experience: currentUser.experience || '',
        skills: currentUser.skills?.join(', ') || '',
      });
    }
  }, [currentUser]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const skillsArray = formData.skills.split(',').map(s => s.trim());
      await dispatch(updateUserProfile({
        id: currentUser._id,
        userData: {
          ...formData,
          skills: skillsArray,
        },
      })).unwrap();

      alert('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      alert('Error updating profile: ' + error.message);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        await dispatch(deleteUserProfile(currentUser._id)).unwrap();
        alert('Account deleted successfully');
        navigate('/login');
      } catch (error) {
        alert('Error deleting account: ' + error.message);
      }
    }
  };

  if (!currentUser) {
    navigate('/login');
    return null;
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-avatar">
            {currentUser.name?.charAt(0).toUpperCase()}
          </div>
          <h1>{currentUser.name}</h1>
          <p className="profile-email">{currentUser.email}</p>
        </div>

        {!isEditing ? (
          <div className="profile-view">
            <div className="profile-section">
              <h3>Professional Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Target Role:</span>
                  <span className="info-value">{currentUser.targetRole || 'Not specified'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Experience:</span>
                  <span className="info-value">{currentUser.experience || 'Not specified'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Skills:</span>
                  <div className="skills-list">
                    {currentUser.skills?.length > 0 ? (
                      currentUser.skills.map((skill, index) => (
                        <span key={index} className="skill-tag">{skill}</span>
                      ))
                    ) : (
                      <span className="info-value">No skills added</span>
                    )}
                  </div>
                </div>
                <div className="info-item">
                  <span className="info-label">Member Since:</span>
                  <span className="info-value">
                    {new Date(currentUser.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="profile-actions">
              <button onClick={() => setIsEditing(true)} className="edit-btn">
                Edit Profile
              </button>
              <button onClick={handleDeleteAccount} className="delete-btn">
                Delete Account
              </button>
            </div>
          </div>
        ) : (
          <div className="profile-edit">
            <h3>Edit Profile</h3>
            <form onSubmit={handleSubmit} className="edit-form">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled
                  className="disabled-input"
                />
                <small>Email cannot be changed</small>
              </div>

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

              <div className="form-actions">
                <button type="submit" className="save-btn" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsEditing(false)}
                  className="cancel-btn"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;