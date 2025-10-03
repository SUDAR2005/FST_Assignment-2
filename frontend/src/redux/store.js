import { configureStore } from '@reduxjs/toolkit';
import sessionReducer from './slices/sessionSlice';
import userReducer from './slices/userSlice';
import questionReducer from './slices/questionSlice';

export const store = configureStore({
  reducer: {
    sessions: sessionReducer,
    user: userReducer,
    questions: questionReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;