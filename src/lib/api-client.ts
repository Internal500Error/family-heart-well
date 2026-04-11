/**
 * API Client Service — DilCare Backend Integration
 * Web version of the API client (for DilCareGit)
 * Connects to the Django REST Framework backend at /api/v1/
 */

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/+$/, '') ||
  'http://localhost:8000/api/v1';

const TOKEN_KEY = 'dilcare_access_token';
const REFRESH_KEY = 'dilcare_refresh_token';

console.log('[API Client] Initialized with base URL:', API_BASE_URL);

// ─── Token Management ──────────────────────────────────────────────
export const tokenManager = {
  getAccessToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },

  getRefreshToken: (): string | null => {
    return localStorage.getItem(REFRESH_KEY);
  },

  setTokens: (access: string, refresh: string): void => {
    localStorage.setItem(TOKEN_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
  },

  clearTokens: (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },

  isLoggedIn: (): boolean => {
    return !!localStorage.getItem(TOKEN_KEY);
  },
};

// ─── Types ─────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}

interface ApiCallOptions {
  method?: string;
  body?: Record<string, unknown> | string | FormData;
  auth?: boolean;
}

// ─── HTTP Client ───────────────────────────────────────────────────
async function apiCall<T>(
  endpoint: string,
  options: ApiCallOptions = {},
): Promise<ApiResponse<T>> {
  const { method = 'GET', body, auth = true } = options;

  const headers: Record<string, string> = {};

  if (!(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (auth) {
    const token = tokenManager.getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  try {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`[API Request] ${method} ${endpoint}`);

    const fetchOptions: RequestInit = {
      method,
      headers,
      body: body
        ? body instanceof FormData
          ? body
          : typeof body === 'string'
            ? body
            : JSON.stringify(body)
        : undefined,
    };

    let response = await fetch(url, fetchOptions);

    // Handle 401 → try refresh token
    if (response.status === 401 && auth) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        const newToken = tokenManager.getAccessToken();
        if (newToken) {
          headers['Authorization'] = `Bearer ${newToken}`;
          fetchOptions.headers = headers;
          response = await fetch(url, fetchOptions);
        }
      } else {
        return {
          data: null,
          error: 'Session expired. Please log in again.',
          status: 401,
        };
      }
    }

    const responseText = await response.text();
    let data: T | null = null;

    if (responseText && response.headers.get('content-type')?.includes('application/json')) {
      try {
        data = JSON.parse(responseText);
      } catch {
        // Not JSON
      }
    }

    const error = response.ok ? null : responseText || `HTTP ${response.status}`;

    console.log(
      `[API Response] ${endpoint} - Status: ${response.status}`,
      response.ok ? '✓' : '✗',
    );

    return { data, error, status: response.status };
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : 'Unknown network error';
    console.error(`[API Error] ${endpoint}:`, errorMessage);
    return {
      data: null,
      error: `Network error: ${errorMessage}`,
      status: 0,
    };
  }
}

async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = tokenManager.getRefreshToken();
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (response.ok) {
      const data = await response.json();
      tokenManager.setTokens(data.access, data.refresh || refreshToken);
      return true;
    }
  } catch (err) {
    console.error('[Token Refresh Error]:', err);
  }

  return false;
}

// ════════════════════════════════════════════════════════════════════
// AUTH SERVICE
// ════════════════════════════════════════════════════════════════════
export const authService = {
  register: async (email: string, password: string, name?: string) => {
    return apiCall<any>('/auth/register/', {
      method: 'POST',
      body: {
        email,
        password,
        password_confirm: password,
        name: name || '',
      },
      auth: false,
    });
  },

  login: async (email: string, password: string) => {
    const resp = await apiCall<{ access: string; refresh: string }>('/auth/login/', {
      method: 'POST',
      body: { email, password },
      auth: false,
    });
    if (resp.data) {
      tokenManager.setTokens(resp.data.access, resp.data.refresh);
    }
    return resp;
  },

  logout: async () => {
    const refreshToken = tokenManager.getRefreshToken();
    if (refreshToken) {
      await apiCall('/auth/logout/', {
        method: 'POST',
        body: { refresh: refreshToken },
      });
    }
    tokenManager.clearTokens();
    return { data: null, error: null, status: 200 };
  },

  isLoggedIn: (): boolean => {
    return tokenManager.isLoggedIn();
  },
};

