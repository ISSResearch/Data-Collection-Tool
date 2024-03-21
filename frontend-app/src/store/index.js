import { configureStore } from '@reduxjs/toolkit';
import alertReducer from "../slices/alerts";
import userReducer from "../slices/users";
import headReducer from '../slices/heads';

export default configureStore({
  reducer: {
    alerts: alertReducer,
    head: headReducer,
    user: userReducer,
  }
});
