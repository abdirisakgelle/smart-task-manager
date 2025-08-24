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
      // Disable caching to ensure fresh data
      keepUnusedDataFor: 0,
      // Refetch on window focus
      refetchOnFocus: true,
      // Refetch on reconnect
      refetchOnReconnect: true,
    }),
    getIdeaDetail: builder.query({
      query: (id) => ({ url: `/ideas/${id}` }),
    }),
    moveForwardIdea: builder.mutation({
      query: ({ id, body }) => ({
        url: `/ideas/${id}/move-forward`,
        method: 'POST',
        body: body || {},
      }),
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
    deleteIdea: builder.mutation({
      query: (id) => ({
        url: `/ideas/${id}`,
        method: 'DELETE',
      }),
    }),
    getContent: builder.query({
      query: (params) => {
        let url = '/content';
        if (params) {
          const query = new URLSearchParams(params).toString();
          url += `?${query}`;
        }
        return { url };
      },
    }),
    createContent: builder.mutation({
      query: (body) => ({
        url: '/content',
        method: 'POST',
        body,
      }),
    }),
    updateContent: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/content/${id}`,
        method: 'PUT',
        body,
      }),
    }),
    deleteContent: builder.mutation({
      query: (id) => ({
        url: `/content/${id}`,
        method: 'DELETE',
      }),
    }),
    // Updated employee endpoints for dynamic dropdowns
    getAllEmployees: builder.query({
      query: () => '/employees',
    }),
    getEmployeesByDepartment: builder.query({
      query: (department) => `/employees/department/${encodeURIComponent(department)}`,
    }),
    getContentEmployees: builder.query({
      query: () => '/employees/department/Content',
    }),
    getScriptWriters: builder.query({
      query: () => '/employees/department/Content',
    }),
    getContributors: builder.query({
      query: () => '/employees/department/Content',
    }),
    getDirectors: builder.query({
      query: () => '/employees/department/Editor',
    }),
    getEditors: builder.query({
      query: () => '/employees/department/Editor',
    }),
    getCastAndPresenters: builder.query({
      query: () => '/employees',
    }),
    getProduction: builder.query({
      query: (params) => {
        let url = '/production';
        if (params) {
          const query = new URLSearchParams(params).toString();
          url += `?${query}`;
        }
        return { url };
      },
    }),
    createProduction: builder.mutation({
      query: (body) => ({
        url: '/production',
        method: 'POST',
        body,
      }),
    }),
    updateProduction: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/production/${id}`,
        method: 'PUT',
        body,
      }),
    }),
    deleteProduction: builder.mutation({
      query: (id) => ({
        url: `/production/${id}`,
        method: 'DELETE',
      }),
    }),
    getProductionEmployees: builder.query({
      query: () => '/employees/department/Editor',
    }),
    getSocialMedia: builder.query({
      query: (params) => {
        let url = '/social-media';
        if (params) {
          const query = new URLSearchParams(params).toString();
          url += `?${query}`;
        }
        return { url };
      },
    }),
    createSocialMedia: builder.mutation({
      query: (body) => ({
        url: '/social-media',
        method: 'POST',
        body,
      }),
    }),
    updateSocialMedia: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/social-media/${id}`,
        method: 'PUT',
        body,
      }),
    }),
    deleteSocialMedia: builder.mutation({
      query: (id) => ({
        url: `/social-media/${id}`,
        method: 'DELETE',
      }),
    }),
    // Notifications endpoints
    getMyNotifications: builder.query({
      query: (params) => {
        let url = '/notifications/my';
        if (params) {
          const query = new URLSearchParams(params).toString();
          url += `?${query}`;
        }
        return { url };
      },
      providesTags: ["notifications"],
    }),
    getUnreadCount: builder.query({
      query: () => '/notifications/my/unread-count',
      providesTags: ["notifications"],
    }),
    markAsRead: builder.mutation({
      query: (notificationId) => ({
        url: `/notifications/${notificationId}/read`,
        method: "PUT",
      }),
      invalidatesTags: ["notifications"],
    }),
    markAllAsRead: builder.mutation({
      query: () => ({
        url: '/notifications/my/mark-all-read',
        method: "PUT",
      }),
      invalidatesTags: ["notifications"],
    }),
    deleteNotification: builder.mutation({
      query: (notificationId) => ({
        url: `/notifications/${notificationId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["notifications"],
    }),
  }),
});

export const { 
  useGetIdeasQuery, 
  useGetIdeaDetailQuery,
  useMoveForwardIdeaMutation,
  useCreateIdeaMutation, 
  useUpdateIdeaMutation, 
  useDeleteIdeaMutation, 
  useGetContentQuery, 
  useCreateContentMutation, 
  useUpdateContentMutation, 
  useDeleteContentMutation, 
  useGetAllEmployeesQuery,
  useGetEmployeesByDepartmentQuery,
  useGetContentEmployeesQuery,
  useGetScriptWritersQuery,
  useGetContributorsQuery,
  useGetDirectorsQuery,
  useGetEditorsQuery,
  useGetCastAndPresentersQuery,
  useGetProductionQuery, 
  useCreateProductionMutation, 
  useUpdateProductionMutation, 
  useDeleteProductionMutation, 
  useGetProductionEmployeesQuery, 
  useGetSocialMediaQuery, 
  useCreateSocialMediaMutation, 
  useUpdateSocialMediaMutation, 
  useDeleteSocialMediaMutation,
  useGetMyNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation
} = apiSlice;
