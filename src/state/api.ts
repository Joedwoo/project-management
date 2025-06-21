import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface Project {
  id: number;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
}

export enum Priority {
  Urgent = "Urgent",
  High = "High",
  Medium = "Medium",
  Low = "Low",
  Backlog = "Backlog",
}

export enum Status {
  ToDo = "To Do",
  WorkInProgress = "Work In Progress",
  UnderReview = "Under Review",
  Completed = "Completed",
}

export interface User {
  userId?: number;
  username: string;
  email: string;
  profilePictureUrl?: string;
  teamId?: number;
}

export interface Attachment {
  id: number;
  fileURL: string;
  fileName: string;
  taskId: number;
  uploadedById: number;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  status?: Status;
  priority?: Priority;
  tags?: string;
  startDate?: string;
  dueDate?: string;
  points?: number;
  projectId: number;
  authorUserId?: number;
  assignedUserId?: number;

  author?: User;
  assignee?: User;
  comments?: Comment[];
  attachments?: Attachment[];
}

export interface SearchResults {
  tasks?: Task[];
  projects?: Project[];
  users?: User[];
}

export interface Team {
  teamId: number;
  teamName: string;
  productOwnerUserId?: number;
  projectManagerUserId?: number;
}

// Mock data for local development
const mockProjects: Project[] = [
  {
    id: 1,
    name: "Apollo",
    description: "A space exploration project.",
    startDate: "2023-01-01T00:00:00Z",
    endDate: "2023-12-31T00:00:00Z"
  },
  {
    id: 2,
    name: "Beacon",
    description: "Developing advanced navigation systems.",
    startDate: "2023-02-01T00:00:00Z",
    endDate: "2023-10-15T00:00:00Z"
  }
];

const mockTasks: Task[] = [
  {
    id: 1,
    title: "Design the main module",
    description: "Create the core design for the main module",
    status: Status.WorkInProgress,
    priority: Priority.Urgent,
    tags: "Design",
    startDate: "2023-01-10T00:00:00Z",
    dueDate: "2023-04-10T00:00:00Z",
    projectId: 1,
    authorUserId: 1,
    assignedUserId: 2,
    points: 8,
    author: { userId: 1, username: "Alice", email: "alice@example.com" },
    assignee: { userId: 2, username: "Bob", email: "bob@example.com" }
  },
  {
    id: 2,
    title: "Implement navigation algorithm",
    description: "Develop the core navigation algorithm",
    status: Status.ToDo,
    priority: Priority.High,
    tags: "Development",
    startDate: "2023-01-15T00:00:00Z",
    dueDate: "2023-05-15T00:00:00Z",
    projectId: 1,
    authorUserId: 1,
    assignedUserId: 3,
    points: 13,
    author: { userId: 1, username: "Alice", email: "alice@example.com" },
    assignee: { userId: 3, username: "Carol", email: "carol@example.com" }
  }
];

const mockUsers: User[] = [
  { userId: 1, username: "Alice", email: "alice@example.com", profilePictureUrl: "p1.jpeg" },
  { userId: 2, username: "Bob", email: "bob@example.com", profilePictureUrl: "p2.jpeg" },
  { userId: 3, username: "Carol", email: "carol@example.com", profilePictureUrl: "p3.jpeg" }
];

