import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Dynamic base URL that works across different environments
const getBaseUrl = () => {
  // In development, use the current hostname
  if (process.env.NODE_ENV === 'development') {
    const hostname = window.location.hostname;
    const port = '3000';
    return `http://${hostname}:${port}/api`;
  }
  // In production, use relative URL or environment variable
  return process.env.REACT_APP_API_URL || '/api';
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: getBaseUrl(),
    prepareHeaders: (headers, { getState }) => {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getIdeas: builder.query({
      query: (params) => {
        let url = '/ideas';
        if (params) {
          const query = new URLSearchParams(params).toString();
          url += `?${query}`;
        }
        return { url };
      },
    }),
    createIdea: builder.mutation({
      query: (body) => ({
        url: '/ideas',
        method: 'POST',
        body,
      }),
    }),
    updateIdea: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/ideas/${id}`,
        method: 'PUT',
        body,
      }),
    }),
    getContentEmployees: builder.query({
      query: () => '/employees/department/Content',
    }),
  }),
});

export const { useGetIdeasQuery, useCreateIdeaMutation, useUpdateIdeaMutation, useGetContentEmployeesQuery } = apiSlice;
