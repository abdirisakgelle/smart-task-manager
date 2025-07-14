import { apiSlice } from "../apiSlice";

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    registerUser: builder.mutation({
      query: (user) => ({
        url: "/users",
        method: "POST",
        body: user,
      }),
    }),
    login: builder.mutation({
      query: (data) => ({
        url: "/users/login",
        method: "POST",
        body: data,
      }),
    }),
    getCurrentUser: builder.query({
      query: () => ({
        url: "/users/profile",
        method: "GET",
      }),
      providesTags: ['User'],
    }),
  }),
});

export const { 
  useRegisterUserMutation, 
  useLoginMutation, 
  useGetCurrentUserQuery 
} = authApi;
