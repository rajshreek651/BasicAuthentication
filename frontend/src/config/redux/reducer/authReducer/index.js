// All Business Logic is here, and in UI we need to just render it properly through UI

import { createSlice } from "@reduxjs/toolkit";
import { loginUser, registerUser } from "../../action/authAction/index.js";

const initialState = {
    user: [],
    isError: false,
    isSuccess: false,
    isLoading: false,
    loggedIn: false,
    message: "",
    profileFetched: false,
    connections: [],
    connectionRequest: []
};

const authSlice = createSlice({
    name: "auth",

    initialState,

    reducers: {
        reset: () => initialState,

        handleLoginUser: (state) => {
            state.message = "hello";
        },

        emptyMessage: (state) => {
            state.message = "";
        }
    },

    extraReducers: (builder) => {
        builder

        // =========================
        // LOGIN
        // =========================

        .addCase(loginUser.pending, (state) => {
            state.isLoading = true;
            state.isError = false;
            state.message = "Knocking the door..."
        })

        .addCase(loginUser.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isError = false;
            state.isSuccess = true;
            state.loggedIn = true;
            state.message = "Log in successful"
        })

        .addCase(loginUser.rejected, (state, action) => {
            state.isLoading = false;
            state.isError = true;
            state.isSuccess = false;
            state.loggedIn = false;

            state.message =
                action.payload?.message || "Login failed"
        })


        // =========================
        // REGISTER
        // =========================

        .addCase(registerUser.pending, (state) => {
            state.isLoading = true;
            state.isError = false;
            state.message = "Registering you..."
        })

        .addCase(registerUser.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isError = false;
            state.isSuccess = true;

            // User is NOT logged in yet
            state.loggedIn = false;

            state.message = "Registration successful, Please log in to continue."
        })

        .addCase(registerUser.rejected, (state, action) => {
            state.isLoading = false;
            state.isError = true;
            state.isSuccess = false;
            state.loggedIn = false;

            state.message =
                action.payload?.message || "Registration failed"
        });
    }
});

// =========================
// EXPORT ACTIONS
// =========================

export const { reset, handleLoginUser, emptyMessage } = authSlice.actions;

// =========================
// EXPORT REDUCER
// =========================

export default authSlice.reducer;