// ════════════════════════════════════════════════════════════════════
// USER SERVICE
// ════════════════════════════════════════════════════════════════════
export const userService = {
  me: () => apiCall<any>('/user/me/'),

  getProfile: () => apiCall<any>('/user/profile/'),

  updateProfile: (profile: Record<string, unknown>) =>
    apiCall<any>('/user/profile/', { method: 'PATCH', body: profile }),

  getSettings: () => apiCall<any>('/user/settings/'),

  updateSettings: (settings: Record<string, unknown>) =>
    apiCall<any>('/user/settings/', { method: 'PATCH', body: settings }),

  changePassword: (currentPassword: string, newPassword: string) =>
    apiCall<any>('/user/change-password/', {
      method: 'POST',
      body: {
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirm: newPassword,
      },
    }),

  getParentLinkCode: () => apiCall<any>('/user/link-code/'),

  regenerateLinkCode: () =>
    apiCall<any>('/user/link-code/regenerate/', { method: 'POST' }),

  getDevices: () => apiCall<any>('/user/devices/'),

  registerDevice: (device: Record<string, unknown>) =>
    apiCall<any>('/user/devices/', { method: 'POST', body: device }),

  removeDevice: (token: string) =>
    apiCall<void>(`/user/devices/${encodeURIComponent(token)}/`, {
      method: 'DELETE',
    }),
};

// ════════════════════════════════════════════════════════════════════
// HEALTH SERVICE
// ════════════════════════════════════════════════════════════════════
export const healthService = {
  getHealthReadings: (params?: Record<string, string | number>) => {
    let endpoint = '/health/readings/';
    if (params) {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        queryParams.append(key, String(value));
      });
      const queryString = queryParams.toString();
      if (queryString) endpoint += `?${queryString}`;
    }
    return apiCall<any[]>(endpoint);
  },

  addHealthReading: (reading: Record<string, unknown>) =>
    apiCall<any>('/health/readings/', { method: 'POST', body: reading }),

  getHealthReading: (id: string) =>
    apiCall<any>(`/health/readings/${id}/`),

  deleteHealthReading: (id: string) =>
    apiCall<void>(`/health/readings/${id}/`, { method: 'DELETE' }),

  getHealthSummary: () => apiCall<any[]>('/health/summary/'),

  getHealthTrends: (type?: string, period?: string) => {
    let endpoint = '/health/trends/';
    const queryParams = new URLSearchParams();
    if (type) queryParams.append('type', type);
    if (period) queryParams.append('period', period);
    const queryString = queryParams.toString();
    if (queryString) endpoint += `?${queryString}`;
    return apiCall<any>(endpoint);
  },

  getHealthGoals: () => apiCall<any[]>('/health/goals/'),

  setHealthGoal: (goal: Record<string, unknown>) =>
    apiCall<any>('/health/goals/', { method: 'POST', body: goal }),
};

