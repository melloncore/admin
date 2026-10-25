import { apiRequest } from "./http";

interface ApiList<T> {
  [key: string]: T[] | undefined;
}

interface ApiItem<T> {
  [key: string]: T | undefined;
}

export type BackendBookStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
export interface BackendBook {
  id: string;
  customer: string;
  item: string;
  description: string | null;
  quantity: number;
  amount: number | string;
  status: BackendBookStatus;
  date: string;
  createdAt: string;
  updatedAt: string;
}

type BackendBookInput = Omit<BackendBook, "id" | "createdAt" | "updatedAt" | "amount"> & {
  amount: number;
};

export type BackendRoleStatus = "ACTIVE" | "ARCHIVED";
export interface BackendRoleClarity {
  id: string;
  role: string;
  department: string;
  responsibility: string;
  report: string;
  keyKpi: string;
  status: BackendRoleStatus;
  createdAt: string;
  updatedAt: string;
}

export type BackendDailyTaskStatus = "NOT_STARTED" | "IN_PROGRESS" | "DONE" | "BLOCKED";
export interface BackendDailyTask {
  id: string;
  title: string;
  description: string | null;
  date: string;
  status: BackendDailyTaskStatus;
  assigneeId: string | null;
  teamId: string | null;
  assignedById: string;
  createdAt: string;
  updatedAt: string;
}

export interface BackendDecision {
  id: string;
  title: string;
  description: string;
  status: "PENDING" | "APPROVED" | "CANCELLED";
  eligibleVoterIds: string[];
  createdById: string;
  votes: Array<{ voterId: string; choice: "YES" | "NO"; createdAt: string }>;
  createdAt: string;
  updatedAt: string;
}

