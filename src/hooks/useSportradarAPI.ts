import { useQuery } from "@tanstack/react-query"
import { sportradarAPI } from "@/services/sportradarAPI"

export function useCompetitions() {
  return useQuery({
    queryKey: ["sportradar", "competitions"],
    queryFn: () => sportradarAPI.getCompetitions(),
    staleTime: 1000 * 60 * 60,
    retry: 1,
  })
}

export function useLiveMatches() {
  return useQuery({
    queryKey: ["sportradar", "live-matches"],
    queryFn: () => sportradarAPI.getLiveMatches(),
    refetchInterval: 30000,
    retry: 1,
  })
}
