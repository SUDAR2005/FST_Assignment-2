import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchSessionById, addQuestionToSession, updateSessionScore } from '../redux/slices/sessionSlice';
import { generateQuestion } from '../redux/slices/questionSlice';
import './Common.css';

function InterviewSession() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const currentSession = useSelector((state) => state.sessions.currentSession);
  const currentQuestion = useSelector((state) => state.questions.currentQuestion);
  const questionLoading = useSelector((state) => state.questions.loading);
  const sessionLoading = useSelector((state) => state.sessions.loading);

  const [answer, setAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState('');

  useEffect(() => {
    dispatch(fetchSessionById(sessionId));
  }, [sessionId, dispatch]);

  useEffect(() => {
    if (currentSession && !currentQuestion) {
      handleGenerateQuestion();
    }
  }, [currentSession]);

  const handleGenerateQuestion = async () => {
    if (!currentSession) return;

    const previousQuestions = currentSession.questions.map(q => q.question);
    
    try {
      await dispatch(generateQuestion({
        topic: currentSession.topic,
        difficulty: currentSession.difficulty,
        previousQuestions,
      })).unwrap();
    } catch (error) {
      alert('Error generating question: ' + error.message);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) {
      alert('Please provide an answer');
      return;
    }

    try {
      const result = await dispatch(addQuestionToSession({
        sessionId: currentSession._id,
        question: currentQuestion,
        answer: answer,
      })).unwrap();

      // Show feedback
      const lastQuestion = result.questions[result.questions.length - 1];
      setCurrentFeedback(lastQuestion.feedback);
      setShowFeedback(true);
      setAnswer('');
    } catch (error) {
      alert('Error submitting answer: ' + error.message);
    }
  };

  const handleNextQuestion = () => {
    setShowFeedback(false);
    setCurrentFeedback('');
    handleGenerateQuestion();
  };

  const handleEndSession = async () => {
    if (!currentSession) return;

    const totalQuestions = currentSession.questions.length;
    const score = Math.round((totalQuestions / (totalQuestions + 1)) * 100);

    try {
      await dispatch(updateSessionScore({
        sessionId: currentSession._id,
        score,
      })).unwrap();

      navigate(`/session/${currentSession._id}`);
    } catch (error) {
      alert('Error ending session: ' + error.message);
    }
  };

  if (!currentSession) {
    return <div className="loading">Loading session...</div>;
  }

  return (
    <div className="interview-session-page">
      <div className="session-header">
        <div className="session-info-bar">
          <h2>{currentSession.topic}</h2>
          <span className={`difficulty-badge ${currentSession.difficulty.toLowerCase()}`}>
            {currentSession.difficulty}
          </span>
          <span className="question-count">
            Question {currentSession.questions.length + 1}
          </span>
        </div>
        <button onClick={handleEndSession} className="end-session-btn">
          End Session
        </button>
      </div>

      <div className="interview-content">
        {!showFeedback ? (
          <div className="question-section">
            <div className="question-card">
              <h3>Question:</h3>
              {questionLoading ? (
                <div className="loading-question">
                  <div className="spinner"></div>
                  <p>Generating question...</p>
                </div>
              ) : (
                <p className="question-text">{currentQuestion}</p>
              )}
            </div>

            <div className="answer-section">
              <label>Your Answer:</label>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type your answer here..."
                rows="10"
                disabled={questionLoading}
              />
              <button 
                onClick={handleSubmitAnswer}
                disabled={sessionLoading || !answer.trim() || questionLoading}
                className="submit-answer-btn"
              >
                {sessionLoading ? 'Submitting...' : 'Submit Answer'}
              </button>
            </div>
          </div>
        ) : (
          <div className="feedback-section">
            <div className="feedback-card">
              <h3>✨ AI Feedback</h3>
              <div className="feedback-content">
                {currentFeedback}
              </div>
              <div className="feedback-actions">
                <button onClick={handleNextQuestion} className="next-btn">
                  Next Question →
                </button>
                <button onClick={handleEndSession} className="finish-btn">
                  Finish Session
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="progress-bar">
        <div className="progress-info">
          <span>Questions Answered: {currentSession.questions.length}</span>
        </div>
      </div>
    </div>
  );
}

export default InterviewSession;