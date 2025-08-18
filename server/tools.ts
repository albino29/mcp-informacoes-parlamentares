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

/**
 * Tool to fetch and parse document content from URLs
 */
export const createFetchDocumentTool = (env: Env) =>
  createTool({
    id: "FETCH_DOCUMENT",
    description: "Fetch and parse document content from external URLs",
    inputSchema: z.object({
      url: z.string().describe("Document URL to fetch"),
      type: z.enum(["document", "registro", "frente"]).describe("Type of document"),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      contentType: z.string().optional(),
      title: z.string().optional(),
      parsedContent: z.object({
        text: z.string().optional(),
        metadata: z.record(z.any()).optional(),
        tables: z.array(z.any()).optional(),
        links: z.array(z.object({
          text: z.string(),
          url: z.string(),
        })).optional(),
      }).optional(),
      rawContent: z.string().optional(),
      error: z.string().optional(),
    }),
    execute: async ({ context }) => {
      try {
        console.log(`Fetching document: ${context.url}`);
        
        const response = await fetch(context.url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; VotacoesParlamentares/1.0)',
            'Accept': 'text/html,application/xhtml+xml,application/xml,text/xml,*/*',
          },
          signal: AbortSignal.timeout(15000), // 15 second timeout
        });
        
        if (!response.ok) {
          return {
            success: false,
            error: `HTTP Error: ${response.status} ${response.statusText}`,
          };
        }
        
        const contentType = response.headers.get('content-type') || '';
        const content = await response.text();
        
        // Basic parsing based on content type
        let parsedContent: any = {};
        let title = '';
        
        if (contentType.includes('xml') || content.trim().startsWith('<?xml')) {
          // Parse XML content
          try {
            parsedContent = parseXmlContent(content, context.type);
            title = parsedContent.metadata?.title || 'Documento XML';
          } catch (error) {
            console.warn('XML parsing failed, treating as text:', error);
            parsedContent = { text: content };
          }
        } else if (contentType.includes('html')) {
          // Parse HTML content
          parsedContent = parseHtmlContent(content, context.type);
          title = parsedContent.metadata?.title || 'Documento HTML';
        } else {
          // Treat as plain text
          parsedContent = { text: content };
          title = 'Documento de Texto';
        }
        
        return {
          success: true,
          contentType,
          title,
          parsedContent,
          rawContent: content.length > 10000 ? content.substring(0, 10000) + '...' : content,
        };
        
      } catch (error) {
        console.error("Error fetching document:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred',
        };
      }
    },
  });

// Helper function to parse XML content
function parseXmlContent(xmlContent: string, type: string) {
  const result: any = {
    text: '',
    metadata: {},
    tables: [],
    links: [],
  };
  
  try {
    // Basic XML parsing without external libraries
    // Extract title
    const titleMatch = xmlContent.match(/<title[^>]*>(.*?)<\/title>/is);
    if (titleMatch) {
      result.metadata.title = titleMatch[1].replace(/<[^>]*>/g, '').trim();
    }
    
    // Extract text content (remove XML tags)
    const textContent = xmlContent
      .replace(/<script[^>]*>.*?<\/script>/gis, '')
      .replace(/<style[^>]*>.*?<\/style>/gis, '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    result.text = textContent.substring(0, 5000); // Limit text length
    
    // Extract links
    const linkMatches = xmlContent.matchAll(/<a[^>]+href="([^"]*)"[^>]*>(.*?)<\/a>/gis);
    for (const match of linkMatches) {
      result.links.push({
        url: match[1],
        text: match[2].replace(/<[^>]*>/g, '').trim(),
      });
    }
    
    // Extract metadata based on document type
    if (type === 'document') {
      // Extract document-specific metadata
      const docTypeMatch = xmlContent.match(/<tipoDocumento[^>]*>(.*?)<\/tipoDocumento>/is);
      if (docTypeMatch) {
        result.metadata.tipoDocumento = docTypeMatch[1].trim();
      }
      
      const valorMatch = xmlContent.match(/<valor[^>]*>(.*?)<\/valor>/is);
      if (valorMatch) {
        result.metadata.valor = valorMatch[1].trim();
      }
    }
    
  } catch (error) {
    console.warn('XML parsing error:', error);
    result.text = xmlContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 5000);
  }
  
  return result;
}

// Helper function to parse HTML content
function parseHtmlContent(htmlContent: string, type: string) {
  const result: any = {
    text: '',
    metadata: {},
    tables: [],
    links: [],
  };
  
  try {
    // Extract title
    const titleMatch = htmlContent.match(/<title[^>]*>(.*?)<\/title>/is);
    if (titleMatch) {
      result.metadata.title = titleMatch[1].replace(/<[^>]*>/g, '').trim();
    }
    
    // Extract main content (remove scripts and styles)
    let cleanContent = htmlContent
      .replace(/<script[^>]*>.*?<\/script>/gis, '')
      .replace(/<style[^>]*>.*?<\/style>/gis, '')
      .replace(/<nav[^>]*>.*?<\/nav>/gis, '')
      .replace(/<header[^>]*>.*?<\/header>/gis, '')
      .replace(/<footer[^>]*>.*?<\/footer>/gis, '');
    
    // Extract text content
    const textContent = cleanContent
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    result.text = textContent.substring(0, 5000);
    
    // Extract tables
    const tableMatches = cleanContent.matchAll(/<table[^>]*>(.*?)<\/table>/gis);
    for (const tableMatch of tableMatches) {
      const tableHtml = tableMatch[0];
      const rowMatches = tableHtml.matchAll(/<tr[^>]*>(.*?)<\/tr>/gis);
      const tableData = [];
      
      for (const rowMatch of rowMatches) {
        const cellMatches = rowMatch[1].matchAll(/<t[hd][^>]*>(.*?)<\/t[hd]>/gis);
        const row = [];
        for (const cellMatch of cellMatches) {
          row.push(cellMatch[1].replace(/<[^>]*>/g, '').trim());
        }
        if (row.length > 0) {
          tableData.push(row);
        }
      }
      
      if (tableData.length > 0) {
        result.tables.push(tableData);
      }
    }
    
    // Extract links
    const linkMatches = cleanContent.matchAll(/<a[^>]+href="([^"]*)"[^>]*>(.*?)<\/a>/gis);
    for (const match of linkMatches) {
      result.links.push({
        url: match[1],
        text: match[2].replace(/<[^>]*>/g, '').trim(),
      });
    }
    
  } catch (error) {
    console.warn('HTML parsing error:', error);
    result.text = htmlContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 5000);
  }
  
  return result;
}

export const tools = [
  createListarDeputadosTool,
  createEventosDeputadoTool,
  createDespesasDeputadoTool,
  createFrentesDeputadoTool,
  createRankingDespesasTool,
  createFetchDocumentTool,
];
