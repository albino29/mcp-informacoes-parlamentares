/**
 * This is where you define your tools.
 *
 * Tools are the functions that will be available on your
 * MCP server. They can be called from any other Deco app
 * or from your front-end code via typed RPC. This is the
 * recommended way to build your Web App.
 *
 * @see https://docs.deco.page/en/guides/creating-tools/
 */
import { createTool } from "@deco/workers-runtime/mastra";
import { z } from "zod";
import type { Env } from "./main.ts";

/**
 * Simple tool to get deputies list as JSON
 */
export const createListarDeputadosTool = (env: Env) =>
  createTool({
    id: "LISTAR_DEPUTADOS",
    description: "Get list of deputies from Brazilian Chamber",
    inputSchema: z.object({}),
    outputSchema: z.object({
      deputados: z.array(z.any()),
    }),
    execute: async () => {
      try {
        const response = await fetch("https://dadosabertos.camara.leg.br/api/v2/deputados?itens=50&ordem=asc&ordenarPor=nome");
        
        if (!response.ok) {
          throw new Error(`HTTP Error: ${response.status}`);
        }
        
        const data = await response.json();
        return { deputados: data.dados || [] };
        
      } catch (error) {
        console.error("Error fetching deputies:", error);
        throw new Error(`Failed to fetch deputies: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },
  });

/**
 * Simple tool to get deputy events
 */
export const createEventosDeputadoTool = (env: Env) =>
  createTool({
    id: "EVENTOS_DEPUTADO",
    description: "Get events for a specific deputy",
    inputSchema: z.object({
      deputadoId: z.string().describe("Deputy ID"),
    }),
    outputSchema: z.object({
      eventos: z.array(z.any()),
    }),
    execute: async ({ context }) => {
      try {
        const response = await fetch(
          `https://dadosabertos.camara.leg.br/api/v2/deputados/${context.deputadoId}/eventos?ordem=ASC&ordenarPor=dataHoraInicio`
        );
        
        if (!response.ok) {
          throw new Error(`HTTP Error: ${response.status}`);
        }
        
        const data = await response.json();
        return { eventos: data.dados || [] };
        
      } catch (error) {
        console.error("Error fetching deputy events:", error);
        throw new Error(`Failed to fetch deputy events: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },
  });

/**
 * Simple tool to get deputy expenses
 */
export const createDespesasDeputadoTool = (env: Env) =>
  createTool({
    id: "DESPESAS_DEPUTADO",
    description: "Get expenses for a specific deputy",
    inputSchema: z.object({
      deputadoId: z.string().describe("Deputy ID"),
    }),
    outputSchema: z.object({
      despesas: z.array(z.any()),
    }),
    execute: async ({ context }) => {
      try {
        const response = await fetch(
          `https://dadosabertos.camara.leg.br/api/v2/deputados/${context.deputadoId}/despesas?ordem=ASC&ordenarPor=ano`
        );
        
        if (!response.ok) {
          throw new Error(`HTTP Error: ${response.status}`);
        }
        
        const data = await response.json();
        return { despesas: data.dados || [] };
        
      } catch (error) {
        console.error("Error fetching deputy expenses:", error);
        throw new Error(`Failed to fetch deputy expenses: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },
  });

/**
 * Simple tool to get deputy parliamentary fronts
 */
export const createFrentesDeputadoTool = (env: Env) =>
  createTool({
    id: "FRENTES_DEPUTADO",
    description: "Get parliamentary fronts for a specific deputy",
    inputSchema: z.object({
      deputadoId: z.string().describe("Deputy ID"),
    }),
    outputSchema: z.object({
      frentes: z.array(z.any()),
    }),
    execute: async ({ context }) => {
      try {
        const response = await fetch(
          `https://dadosabertos.camara.leg.br/api/v2/deputados/${context.deputadoId}/frentes`
        );
        
        if (!response.ok) {
          throw new Error(`HTTP Error: ${response.status}`);
        }
        
        const data = await response.json();
        return { frentes: data.dados || [] };
        
      } catch (error) {
        console.error("Error fetching deputy fronts:", error);
        throw new Error(`Failed to fetch deputy fronts: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },
  });

/**
 * Tool to get ranking of deputies by total expenses
 */
export const createRankingDespesasTool = (env: Env) =>
  createTool({
    id: "RANKING_DESPESAS",
    description: "Get ranking of deputies by total expenses with current deputy position",
    inputSchema: z.object({
      deputadoIdAtual: z.string().describe("Current deputy ID to highlight position"),
      ano: z.number().optional().describe("Year to filter expenses (current year by default)"),
    }),
    outputSchema: z.object({
      ranking: z.array(z.object({
        deputadoId: z.string(),
        nomeDeputado: z.string(),
        siglaPartido: z.string().optional(),
        totalDespesas: z.number(),
        posicao: z.number(),
        isDeputadoAtual: z.boolean(),
      })),
      posicaoDeputadoAtual: z.number(),
      totalDeputados: z.number(),
    }),
    execute: async ({ context }) => {
      try {
        const anoAtual = context.ano || new Date().getFullYear();
        
        // First, get all deputies
        const deputadosResponse = await fetch(
          `https://dadosabertos.camara.leg.br/api/v2/deputados?ordem=ASC&ordenarPor=nome`
        );
        
        if (!deputadosResponse.ok) {
          throw new Error(`HTTP Error: ${deputadosResponse.status}`);
        }
        
        const deputadosData = await deputadosResponse.json();
        const deputados = deputadosData.dados || [];
        
        // Get expenses for each deputy
        const deputadosComDespesas = await Promise.all(
          deputados.slice(0, 50).map(async (deputado: any) => { // Limit to first 50 for performance
            try {
              const despesasResponse = await fetch(
                `https://dadosabertos.camara.leg.br/api/v2/deputados/${deputado.id}/despesas?ano=${anoAtual}&ordem=ASC&ordenarPor=ano`
              );
              
              if (!despesasResponse.ok) {
                return {
                  deputadoId: deputado.id.toString(),
                  nomeDeputado: deputado.nome,
                  siglaPartido: deputado.siglaPartido,
                  totalDespesas: 0,
                  isDeputadoAtual: deputado.id.toString() === context.deputadoIdAtual,
                };
              }
              
              const despesasData = await despesasResponse.json();
              const despesas = despesasData.dados || [];
              
              const totalDespesas = despesas.reduce((sum: number, despesa: any) => {
                return sum + (despesa.valorLiquido || 0);
              }, 0);
              
              return {
                deputadoId: deputado.id.toString(),
                nomeDeputado: deputado.nome,
                siglaPartido: deputado.siglaPartido,
                totalDespesas,
                isDeputadoAtual: deputado.id.toString() === context.deputadoIdAtual,
              };
            } catch (error) {
              console.error(`Error fetching expenses for deputy ${deputado.id}:`, error);
              return {
                deputadoId: deputado.id.toString(),
                nomeDeputado: deputado.nome,
                siglaPartido: deputado.siglaPartido,
                totalDespesas: 0,
                isDeputadoAtual: deputado.id.toString() === context.deputadoIdAtual,
              };
            }
          })
        );
        
        // Sort by total expenses (descending)
        const rankingSorted = deputadosComDespesas
          .sort((a, b) => b.totalDespesas - a.totalDespesas)
          .map((deputado, index) => ({
            ...deputado,
            posicao: index + 1,
          }));
        
        // Find current deputy position
        const deputadoAtual = rankingSorted.find(d => d.isDeputadoAtual);
        const posicaoDeputadoAtual = deputadoAtual?.posicao || 0;
        
        // Get top 10 + current deputy if not in top 10
        let ranking = rankingSorted.slice(0, 10);
        
        if (deputadoAtual && deputadoAtual.posicao > 10) {
          ranking.push(deputadoAtual);
        }
        
        return {
          ranking,
          posicaoDeputadoAtual,
          totalDeputados: rankingSorted.length,
        };
        
      } catch (error) {
        console.error("Error fetching expenses ranking:", error);
        throw new Error(`Failed to fetch expenses ranking: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },
  });

export const tools = [
  createListarDeputadosTool,
  createEventosDeputadoTool,
  createDespesasDeputadoTool,
  createFrentesDeputadoTool,
  createRankingDespesasTool,
];