// ════════════════════════════════════════════════════════════════════
// MEDICINE SERVICE
// ════════════════════════════════════════════════════════════════════
export const medicineService = {
  getMedicines: (isActive?: boolean) => {
    const params = isActive !== undefined ? `?is_active=${isActive}` : '';
    return apiCall<any[]>(`/medicine/medicines/${params}`);
  },

  getMedicine: (id: string) =>
    apiCall<any>(`/medicine/medicines/${id}/`),

  addMedicine: (medicine: Record<string, unknown>) =>
    apiCall<any>('/medicine/medicines/', { method: 'POST', body: medicine }),

  updateMedicine: (id: string, medicine: Record<string, unknown>) =>
    apiCall<any>(`/medicine/medicines/${id}/`, { method: 'PATCH', body: medicine }),

  deleteMedicine: (id: string) =>
    apiCall<void>(`/medicine/medicines/${id}/`, { method: 'DELETE' }),

  getTodayMedicines: (date?: string) => {
    const params = date ? `?date=${date}` : '';
    return apiCall<any[]>(`/medicine/today/${params}`);
  },

  getIntakes: (params?: Record<string, string>) => {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return apiCall<any[]>(`/medicine/intakes/${queryString}`);
  },

  toggleMedicineIntake: (intakeId: string, data?: Record<string, unknown>) =>
    apiCall<any>(`/medicine/intakes/${intakeId}/toggle/`, {
      method: 'POST',
      body: data || {},
    }),

  getSummary: () => apiCall<any>('/medicine/summary/'),

  getPrescriptions: () => apiCall<any[]>('/medicine/prescriptions/'),

  addPrescription: (prescription: Record<string, unknown>) =>
    apiCall<any>('/medicine/prescriptions/', { method: 'POST', body: prescription }),

  getPrescription: (id: string) =>
    apiCall<any>(`/medicine/prescriptions/${id}/`),

  updatePrescription: (id: string, prescription: Record<string, unknown>) =>
    apiCall<any>(`/medicine/prescriptions/${id}/`, { method: 'PATCH', body: prescription }),

  deletePrescription: (id: string) =>
    apiCall<void>(`/medicine/prescriptions/${id}/`, { method: 'DELETE' }),
};

// ════════════════════════════════════════════════════════════════════
// WATER SERVICE
// ════════════════════════════════════════════════════════════════════
export const waterService = {
  getTodayWater: () => apiCall<any>('/water/today/'),

  addGlass: () => apiCall<any>('/water/add/', { method: 'POST', body: {} }),

  removeGlass: () => apiCall<any>('/water/remove/', { method: 'POST', body: {} }),

  getHistory: (params?: Record<string, string | number>) => {
    let endpoint = '/water/history/';
    if (params) {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        queryParams.append(key, String(value));
      });
      const queryString = queryParams.toString();
      if (queryString) endpoint += `?${queryString}`;
    }
    return apiCall<any>(endpoint);
  },

  getStats: () => apiCall<any>('/water/stats/'),

  getGoal: () => apiCall<any>('/water/goal/'),

  setGoal: (goal: Record<string, unknown>) =>
    apiCall<any>('/water/goal/', { method: 'PATCH', body: goal }),

  getLogs: (date?: string) => {
    const endpoint = date ? `/water/logs/${date}/` : '/water/logs/';
    return apiCall<any>(endpoint);
  },
};

// ════════════════════════════════════════════════════════════════════
// STEPS SERVICE
// ════════════════════════════════════════════════════════════════════
export const stepsService = {
  getTodaySteps: () => apiCall<any>('/steps/today/'),

  addSteps: (steps: Record<string, unknown>) =>
    apiCall<any>('/steps/add/', { method: 'POST', body: steps }),

  removeSteps: (data: Record<string, unknown>) =>
    apiCall<any>('/steps/remove/', { method: 'POST', body: data }),

  getGoal: () => apiCall<any>('/steps/goal/'),

  setGoal: (goal: Record<string, unknown>) =>
    apiCall<any>('/steps/goal/', { method: 'PATCH', body: goal }),

  getHistory: (params?: Record<string, string | number>) => {
    let endpoint = '/steps/history/';
    if (params) {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        queryParams.append(key, String(value));
      });
      const queryString = queryParams.toString();
      if (queryString) endpoint += `?${queryString}`;
    }
    return apiCall<any>(endpoint);
  },

  getStats: () => apiCall<any>('/steps/stats/'),

  getWeeklyChart: () => apiCall<any>('/steps/weekly-chart/'),

  getEntries: (params?: Record<string, string | number>) => {
    let endpoint = '/steps/entries/';
    if (params) {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        queryParams.append(key, String(value));
      });
      const queryString = queryParams.toString();
      if (queryString) endpoint += `?${queryString}`;
    }
    return apiCall<any[]>(endpoint);
  },

  syncGoogleFit: (access_token: string) => apiCall<any>('/steps/sync/google-fit/', {
    method: 'POST',
    body: { access_token }
  }),
};

