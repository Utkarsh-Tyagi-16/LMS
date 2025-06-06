import { createSlice } from "@reduxjs/toolkit";

// Initial state
const initialState = {
  user: null, // Default user is null
  isAuthenticated: false, // Default authentication status is false
};

// Create the authSlice
const authSlice = createSlice({
  name: "auth", // A simpler name for the slice
  initialState,
  reducers: {
    // Action to log in the user
    userLoggedIn: (state, action) => {
      state.user = action.payload.user; // Set the user from the action payload
      state.isAuthenticated = true; // Set authentication status to true
    },
    
    // Action to log out the user
    userLoggedOut: (state) => {
      state.user = null; // Reset user to null
      state.isAuthenticated = false; // Set authentication status to false
    },
  },
});

// Export actions
export const { userLoggedIn, userLoggedOut } = authSlice.actions;

// Export the reducer
export default authSlice.reducer;