const mockTeams: Team[] = [
  { teamId: 1, teamName: "Development Team", productOwnerUserId: 1, projectManagerUserId: 2 },
  { teamId: 2, teamName: "Design Team", productOwnerUserId: 2, projectManagerUserId: 3 }
];

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/mock",
  }),
  reducerPath: "api",
  tagTypes: ["Projects", "Tasks", "Users", "Teams"],
  endpoints: (build) => ({
    getAuthUser: build.query({
      queryFn: async () => {
        // Return mock current user
        return { 
          data: { 
            user: { username: "demo-user" },
            userSub: "demo-123",
            userDetails: mockUsers[0]
          } 
        };
      },
    }),
    getProjects: build.query<Project[], void>({
      queryFn: async () => {
        return { data: mockProjects };
      },
      providesTags: ["Projects"],
    }),
    createProject: build.mutation<Project, Partial<Project>>({
      queryFn: async (project) => {
        const newProject = {
          id: mockProjects.length + 1,
          name: project.name || "New Project",
          description: project.description,
          startDate: project.startDate,
          endDate: project.endDate,
        };
        mockProjects.push(newProject);
        return { data: newProject };
      },
      invalidatesTags: ["Projects"],
    }),
    getTasks: build.query<Task[], { projectId: number }>({
      queryFn: async ({ projectId }) => {
        const filteredTasks = mockTasks.filter(task => task.projectId === projectId);
        return { data: filteredTasks };
      },
      providesTags: (result) =>
        result
          ? result.map(({ id }) => ({ type: "Tasks" as const, id }))
          : [{ type: "Tasks" as const }],
    }),
    getTasksByUser: build.query<Task[], number>({
      queryFn: async (userId) => {
        const userTasks = mockTasks.filter(
          task => task.authorUserId === userId || task.assignedUserId === userId
        );
        return { data: userTasks };
      },
      providesTags: (result, error, userId) =>
        result
          ? result.map(({ id }) => ({ type: "Tasks", id }))
          : [{ type: "Tasks", id: userId }],
    }),
    createTask: build.mutation<Task, Partial<Task>>({
      queryFn: async (task) => {
        const newTask = {
          id: mockTasks.length + 1,
          title: task.title || "New Task",
          description: task.description,
          status: task.status || Status.ToDo,
          priority: task.priority || Priority.Medium,
          tags: task.tags,
          startDate: task.startDate,
          dueDate: task.dueDate,
          points: task.points,
          projectId: task.projectId || 1,
          authorUserId: task.authorUserId || 1,
          assignedUserId: task.assignedUserId,
          author: mockUsers.find(u => u.userId === task.authorUserId),
          assignee: mockUsers.find(u => u.userId === task.assignedUserId),
        };
        mockTasks.push(newTask);
        return { data: newTask };
      },
      invalidatesTags: ["Tasks"],
    }),
    updateTaskStatus: build.mutation<Task, { taskId: number; status: string }>({
      queryFn: async ({ taskId, status }) => {
        const taskIndex = mockTasks.findIndex(task => task.id === taskId);
        if (taskIndex !== -1) {
          mockTasks[taskIndex].status = status as Status;
          return { data: mockTasks[taskIndex] };
        }
        return { error: "Task not found" };
      },
      invalidatesTags: (result, error, { taskId }) => [
        { type: "Tasks", id: taskId },
      ],
    }),
    getUsers: build.query<User[], void>({
      queryFn: async () => {
        return { data: mockUsers };
      },
      providesTags: ["Users"],
    }),
    getTeams: build.query<Team[], void>({
      queryFn: async () => {
        return { data: mockTeams };
      },
      providesTags: ["Teams"],
    }),
    search: build.query<SearchResults, string>({
      queryFn: async (query) => {
        const filteredTasks = mockTasks.filter(
          task => 
            task.title.toLowerCase().includes(query.toLowerCase()) ||
            task.description?.toLowerCase().includes(query.toLowerCase())
        );
        const filteredProjects = mockProjects.filter(
          project => 
            project.name.toLowerCase().includes(query.toLowerCase()) ||
            project.description?.toLowerCase().includes(query.toLowerCase())
        );
        const filteredUsers = mockUsers.filter(
          user => user.username.toLowerCase().includes(query.toLowerCase())
        );
        
        return { 
          data: { 
            tasks: filteredTasks, 
            projects: filteredProjects, 
            users: filteredUsers 
          } 
        };
      },
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useCreateProjectMutation,
  useGetTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskStatusMutation,
  useSearchQuery,
  useGetUsersQuery,
  useGetTeamsQuery,
  useGetTasksByUserQuery,
  useGetAuthUserQuery,
} = api;