// ════════════════════════════════════════════════════════════════════
// FAMILY SERVICE
// ════════════════════════════════════════════════════════════════════
export const familyService = {
  getLinkedParents: () => apiCall<any[]>('/family/parents/'),

  linkParent: (linkCode: string) =>
    apiCall<any>('/family/link/', { method: 'POST', body: { link_code: linkCode } }),

  unlinkParent: (parentId: string) =>
    apiCall<void>(`/family/unlink/${parentId}/`, { method: 'POST' }),

  getParentHealth: (parentId: string) =>
    apiCall<any>(`/family/parents/${parentId}/health/`),

  getMyLinkCode: () => apiCall<any>('/family/my-code/'),
};

// ════════════════════════════════════════════════════════════════════
// DOCTOR SERVICE
// ════════════════════════════════════════════════════════════════════
export const doctorService = {
  getDoctors: () => apiCall<any[]>('/doctor/doctors/'),

  addDoctor: (doctor: Record<string, unknown>) =>
    apiCall<any>('/doctor/doctors/', { method: 'POST', body: doctor }),

  getDoctor: (id: string) =>
    apiCall<any>(`/doctor/doctors/${id}/`),

  updateDoctor: (id: string, doctor: Record<string, unknown>) =>
    apiCall<any>(`/doctor/doctors/${id}/`, { method: 'PATCH', body: doctor }),

  deleteDoctor: (id: string) =>
    apiCall<void>(`/doctor/doctors/${id}/`, { method: 'DELETE' }),

  getAppointments: (params?: Record<string, string>) => {
    let endpoint = '/doctor/appointments/';
    if (params) {
      const queryString = new URLSearchParams(params).toString();
      if (queryString) endpoint += `?${queryString}`;
    }
    return apiCall<any[]>(endpoint);
  },

  addAppointment: (appointment: Record<string, unknown>) =>
    apiCall<any>('/doctor/appointments/', { method: 'POST', body: appointment }),

  getAppointment: (id: string) =>
    apiCall<any>(`/doctor/appointments/${id}/`),

  updateAppointment: (id: string, appointment: Record<string, unknown>) =>
    apiCall<any>(`/doctor/appointments/${id}/`, { method: 'PATCH', body: appointment }),

  deleteAppointment: (id: string) =>
    apiCall<void>(`/doctor/appointments/${id}/`, { method: 'DELETE' }),

  getAppointmentStats: () => apiCall<any>('/doctor/appointments/stats/'),

  getDocuments: () => apiCall<any[]>('/doctor/documents/'),

  addDocument: (document: Record<string, unknown>) =>
    apiCall<any>('/doctor/documents/', { method: 'POST', body: document }),

  getDocument: (id: string) =>
    apiCall<any>(`/doctor/documents/${id}/`),

  updateDocument: (id: string, document: Record<string, unknown>) =>
    apiCall<any>(`/doctor/documents/${id}/`, { method: 'PATCH', body: document }),

  deleteDocument: (id: string) =>
    apiCall<void>(`/doctor/documents/${id}/`, { method: 'DELETE' }),
};

// ════════════════════════════════════════════════════════════════════
// BMI SERVICE
// ════════════════════════════════════════════════════════════════════
export const bmiService = {
  getRecords: () => apiCall<any[]>('/bmi/'),

  addRecord: (record: Record<string, unknown>) =>
    apiCall<any>('/bmi/', { method: 'POST', body: record }),

  getRecord: (id: string) =>
    apiCall<any>(`/bmi/${id}/`),

  updateRecord: (id: string, record: Record<string, unknown>) =>
    apiCall<any>(`/bmi/${id}/`, { method: 'PATCH', body: record }),

  deleteRecord: (id: string) =>
    apiCall<void>(`/bmi/${id}/`, { method: 'DELETE' }),

  getStats: () => apiCall<any>('/bmi/stats/'),
};

