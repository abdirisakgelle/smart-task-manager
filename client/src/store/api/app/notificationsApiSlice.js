import { apiSlice } from "../apiSlice";

export const notificationsApi = apiSlice.injectEndpoints({
  tagTypes: ["notifications"],
  endpoints: (builder) => ({
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
  useGetMyNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
} = notificationsApi; 