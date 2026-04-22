import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../api/axios";
import type { Source } from "../types";

export const useSources = (botId: string | undefined) => {
  const queryClient = useQueryClient();

  const useSourcesQuery = () => {
    return useQuery({
      queryKey: ["bots", botId, "sources"],
      queryFn: async () => {
        if (!botId) return [];
        const { data } = await axiosInstance.get<Source[]>(
          `/bots/${botId}/sources`,
        );
        return data;
      },
      enabled: !!botId,
    });
  };

  const addSourceMutation = useMutation({
    mutationFn: async (newSource: any) => {
      let payload = newSource;
      let contentType = "application/json";

      if (newSource.type === "pdf" && newSource.file) {
        const formData = new FormData();
        formData.append("file", newSource.file);
        formData.append("type", "pdf");
        if (newSource.name) formData.append("name", newSource.name);
        payload = formData;
        contentType = "multipart/form-data";
      }

      const { data } = await axiosInstance.post<Source>(
        `/bots/${botId}/sources`,
        payload,
        {
          headers: {
            "Content-Type": contentType,
          },
        },
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bots", botId, "sources"] });
      queryClient.invalidateQueries({ queryKey: ["bots", botId] }); // Status might change to untrained
    },
  });

  const deleteSourceMutation = useMutation({
    mutationFn: async (sourceId: string) => {
      await axiosInstance.delete(`/bots/${botId}/sources/${sourceId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bots", botId, "sources"] });
      queryClient.invalidateQueries({ queryKey: ["bots", botId] });
    },
  });

  return {
    useSourcesQuery,
    addSourceMutation,
    deleteSourceMutation,
  };
};
