import { configureStore } from '@reduxjs/toolkit';

const store = configureStore({
  reducer: {
    // todos: TodosReducer, // Will be added when todos feature is migrated
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;