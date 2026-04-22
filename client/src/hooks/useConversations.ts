import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../api/axios";
import type { Conversation } from "../types";

export const useConversations = (botId: string | undefined) => {
  const queryClient = useQueryClient();

  const useConversationsQuery = (page = 1) => {
    return useQuery({
      queryKey: ["bots", botId, "conversations", { page }],
      queryFn: async () => {
        if (!botId) return { data: [], total: 0, hasMore: false };
        const { data } = await axiosInstance.get<{
          data: Conversation[];
          total: number;
          hasMore: boolean;
        }>(`/bots/${botId}/conversations`, {
          params: { page },
        });
        return data;
      },
      enabled: !!botId,
    });
  };

  const useConversationDetailQuery = (conversationId: string | undefined) => {
    return useQuery({
      queryKey: ["bots", botId, "conversations", conversationId],
      queryFn: async () => {
        if (!botId || !conversationId) return null;
        const { data } = await axiosInstance.get<Conversation>(
          `/bots/${botId}/conversations/${conversationId}`,
        );
        return data;
      },
      enabled: !!botId && !!conversationId,
    });
  };

  const clearConversationsMutation = useMutation({
    mutationFn: async () => {
      await axiosInstance.delete(`/bots/${botId}/conversations`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["bots", botId, "conversations"],
      });
      queryClient.invalidateQueries({ queryKey: ["bots", botId] });
    },
  });

  return {
    useConversationsQuery,
    useConversationDetailQuery,
    clearConversationsMutation,
  };
};
