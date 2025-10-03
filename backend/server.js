const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/interview-prep', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB Connected Successfully'))
.catch(err => {
  console.error('❌ MongoDB Connection Error:', err.message);
  console.log('Make sure MongoDB is running!');
});

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path}`);
  next();
});

// Add error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);
  res.status(500).json({ error: err.message });
});

// Interview Session Schema
const interviewSessionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  topic: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
  questions: [{
    question: String,
    answer: String,
    feedback: String,
    timestamp: { type: Date, default: Date.now }
  }],
  score: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const InterviewSession = mongoose.model('InterviewSession', interviewSessionSchema);

// User Profile Schema
const userProfileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  targetRole: String,
  experience: String,
  skills: [String],
  createdAt: { type: Date, default: Date.now }
});

const UserProfile = mongoose.model('UserProfile', userProfileSchema);

// Gemini AI Integration (optional - only if API key is provided)
let genAI = null;
try {
  const { GoogleGenerativeAI } = require('@google/generative-ai');
  if (process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
} catch (error) {
  console.log('Gemini AI not configured - using mock responses');
}

// Routes

// CREATE - Start new interview session
app.post('/api/sessions', async (req, res) => {
  try {
    const { userId, topic, difficulty } = req.body;
    const session = new InterviewSession({
      userId,
      topic,
      difficulty,
      questions: []
    });
    await session.save();
    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// READ - Get all sessions for a user
app.get('/api/sessions/:userId', async (req, res) => {
  try {
    const sessions = await InterviewSession.find({ userId: req.params.userId })
      .sort({ createdAt: -1 });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// READ - Get single session
app.get('/api/sessions/detail/:sessionId', async (req, res) => {
  try {
    const session = await InterviewSession.findById(req.params.sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE - Add question and answer to session
app.put('/api/sessions/:sessionId/question', async (req, res) => {
  try {
    const { question, answer } = req.body;
    const session = await InterviewSession.findById(req.params.sessionId);
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Generate feedback using Gemini (or mock if not available)
    let feedback = 'Great answer! Keep practicing to improve further.';
    
    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        const prompt = `As an interview expert, evaluate this answer:
        Question: ${question}
        Answer: ${answer}
        Topic: ${session.topic}
        Difficulty: ${session.difficulty}
        
        Provide constructive feedback (max 150 words) and rate from 1-10.`;
        
        const result = await model.generateContent(prompt);
        feedback = result.response.text();
      } catch (aiError) {
        console.log('AI generation failed, using default feedback');
      }
    }

    session.questions.push({ question, answer, feedback });
    session.updatedAt = Date.now();
    await session.save();

    res.json(session);
  } catch (error) {
    console.error('Error adding question:', error);
    res.status(500).json({ error: error.message });
  }
});

// UPDATE - Update session score
app.put('/api/sessions/:sessionId/score', async (req, res) => {
  try {
    const { score } = req.body;
    const session = await InterviewSession.findByIdAndUpdate(
      req.params.sessionId,
      { score, updatedAt: Date.now() },
      { new: true }
    );
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE - Delete session
app.delete('/api/sessions/:sessionId', async (req, res) => {
  try {
    await InterviewSession.findByIdAndDelete(req.params.sessionId);
    res.json({ message: 'Session deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate interview question using Gemini
app.post('/api/generate-question', async (req, res) => {
  try {
    const { topic, difficulty, previousQuestions } = req.body;
    
    let question = `What is ${topic}? Explain with examples. (${difficulty} level)`;
    
    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        const prompt = `Generate a ${difficulty} level interview question about ${topic}.
        ${previousQuestions?.length ? `Avoid these topics: ${previousQuestions.join(', ')}` : ''}
        Return only the question, no additional text.`;
        
        const result = await model.generateContent(prompt);
        question = result.response.text();
      } catch (aiError) {
        console.log('AI generation failed, using default question');
      }
    }

    res.json({ question });
  } catch (error) {
    console.error('Error generating question:', error);
    res.status(500).json({ error: error.message });
  }
});

// User Profile CRUD
app.post('/api/users', async (req, res) => {
  try {
    const user = new UserProfile(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/users/:email', async (req, res) => {
  try {
    const user = await UserProfile.findOne({ email: req.params.email });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const user = await UserProfile.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    await UserProfile.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});