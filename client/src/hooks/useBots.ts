import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../api/axios';
import type { Bot } from '../types';

export const useBots = () => {
  const queryClient = useQueryClient();

  const useBotsQuery = () => {
    return useQuery({
      queryKey: ['bots'],
      queryFn: async () => {
        const { data } = await axiosInstance.get<Bot[]>('/bots');
        return data;
      },
    });
  };

  const useBotQuery = (botId: string | undefined) => {
    return useQuery({
      queryKey: ['bots', botId],
      queryFn: async () => {
        if (!botId) return null;
        const { data } = await axiosInstance.get<Bot>(`/bots/${botId}`);
        return data;
      },
      enabled: !!botId,
    });
  };

  const createBotMutation = useMutation({
    mutationFn: async (newBot: { name: string; description?: string }) => {
      const { data } = await axiosInstance.post<Bot>('/bots', newBot);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bots'] });
    },
  });

  const updateBotMutation = useMutation({
    mutationFn: async ({ botId, ...updates }: Partial<Bot> & { botId: string }) => {
      const { data } = await axiosInstance.patch<Bot>(`/bots/${botId}`, updates);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bots'] });
      queryClient.invalidateQueries({ queryKey: ['bots', variables.botId] });
    },
  });

  const deleteBotMutation = useMutation({
    mutationFn: async (botId: string) => {
      await axiosInstance.delete(`/bots/${botId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bots'] });
    },
  });

  const trainBotMutation = useMutation({
    mutationFn: async (botId: string) => {
      const { data } = await axiosInstance.post(`/bots/${botId}/train`, {});
      return data;
    },
    onSuccess: (_, botId) => {
      queryClient.invalidateQueries({ queryKey: ['bots', botId] });
    },
  });

  return {
    useBotsQuery,
    useBotQuery,
    createBotMutation,
    updateBotMutation,
    deleteBotMutation,
    trainBotMutation,
  };
};

