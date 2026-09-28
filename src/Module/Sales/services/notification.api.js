import apiClient from "./axiosInstance";

/**
 * Fetch list of notifications (optional filter="unread", limit)
 */
export const getNotificationsApi = async (params = {}) => {
  try {
    return await apiClient.get("/notifications", { params });
  } catch (error) {
    console.error("API getNotificationsApi error:", error);
    return { success: false, data: { notifications: [], unreadCount: 0 } };
  }
};

/**
 * Fetch unread notification count
 */
export const getUnreadCountApi = async () => {
  try {
    return await apiClient.get("/notifications/unread-count");
  } catch (error) {
    console.error("API getUnreadCountApi error:", error);
    return { success: false, data: { unreadCount: 0 } };
  }
};

/**
 * Mark a single notification as read
 */
export const markNotificationReadApi = async (id) => {
  try {
    return await apiClient.patch(`/notifications/${id}/read`);
  } catch (error) {
    console.error("API markNotificationReadApi error:", error);
    return { success: false, message: error.message };
  }
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsReadApi = async () => {
  try {
    return await apiClient.patch("/notifications/mark-all-read");
  } catch (error) {
    console.error("API markAllNotificationsReadApi error:", error);
    return { success: false, message: error.message };
  }
};

/**
 * Delete a notification
 */
export const deleteNotificationApi = async (id) => {
  try {
    return await apiClient.delete(`/notifications/${id}`);
  } catch (error) {
    console.error("API deleteNotificationApi error:", error);
    return { success: false, message: error.message };
  }
};
