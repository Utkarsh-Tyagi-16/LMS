import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";
import { userLoggedIn, userLoggedOut } from "../authSlice";

const USER_API = "http://localhost:8080/api/v1/user/"

export const authApi = createApi({
    reducerPath:"authApi",
    baseQuery:fetchBaseQuery({
        baseUrl:USER_API,
        credentials:'include'
    }),
    endpoints: (builder) => ({
        registerUser: builder.mutation({
            query: (userData) => ({
                url:"register",
                method:"POST",
                body: {
                    name: userData.name.trim(),
                    email: userData.email.trim(),
                    password: userData.password,
                    role: userData.role || "student"
                }
            }),
            async onQueryStarted(_, {queryFulfilled}) {
                try {
                    const result = await queryFulfilled;
                    if (!result.data.success) {
                        throw new Error(result.data.message || "Registration failed");
                    }
                } catch (error) {
                    console.error("Registration error:", error);
                }
            }
        }),
        loginUser: builder.mutation({
            query: (credentials) => {
                console.log("Sending login request with:", { email: credentials.email });
                return {
                    url:"login",
                    method:"POST",
                    body: {
                        email: credentials.email.trim(),
                        password: credentials.password
                    }
                };
            },
            async onQueryStarted(_, {queryFulfilled, dispatch}) {
                try {
                    const result = await queryFulfilled;
                    console.log("Login response:", result.data);
                    if (result.data.success) {
                        dispatch(userLoggedIn({user: result.data.user}));
                    } else {
                        throw new Error(result.data.message || "Login failed");
                    }
                } catch (error) {
                    console.error("Login error:", error);
                    throw error;
                }
            }
        }),
        logoutUser: builder.mutation({
            query: () => ({
                url:"logout",
                method:"GET"
            }),
            async onQueryStarted(_, {dispatch}) {
                try { 
                    dispatch(userLoggedOut());
                } catch (error) {
                    console.log(error);
                }
            }
        }),
        loadUser: builder.query({
            query: () => ({
                url:"profile",
                method:"GET"
            }),
            async onQueryStarted(_, {queryFulfilled, dispatch}) {
                try {
                    const result = await queryFulfilled;
                    dispatch(userLoggedIn({user:result.data.user}));
                } catch (error) {
                    // If unauthorized, log out the user
                    if (error.status === 401) {
                        dispatch(userLoggedOut());
                    }
                    console.log(error);
                }
            }
        }),
        updateUser: builder.mutation({
            query: (formData) => ({
                url: "profile/update",
                method: "PUT",
                body: formData
            }),
            async onQueryStarted(_, { queryFulfilled, dispatch }) {
                try {
                    const result = await queryFulfilled;
                    if (result.data.success) {
                        dispatch(userLoggedIn({ user: result.data.user }));
                    }
                } catch (error) {
                    console.error("Profile update error:", error);
                }
            }
        })
    })
});

export const {
    useRegisterUserMutation,
    useLoginUserMutation,
    useLogoutUserMutation,
    useLoadUserQuery,
    useUpdateUserMutation
} = authApi;