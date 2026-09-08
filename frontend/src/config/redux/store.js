import { configureStore } from '@reduxjs/toolkit';
import authReducer from './reducer/authReducer';

/*
# STEPS FOR STATE MANAGEMENT WITH REDUX
(1) Submit action --> do in './authAction/index.js'
(2) Handle action in it's reducer --> './authReducer/index.js'
(3) Register 'reducer' in --> 'store.js'
*/

export const store = configureStore({
  reducer: {
    auth: authReducer
  }
});


