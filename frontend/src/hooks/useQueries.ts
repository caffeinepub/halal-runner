import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { ScoreEntry } from '../backend';

export function useLeaderboard() {
  const { actor, isFetching } = useActor();

  return useQuery<ScoreEntry[]>({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getLeaderboard(BigInt(10));
    },
    enabled: !!actor && !isFetching,
    staleTime: 30000,
  });
}

export function useSubmitScore() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ nickname, score, coins }: { nickname: string; score: number; coins: number }) => {
      if (!actor) throw new Error('Actor not initialized');
      await actor.submitScore(nickname, BigInt(score), BigInt(coins));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
    },
  });
}
