import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Async Thunks for CRUD Operations

// CREATE - Create new session
export const createSession = createAsyncThunk(
  'sessions/create',
  async (sessionData) => {
    const response = await axios.post(`${API_URL}/sessions`, sessionData);
    return response.data;
  }
);

// READ - Fetch all sessions
export const fetchSessions = createAsyncThunk(
  'sessions/fetchAll',
  async (userId) => {
    const response = await axios.get(`${API_URL}/sessions/${userId}`);
    return response.data;
  }
);

// READ - Fetch single session
export const fetchSessionById = createAsyncThunk(
  'sessions/fetchById',
  async (sessionId) => {
    const response = await axios.get(`${API_URL}/sessions/detail/${sessionId}`);
    return response.data;
  }
);

// UPDATE - Add question to session
export const addQuestionToSession = createAsyncThunk(
  'sessions/addQuestion',
  async ({ sessionId, question, answer }) => {
    const response = await axios.put(
      `${API_URL}/sessions/${sessionId}/question`,
      { question, answer }
    );
    return response.data;
  }
);

// UPDATE - Update session score
export const updateSessionScore = createAsyncThunk(
  'sessions/updateScore',
  async ({ sessionId, score }) => {
    const response = await axios.put(
      `${API_URL}/sessions/${sessionId}/score`,
      { score }
    );
    return response.data;
  }
);

// DELETE - Delete session
export const deleteSession = createAsyncThunk(
  'sessions/delete',
  async (sessionId) => {
    await axios.delete(`${API_URL}/sessions/${sessionId}`);
    return sessionId;
  }
);

const sessionSlice = createSlice({
  name: 'sessions',
  initialState: {
    sessions: [],
    currentSession: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearCurrentSession: (state) => {
      state.currentSession = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Session
      .addCase(createSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSession.fulfilled, (state, action) => {
        state.loading = false;
        state.sessions.unshift(action.payload);
        state.currentSession = action.payload;
      })
      .addCase(createSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Fetch All Sessions
      .addCase(fetchSessions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSessions.fulfilled, (state, action) => {
        state.loading = false;
        state.sessions = action.payload;
      })
      .addCase(fetchSessions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Fetch Session By ID
      .addCase(fetchSessionById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSessionById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSession = action.payload;
      })
      .addCase(fetchSessionById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Add Question
      .addCase(addQuestionToSession.pending, (state) => {
        state.loading = true;
      })
      .addCase(addQuestionToSession.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSession = action.payload;
        const index = state.sessions.findIndex(s => s._id === action.payload._id);
        if (index !== -1) {
          state.sessions[index] = action.payload;
        }
      })
      .addCase(addQuestionToSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // Update Score
      .addCase(updateSessionScore.fulfilled, (state, action) => {
        state.currentSession = action.payload;
        const index = state.sessions.findIndex(s => s._id === action.payload._id);
        if (index !== -1) {
          state.sessions[index] = action.payload;
        }
      })
      
      // Delete Session
      .addCase(deleteSession.fulfilled, (state, action) => {
        state.sessions = state.sessions.filter(s => s._id !== action.payload);
        if (state.currentSession?._id === action.payload) {
          state.currentSession = null;
        }
      });
  },
});

export const { clearCurrentSession, clearError } = sessionSlice.actions;
export default sessionSlice.reducer;