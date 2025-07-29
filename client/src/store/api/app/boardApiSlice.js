import { apiSlice } from "../apiSlice";

export const boardApi = apiSlice.injectEndpoints({
  tagTypes: ["boards"],
  endpoints: (builder) => ({
    getBoards: builder.query({
      query: () => ({
        url: `boards`,
        method: "GET",
      }),
      providesTags: ["boards"],
    }),
    createBoard: builder.mutation({
      query: (board) => ({
        url: "/boards",
        method: "POST",
        body: board,
      }),
      invalidatesTags: ["boards"],
    }),
    editBoard: builder.mutation({
      query: ({ boardId, board }) => ({
        url: `/boards/${boardId}`,
        method: "PUT",
        body: { boardId, ...board },
      }),
      invalidatesTags: ["boards"],
    }),
    createTask: builder.mutation({
      query: ({ boardId, ...task }) => ({
        url: `/boards/${boardId}/tasks`,
        method: "POST",
        body: task,
      }),
      invalidatesTags: ["boards"],
      // Add notification creation after task creation
      async onQueryStarted({ boardId, ...task }, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          // Create notifications for assigned users
          if (task.assign && task.assign.length > 0) {
            const notificationData = {
              taskData: task,
              assignedUsers: task.assign
            };
            
            // Call notification creation endpoint
            const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : '';
            fetch(`${baseUrl}/api/notifications/task-assignment`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              },
              body: JSON.stringify(notificationData)
            }).then(response => {
              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }
              return response.json();
            }).then(data => {
              console.log('✅ Task assignment notifications created:', data);
            }).catch(err => {
              console.error('❌ Error creating task assignment notifications:', err);
            });
          }
        } catch (error) {
          console.error('Error in task creation:', error);
        }
      },
    }),
    editTask: builder.mutation({
      query: ({ boardId, taskId, task }) => ({
        url: `/boards/${boardId}/tasks/${taskId}`,
        method: "PUT",
        body: { taskId, ...task },
      }),
      invalidatesTags: ["boards"],
    }),
    deleteBoard: builder.mutation({
      query: (id) => ({
        url: `/boards/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["boards"],
    }),
    deleteTask: builder.mutation({
      query: ({ boardId, taskId }) => ({
        url: `/boards/${boardId}/tasks/${taskId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["boards"],
    }),
  }),
});

export const {
  useGetBoardsQuery,
  useCreateBoardMutation,
  useCreateTaskMutation,
  useDeleteBoardMutation,
  useDeleteTaskMutation,
  useEditBoardMutation,
  useEditTaskMutation,
} = boardApi;