// ════════════════════════════════════════════════════════════════════
// SOS SERVICE
// ════════════════════════════════════════════════════════════════════
export const sosService = {
  getEmergencyContacts: () => apiCall<any[]>('/sos/contacts/'),

  addEmergencyContact: (contact: Record<string, unknown>) =>
    apiCall<any>('/sos/contacts/', { method: 'POST', body: contact }),

  getEmergencyContact: (id: string) =>
    apiCall<any>(`/sos/contacts/${id}/`),

  updateEmergencyContact: (id: string, contact: Record<string, unknown>) =>
    apiCall<any>(`/sos/contacts/${id}/`, { method: 'PATCH', body: contact }),

  deleteEmergencyContact: (id: string) =>
    apiCall<void>(`/sos/contacts/${id}/`, { method: 'DELETE' }),

  triggerSOS: (data?: Record<string, unknown>) =>
    apiCall<any>('/sos/trigger/', { method: 'POST', body: data || {} }),

  getAlerts: () => apiCall<any[]>('/sos/alerts/'),

  resolveAlert: (id: string) =>
    apiCall<any>(`/sos/alerts/${id}/resolve/`, { method: 'POST', body: {} }),
};

// ════════════════════════════════════════════════════════════════════
// GYAAN (EDUCATION) SERVICE
// ════════════════════════════════════════════════════════════════════
export const gyaanService = {
  getTips: (params?: Record<string, string | number>) => {
    let endpoint = '/gyaan/tips/';
    if (params) {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        queryParams.append(key, String(value));
      });
      const queryString = queryParams.toString();
      if (queryString) endpoint += `?${queryString}`;
    }
    return apiCall<any[]>(endpoint);
  },

  getTip: (id: string) =>
    apiCall<any>(`/gyaan/tips/${id}/`),

  toggleFavorite: (id: string) =>
    apiCall<any>(`/gyaan/tips/${id}/favorite/`, { method: 'POST', body: {} }),

  markComplete: (id: string) =>
    apiCall<any>(`/gyaan/tips/${id}/complete/`, { method: 'POST', body: {} }),

  getStats: () => apiCall<any>('/gyaan/stats/'),
};

// ════════════════════════════════════════════════════════════════════
// COMMUNITY SERVICE
// ════════════════════════════════════════════════════════════════════
const NOTIFICATIONS_CACHE_TTL_MS = 30_000;
let notificationsCache: { data: any[]; fetchedAt: number } | null = null;
let notificationsInFlight: Promise<ApiResponse<any[]>> | null = null;

const clearNotificationsCache = () => {
  notificationsCache = null;
};

