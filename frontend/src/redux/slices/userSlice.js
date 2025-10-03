import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// CREATE - Create user profile
export const createUserProfile = createAsyncThunk(
  'user/create',
  async (userData) => {
    const response = await axios.post(`${API_URL}/users`, userData);
    return response.data;
  }
);

// READ - Fetch user by email
export const fetchUserByEmail = createAsyncThunk(
  'user/fetchByEmail',
  async (email) => {
    const response = await axios.get(`${API_URL}/users/${email}`);
    return response.data;
  }
);

// UPDATE - Update user profile
export const updateUserProfile = createAsyncThunk(
  'user/update',
  async ({ id, userData }) => {
    const response = await axios.put(`${API_URL}/users/${id}`, userData);
    return response.data;
  }
);

// DELETE - Delete user profile
export const deleteUserProfile = createAsyncThunk(
  'user/delete',
  async (id) => {
    await axios.delete(`${API_URL}/users/${id}`);
    return id;
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState: {
    currentUser: null,
    loading: false,
    error: null,
  },
  reducers: {
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload;
    },
    logout: (state) => {
      state.currentUser = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
      })
      .addCase(createUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      .addCase(fetchUserByEmail.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserByEmail.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
      })
      .addCase(fetchUserByEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.currentUser = action.payload;
      })
      
      .addCase(deleteUserProfile.fulfilled, (state) => {
        state.currentUser = null;
      });
  },
});

export const { setCurrentUser, logout } = userSlice.actions;
export default userSlice.reducer;