import { useQuery } from "@tanstack/react-query";
import axios from "axios";

interface UserProfile {
  id: string;
  email: string;
  name: string;
  plan: string;
  usage: {
    bots: number;
    messages: number;
  };
  limits: {
    bots: number;
    messages: number;
  };
}

export const useUser = () => {
  const useProfileQuery = () => {
    return useQuery<UserProfile>({
      queryKey: ["user", "profile"],
      queryFn: async () => {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/user/me`,
        );
        return response.data;
      },
    });
  };

  return {
    useProfileQuery,
  };
};