export const communityService = {
  getLeaderboard: (params?: Record<string, string | number>) => {
    let endpoint = '/community/leaderboard/';
    if (params) {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        queryParams.append(key, String(value));
      });
      const queryString = queryParams.toString();
      if (queryString) endpoint += `?${queryString}`;
    }
    return apiCall<any>(endpoint);
  },

  // Groups
  getGroups: () => apiCall<any[]>('/community/groups/'),

  addGroup: (group: Record<string, unknown>) =>
    apiCall<any>('/community/groups/', { method: 'POST', body: group }),

  getGroup: (id: string) =>
    apiCall<any>(`/community/groups/${id}/`),

  updateGroup: (id: string, group: Record<string, unknown>) =>
    apiCall<any>(`/community/groups/${id}/`, { method: 'PATCH', body: group }),

  getGroupMembers: (id: string) =>
    apiCall<any[]>(`/community/groups/${id}/members/`),

  updateGroupMemberRole: (groupId: string, memberId: string, role: 'admin' | 'moderator' | 'member') =>
    apiCall<any>(`/community/groups/${groupId}/roles/`, {
      method: 'POST',
      body: { member_id: memberId, role },
    }),

  removeGroupMember: (groupId: string, memberId: string) =>
    apiCall<any>(`/community/groups/${groupId}/members/${memberId}/remove/`, {
      method: 'POST',
      body: {},
    }),

  joinGroup: (groupId: string) =>
    apiCall<any>('/community/groups/join/', { method: 'POST', body: { group_id: groupId } }),

  joinGroupByInvite: (inviteCode: string) =>
    apiCall<any>('/community/groups/join/', { method: 'POST', body: { invite_code: inviteCode } }),

  leaveGroup: (id: string) =>
    apiCall<any>(`/community/groups/${id}/leave/`, { method: 'POST', body: {} }),

  // Challenges
  getChallenges: (params?: Record<string, string | number>) => {
    let endpoint = '/community/challenges/';
    if (params) {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        queryParams.append(key, String(value));
      });
      const queryString = queryParams.toString();
      if (queryString) endpoint += `?${queryString}`;
    }
    return apiCall<any[]>(endpoint);
  },

  addChallenge: (challenge: Record<string, unknown>) =>
    apiCall<any>('/community/challenges/', { method: 'POST', body: challenge }),

  getChallenge: (id: string) =>
    apiCall<any>(`/community/challenges/${id}/`),

  updateChallenge: (id: string, challenge: Record<string, unknown>) =>
    apiCall<any>(`/community/challenges/${id}/`, { method: 'PATCH', body: challenge }),

  joinChallenge: (id: string) =>
    apiCall<any>(`/community/challenges/${id}/join/`, { method: 'POST', body: {} }),

  leaveChallenge: (id: string) =>
    apiCall<any>(`/community/challenges/${id}/leave/`, { method: 'POST', body: {} }),

  getChallengeParticipants: (id: string) =>
    apiCall<any[]>(`/community/challenges/${id}/participants/`),

  refreshChallengeProgress: (id: string) =>
    apiCall<any>(`/community/challenges/${id}/refresh/`, { method: 'POST', body: {} }),

  // Notifications
  getNotifications: (forceRefresh = false) => {
    const now = Date.now();
    if (!forceRefresh && notificationsCache && now - notificationsCache.fetchedAt < NOTIFICATIONS_CACHE_TTL_MS) {
      return Promise.resolve({ data: notificationsCache.data, error: null, status: 200 });
    }

    if (!forceRefresh && notificationsInFlight) {
      return notificationsInFlight;
    }

    notificationsInFlight = apiCall<any[]>('/community/notifications/')
      .then((response) => {
        if (!response.error && response.data) {
          const payload = response.data as any;
          const data = Array.isArray(payload)
            ? payload
            : (payload as { results?: any[] })?.results ?? [];
          notificationsCache = {
            data: Array.isArray(data) ? data : [],
            fetchedAt: Date.now(),
          };
        }
        return response;
      })
      .finally(() => {
        notificationsInFlight = null;
      });

    return notificationsInFlight;
  },

  markNotificationRead: (id: string) =>
    apiCall<any>(`/community/notifications/${id}/read/`, { method: 'POST', body: {} }).then((response) => {
      if (!response.error) clearNotificationsCache();
      return response;
    }),

  markAllNotificationsRead: () =>
    apiCall<any>('/community/notifications/read-all/', { method: 'POST', body: {} }).then((response) => {
      if (!response.error) clearNotificationsCache();
      return response;
    }),

  getUnreadCount: () => apiCall<any>('/community/notifications/unread-count/'),

  // Feed
  getFeed: (params?: Record<string, string | number>) => {
    let endpoint = '/community/feed/';
    if (params) {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        queryParams.append(key, String(value));
      });
      const queryString = queryParams.toString();
      if (queryString) endpoint += `?${queryString}`;
    }
    return apiCall<any[]>(endpoint);
  },

  addFeedPost: (payload: { content: string; group?: string }) =>
    apiCall<any>('/community/feed/', { method: 'POST', body: payload }),

  syncMilestones: () =>
    apiCall<any>('/community/feed/milestones/sync/', { method: 'POST', body: {} }),

  toggleFeedLike: (postId: string) =>
    apiCall<any>(`/community/feed/${postId}/like/`, { method: 'POST', body: {} }),

  getFeedComments: (postId: string) =>
    apiCall<any[]>(`/community/feed/${postId}/comments/`),

  addFeedComment: (postId: string, content: string) =>
    apiCall<any>(`/community/feed/${postId}/comments/`, {
      method: 'POST',
      body: { content },
    }),

  // Group Chat
  getGroupChat: (groupId: string) =>
    apiCall<any[]>(`/community/groups/${groupId}/chat/`),

  getGroupChatUnread: () =>
    apiCall<any[]>('/community/groups/chat/unread/'),

  sendGroupChatMessage: (groupId: string, content: string) =>
    apiCall<any>(`/community/groups/${groupId}/chat/`, {
      method: 'POST',
      body: { content },
    }),

  // Badges
  getMyBadges: () => apiCall<any[]>('/community/badges/me/'),

  // Notification preferences
  getNotificationPreferences: () => apiCall<any>('/community/notifications/preferences/'),
  updateNotificationPreferences: (payload: Record<string, unknown>) =>
    apiCall<any>('/community/notifications/preferences/', { method: 'PATCH', body: payload }),
  getGroupNotificationPreferences: () => apiCall<any[]>('/community/notifications/group-preferences/'),
  setGroupMute: (groupId: string, isMuted: boolean) =>
    apiCall<any>('/community/notifications/group-preferences/', {
      method: 'POST',
      body: { group: groupId, is_muted: isMuted },
    }),

  // Moderation
  getMyModerationReports: () => apiCall<any[]>('/community/moderation/reports/'),
  createModerationReport: (payload: { target_type: 'post' | 'comment' | 'chat_message'; target_id: string; reason: string }) =>
    apiCall<any>('/community/moderation/reports/', {
      method: 'POST',
      body: payload,
    }),
};