export type BackendTargetStatus = "UNASSIGNED" | "ASSIGNED" | "IN_PROGRESS" | "CLOSED";
export interface BackendTarget {
  id: string;
  name: string;
  contactInfo: string | null;
  notes: string | null;
  status: BackendTargetStatus;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface BackendTeam {
  id: string;
  name: string;
  members: Array<{
    id: string;
    email: string;
    name: string | null;
    role: "ADMIN" | "STAFF";
    title: string;
  }>;
  _count: { tasks: number };
  createdAt: string;
}

function listFrom<T>(response: ApiList<T>, key: string): T[] {
  const list = response[key];
  if (!Array.isArray(list)) throw new Error(`Backend response is missing "${key}".`);
  return list;
}

function itemFrom<T>(response: ApiItem<T>, key: string): T {
  const item = response[key];
  if (!item) throw new Error(`Backend response is missing "${key}".`);
  return item;
}

export const operationsApi = {
  teams: {
    async list() {
      return listFrom(await apiRequest<ApiList<BackendTeam>>("/teams"), "teams");
    },
    async create(name: string) {
      return itemFrom(
        await apiRequest<ApiItem<BackendTeam>>("/teams", {
          method: "POST",
          body: JSON.stringify({ name }),
        }),
        "team",
      );
    },
    async setMembers(id: string, adminIds: string[]) {
      return itemFrom(
        await apiRequest<ApiItem<BackendTeam>>(
          `/teams/${encodeURIComponent(id)}/members`,
          {
            method: "PUT",
            body: JSON.stringify({ adminIds }),
          },
        ),
        "team",
      );
    },
  },
  books: {
    async list() {
      return listFrom(await apiRequest<ApiList<BackendBook>>("/books"), "books");
    },
    async get(id: string) {
      return itemFrom(
        await apiRequest<ApiItem<BackendBook>>(`/books/${encodeURIComponent(id)}`),
        "book",
      );
    },
    async create(input: BackendBookInput) {
      return itemFrom(
        await apiRequest<ApiItem<BackendBook>>("/books", {
          method: "POST",
          body: JSON.stringify(input),
        }),
        "book",
      );
    },
    async update(id: string, input: Partial<BackendBookInput>) {
      return itemFrom(
        await apiRequest<ApiItem<BackendBook>>(`/books/${encodeURIComponent(id)}`, {
          method: "PATCH",
          body: JSON.stringify(input),
        }),
        "book",
      );
    },
    async remove(id: string) {
      await apiRequest(`/books/${encodeURIComponent(id)}`, { method: "DELETE" });
    },
  },
  roleClarity: {
    async list() {
      return listFrom(
        await apiRequest<ApiList<BackendRoleClarity>>("/role"),
        "roleClarities",
      );
    },
    async get(id: string) {
      return itemFrom(
        await apiRequest<ApiItem<BackendRoleClarity>>(`/role/${encodeURIComponent(id)}`),
        "roleClarity",
      );
    },
    async create(input: Omit<BackendRoleClarity, "id" | "createdAt" | "updatedAt">) {
      return itemFrom(
        await apiRequest<ApiItem<BackendRoleClarity>>("/role", {
          method: "POST",
          body: JSON.stringify(input),
        }),
        "roleClarity",
      );
    },
    async update(
      id: string,
      input: Partial<Omit<BackendRoleClarity, "id" | "createdAt" | "updatedAt">>,
    ) {
      return itemFrom(
        await apiRequest<ApiItem<BackendRoleClarity>>(`/role/${encodeURIComponent(id)}`, {
          method: "PATCH",
          body: JSON.stringify(input),
        }),
        "roleClarity",
      );
    },
    async remove(id: string) {
      await apiRequest(`/role/${encodeURIComponent(id)}`, { method: "DELETE" });
    },
  },
  dailyTasks: {
    async list() {
      return listFrom(await apiRequest<ApiList<BackendDailyTask>>("/daily"), "tasks");
    },
    async get(id: string) {
      return itemFrom(
        await apiRequest<ApiItem<BackendDailyTask>>(`/daily/${encodeURIComponent(id)}`),
        "task",
      );
    },
    async create(input: {
      title: string;
      description?: string;
      date: string;
      assigneeId?: string;
      teamId?: string;
    }) {
      return itemFrom(
        await apiRequest<ApiItem<BackendDailyTask>>("/daily", {
          method: "POST",
          body: JSON.stringify(input),
        }),
        "task",
      );
    },
    async updateStatus(id: string, status: BackendDailyTaskStatus) {
      return itemFrom(
        await apiRequest<ApiItem<BackendDailyTask>>(
          `/daily/${encodeURIComponent(id)}/status`,
          {
            method: "PATCH",
            body: JSON.stringify({ status }),
          },
        ),
        "task",
      );
    },
  },
  decisions: {
    async list() {
      return listFrom(
        await apiRequest<ApiList<BackendDecision>>("/decision"),
        "decisions",
      );
    },
    async get(id: string) {
      return itemFrom(
        await apiRequest<ApiItem<BackendDecision>>(`/decision/${encodeURIComponent(id)}`),
        "decision",
      );
    },
    async create(input: { title: string; description: string }) {
      return itemFrom(
        await apiRequest<ApiItem<BackendDecision>>("/decision", {
          method: "POST",
          body: JSON.stringify(input),
        }),
        "decision",
      );
    },
    async vote(id: string, choice: "YES" | "NO") {
      return itemFrom(
        await apiRequest<ApiItem<BackendDecision>>(
          `/decision/${encodeURIComponent(id)}/vote`,
          {
            method: "PATCH",
            body: JSON.stringify({ choice }),
          },
        ),
        "decision",
      );
    },
  },
  targets: {
    async list() {
      return listFrom(await apiRequest<ApiList<BackendTarget>>("/target"), "targets");
    },
    async get(id: string) {
      return itemFrom(
        await apiRequest<ApiItem<BackendTarget>>(`/target/${encodeURIComponent(id)}`),
        "target",
      );
    },
    async create(input: { name: string; contactInfo?: string; notes?: string }) {
      return itemFrom(
        await apiRequest<ApiItem<BackendTarget>>("/target", {
          method: "POST",
          body: JSON.stringify(input),
        }),
        "target",
      );
    },
    async assign(
      id: string,
      input: {
        assigneeId?: string;
        teamId?: string;
        date: string;
        title?: string;
      },
    ) {
      return apiRequest<{
        success: boolean;
        target: BackendTarget;
        task: BackendDailyTask;
      }>(`/target/${encodeURIComponent(id)}/assign`, {
        method: "POST",
        body: JSON.stringify(input),
      });
    },
    async unassign(id: string) {
      return itemFrom(
        await apiRequest<ApiItem<BackendTarget>>(
          `/target/${encodeURIComponent(id)}/unassign`,
          {
            method: "POST",
          },
        ),
        "target",
      );
    },
  },
};
