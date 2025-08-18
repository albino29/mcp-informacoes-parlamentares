import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useRankingDespesas } from '../hooks/useDeputados';

interface RankingDespesasChartProps {
  deputadoId: string;
  ano?: number;
}

interface RankingItem {
  deputadoId: string;
  nomeDeputado: string;
  siglaPartido?: string;
  totalDespesas: number;
  posicao: number;
  isDeputadoAtual: boolean;
}

const RankingDespesasChart: React.FC<RankingDespesasChartProps> = ({
  deputadoId,
  ano,
}) => {
  const { data: rankingData, isLoading, error } = useRankingDespesas(deputadoId, ano);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatTooltip = (value: number, name: string, props: any) => {
    if (name === 'totalDespesas') {
      return [formatCurrency(value), 'Total de Despesas'];
    }
    return [value, name];
  };

  const formatLabel = (label: string, payload: any[]) => {
    if (payload && payload.length > 0) {
      const data = payload[0].payload as RankingItem;
      return `${data.posicao}º - ${data.nomeDeputado} (${data.siglaPartido || 'S/P'})`;
    }
    return label;
  };

  if (isLoading) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-slate-700 rounded w-3/4 mb-4"></div>
          <div className="h-64 bg-slate-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <div className="text-center">
          <div className="text-red-400 mb-2">
            Erro ao carregar ranking de despesas
          </div>
          <div className="text-slate-400 text-sm">
            {error.message}
          </div>
        </div>
      </div>
    );
  }

  if (!rankingData || !rankingData.ranking || rankingData.ranking.length === 0) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <div className="text-center">
          <div className="text-slate-400 mb-2">
            Nenhum dado de ranking encontrado
          </div>
        </div>
      </div>
    );
  }

  const { ranking, posicaoDeputadoAtual, totalDeputados } = rankingData;

  // Prepare data for chart
  const chartData = ranking.map((item) => ({
    ...item,
    nomeExibicao: `${item.posicao}º ${item.nomeDeputado.split(' ')[0]} ${item.nomeDeputado.split(' ').slice(-1)[0]}`,
  }));

  // Find current deputy data
  const deputadoAtual = ranking.find(item => item.isDeputadoAtual);

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-white mb-2">
          Ranking de Despesas - Top 10 Maiores Gastos
        </h3>
        <div className="flex flex-wrap gap-4 text-sm text-slate-400">
          <div>
            Ano: <span className="text-white">{ano || new Date().getFullYear()}</span>
          </div>
          {deputadoAtual && (
            <div>
              Posição atual: <span className="text-yellow-400 font-medium">
                {posicaoDeputadoAtual}º de {totalDeputados}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 80,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
            <XAxis
              dataKey="nomeExibicao"
              angle={-45}
              textAnchor="end"
              height={80}
              tick={{ fontSize: 12, fill: '#94a3b8' }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#94a3b8' }}
              tickFormatter={(value) => formatCurrency(value)}
            />
            <Tooltip
              formatter={formatTooltip}
              labelFormatter={formatLabel}
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #475569',
                borderRadius: '6px',
                color: '#f1f5f9',
              }}
            />
            <Bar dataKey="totalDespesas" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.isDeputadoAtual ? '#f59e0b' : '#3b82f6'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span className="text-slate-400">Outros deputados</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-500 rounded"></div>
          <span className="text-slate-400">Deputado atual</span>
        </div>
      </div>

      {deputadoAtual && deputadoAtual.posicao > 10 && (
        <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-700 rounded-lg">
          <div className="text-yellow-400 text-sm font-medium">
            Posição do deputado atual
          </div>
          <div className="text-slate-300 text-sm">
            {deputadoAtual.nomeDeputado} está na {posicaoDeputadoAtual}ª posição com{' '}
            {formatCurrency(deputadoAtual.totalDespesas)} em despesas
          </div>
        </div>
      )}
    </div>
  );
};

export default RankingDespesasChart;
