import { api } from "@/lib/api";
import { FeedResponse, FeedComment } from "@/types/activities";

export const activityService = {
  async getFeed(page = 1, limit = 10): Promise<FeedResponse> {
    const response = await api.get<FeedResponse>("/activities/feed", {
      params: { page, limit },
    });
    return response.data;
  },

  async likeActivity(activityId: string): Promise<void> {
    await api.post(`/activities/${activityId}/like`);
  },

  async unlikeActivity(activityId: string): Promise<void> {
    await api.delete(`/activities/${activityId}/like`);
  },

  async addComment(activityId: string, content: string): Promise<FeedComment> {
    const response = await api.post<FeedComment>(
      `/activities/${activityId}/comments`,
      {
        content,
      },
    );
    return response.data;
  },

  async removeComment(commentId: string): Promise<void> {
    await api.delete(`/activities/comments/${commentId}`);
  },

  async deleteActivity(activityId: string): Promise<void> {
    await api.delete(`/activities/${activityId}`);
  },
};
