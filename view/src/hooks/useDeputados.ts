import { useQuery } from "@tanstack/react-query";
import { client } from "../lib/rpc";

/**
 * Simple hook to get deputies list
 */
export const useListarDeputados = () => {
  return useQuery({
    queryKey: ["deputados"],
    queryFn: () => client.LISTAR_DEPUTADOS({}),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: true,
  });
};

/**
 * Hook to get events for a specific deputy
 */
export const useEventosDeputado = (deputadoId: string) => {
  return useQuery({
    queryKey: ["eventos", deputadoId],
    queryFn: () => client.EVENTOS_DEPUTADO({ deputadoId }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!deputadoId,
  });
};

/**
 * Hook to get expenses for a specific deputy
 */
export const useDespesasDeputado = (deputadoId: string) => {
  return useQuery({
    queryKey: ["despesas", deputadoId],
    queryFn: () => client.DESPESAS_DEPUTADO({ deputadoId }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!deputadoId,
  });
};

/**
 * Hook to get parliamentary fronts for a specific deputy
 */
export const useFrentesDeputado = (deputadoId: string) => {
  return useQuery({
    queryKey: ["frentes", deputadoId],
    queryFn: () => client.FRENTES_DEPUTADO({ deputadoId }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!deputadoId,
  });
};

/**
 * Hook to get expenses ranking with current deputy position
 */
export const useRankingDespesas = (deputadoIdAtual: string, ano?: number) => {
  return useQuery({
    queryKey: ["ranking-despesas", deputadoIdAtual, ano],
    queryFn: () => client.RANKING_DESPESAS({ deputadoIdAtual, ano }),
    staleTime: 10 * 60 * 1000, // 10 minutes (longer due to expensive operation)
    enabled: !!deputadoIdAtual,
  });
};
