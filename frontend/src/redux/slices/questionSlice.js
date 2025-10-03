import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Generate question using Gemini
export const generateQuestion = createAsyncThunk(
  'questions/generate',
  async ({ topic, difficulty, previousQuestions }) => {
    const response = await axios.post(`${API_URL}/generate-question`, {
      topic,
      difficulty,
      previousQuestions,
    });
    return response.data.question;
  }
);

const questionSlice = createSlice({
  name: 'questions',
  initialState: {
    currentQuestion: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearCurrentQuestion: (state) => {
      state.currentQuestion = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(generateQuestion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateQuestion.fulfilled, (state, action) => {
        state.loading = false;
        state.currentQuestion = action.payload;
      })
      .addCase(generateQuestion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { clearCurrentQuestion } = questionSlice.actions;
export default questionSlice.reducer;