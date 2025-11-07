import { useQuery, UseQueryOptions } from "@tanstack/react-query";

interface UsePageDataOptions<T> extends Omit<UseQueryOptions<T>, "queryKey" | "queryFn"> {
  queryKey: string[];
  queryFn: () => Promise<T>;
}

/**
 * Centralized hook for fetching page data with consistent error handling
 */
export function usePageData<T>({
  queryKey,
  queryFn,
  ...options
}: UsePageDataOptions<T>) {
  return useQuery<T>({
    queryKey,
    queryFn,
    retry: 2,
    staleTime: 30000, // 30 seconds
    ...options,
  });
}
