import { createSlice } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";

// Safe localStorage parsing to prevent JSON.parse errors
const getStoredUser = () => {
  try {
    const storedUser = localStorage.getItem("user");
    if (storedUser && storedUser !== "undefined" && storedUser !== "null") {
      return JSON.parse(storedUser);
    }
  } catch (error) {
    console.error("Error parsing stored user:", error);
    // Clear corrupted data
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  }
  return null;
};

const storedUser = getStoredUser();

export const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: storedUser || null,
    isAuth: !!storedUser,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuth = true;
    },
    logOut: (state, action) => {
      state.user = null;
      state.isAuth = false;
      // Clear localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    },
  },
});

export const { setUser, logOut } = authSlice.actions;
export default authSlice.reducer;