// ════════════════════════════════════════════════════════════════════
// LOCATION SERVICE
// ════════════════════════════════════════════════════════════════════
export const locationService = {
  getSettings: () => apiCall<any>('/location/settings/'),

  updateSettings: (settings: Record<string, unknown>) =>
    apiCall<any>('/location/settings/', { method: 'PATCH', body: settings }),

  uploadLocationPing: (location: Record<string, unknown>) =>
    apiCall<any>('/location/pings/', { method: 'POST', body: location }),

  getMyLatestLocation: () => apiCall<any>('/location/me/latest/'),

  getFamilyLiveLocations: () => apiCall<any>('/location/family/live/'),

  getFamilyLocationHistory: (memberId: string | number, params?: Record<string, string>) => {
    let endpoint = `/location/family/${memberId}/history/`;
    if (params) {
      const queryString = new URLSearchParams(params).toString();
      if (queryString) endpoint += `?${queryString}`;
    }
    return apiCall<any>(endpoint);
  },

  getPermissions: () => apiCall<any[]>('/location/permissions/'),

  updatePermission: (id: string, permission: Record<string, unknown>) =>
    apiCall<any>(`/location/permissions/${id}/`, { method: 'PATCH', body: permission }),

  getGeofences: () => apiCall<any[]>('/location/geofences/'),

  addGeofence: (geofence: Record<string, unknown>) =>
    apiCall<any>('/location/geofences/', { method: 'POST', body: geofence }),

  getGeofence: (id: string) =>
    apiCall<any>(`/location/geofences/${id}/`),

  updateGeofence: (id: string, geofence: Record<string, unknown>) =>
    apiCall<any>(`/location/geofences/${id}/`, { method: 'PATCH', body: geofence }),

  deleteGeofence: (id: string) =>
    apiCall<void>(`/location/geofences/${id}/`, { method: 'DELETE' }),

  getGeofenceEvents: () => apiCall<any[]>('/location/geofences/events/'),
};

// ════════════════════════════════════════════════════════════════════
// Export default
// ════════════════════════════════════════════════════════════════════
export default {
  tokenManager,
  authService,
  userService,
  healthService,
  medicineService,
  waterService,
  stepsService,
  familyService,
  doctorService,
  bmiService,
  sosService,
  gyaanService,
  communityService,
  locationService,
};
