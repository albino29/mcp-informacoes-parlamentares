import { createRoute, type RootRoute, Link, useParams } from "@tanstack/react-router";
import { useState } from "react";
import {
  Loader,
  Calendar,
  Clock,
  MapPin,
  Building,
  ArrowLeft,
  Receipt,
  DollarSign,
  FileText,
  CreditCard,
  Users,
  Hash,
  User,
} from "lucide-react";
import { useEventosDeputado, useDespesasDeputado, useFrentesDeputado, useListarDeputados } from "@/hooks/useDeputados";
import RankingDespesasChart from "@/components/RankingDespesasChart";
import DocumentModal from "@/components/DocumentModal";

function EventoCard({ evento }: { evento: any }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formatDate = (dateString: string) => {
    if (!dateString) return "Data não informada";
    try {
      return new Date(dateString).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Data inválida";
    }
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-sm font-medium text-white">
              {evento.descricao || "Evento sem descrição"}
            </h3>
            {evento.descricaoTipo && (
              <p className="text-xs text-blue-400 mt-1">
                {evento.descricaoTipo}
              </p>
            )}
          </div>
          {evento.situacao && (
            <span className={`text-xs px-2 py-1 rounded ${
              evento.situacao.toLowerCase() === 'convocado' 
                ? 'bg-green-900 text-green-300' 
                : 'bg-slate-700 text-slate-300'
            }`}>
              {evento.situacao}
            </span>
          )}
        </div>

        {/* Datas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {evento.dataHoraInicio && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-500" />
              <div>
                <p className="text-xs text-slate-400">Início</p>
                <p className="text-xs text-white">{formatDate(evento.dataHoraInicio)}</p>
              </div>
            </div>
          )}
          
          {evento.dataHoraFim && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" />
              <div>
                <p className="text-xs text-slate-400">Fim</p>
                <p className="text-xs text-white">{formatDate(evento.dataHoraFim)}</p>
              </div>
            </div>
          )}
        </div>

        {/* Local */}
        {(evento.localCamara || evento.localExterno) && (
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-slate-500 mt-0.5" />
            <div>
              <p className="text-xs text-slate-400">Local</p>
              {evento.localCamara ? (
                <div className="text-xs text-white">
                  <p>{evento.localCamara.nome}</p>
                  {evento.localCamara.predio && (
                    <p className="text-slate-400">
                      {evento.localCamara.predio}
                      {evento.localCamara.andar && ` - ${evento.localCamara.andar}`}
                      {evento.localCamara.sala && ` - Sala ${evento.localCamara.sala}`}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-xs text-white">{evento.localExterno}</p>
              )}
            </div>
          </div>
        )}

        {/* Órgãos */}
        {evento.orgaos && evento.orgaos.length > 0 && (
          <div className="flex items-start gap-2">
            <Building className="w-4 h-4 text-slate-500 mt-0.5" />
            <div>
              <p className="text-xs text-slate-400">Órgãos</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {evento.orgaos.map((orgao: any, index: number) => (
                  <span 
                    key={index}
                    className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded"
                  >
                    {orgao.sigla || orgao.nome}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* URL do Registro */}
        {evento.urlRegistro && (
          <div className="pt-2 border-t border-slate-700">
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
            >
              <FileText className="w-3 h-3" />
              Ver registro completo
            </button>
          </div>
        )}
      </div>

      {/* Document Modal */}
      {evento.urlRegistro && (
        <DocumentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          url={evento.urlRegistro}
          type="registro"
          title={`Registro - ${evento.descricaoTipo || 'Evento'}`}
        />
      )}
    </div>
  );
}

function DespesaCard({ despesa }: { despesa: any }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value || 0);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Data não informada";
    try {
      return new Date(dateString).toLocaleDateString("pt-BR");
    } catch {
      return "Data inválida";
    }
  };

  const getStatusColor = (valorGlosa: number) => {
    if (valorGlosa > 0) {
      return "bg-yellow-900 text-yellow-300"; // Com glosa
    }
    return "bg-green-900 text-green-300"; // Sem glosa
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
      <div className="space-y-3">
        {/* Header - Fornecedor e Valor */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-white truncate">
              {despesa.nomeFornecedor || "Fornecedor não informado"}
            </h3>
            <p className="text-xs text-blue-400 mt-1">
              {despesa.tipoDespesa || "Tipo não informado"}
            </p>
          </div>
          <div className="text-right ml-4">
            <p className="text-lg font-bold text-green-400">
              {formatCurrency(despesa.valorLiquido)}
            </p>
            {despesa.valorGlosa > 0 && (
              <p className="text-xs text-yellow-400">
                Glosa: {formatCurrency(despesa.valorGlosa)}
              </p>
            )}
          </div>
        </div>

        {/* Informações do Documento */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-500" />
            <div>
              <p className="text-xs text-slate-400">Documento</p>
              <p className="text-xs text-white">
                {despesa.tipoDocumento || "N/A"}
              </p>
              {despesa.numDocumento && (
                <p className="text-xs text-slate-400">
                  Nº {despesa.numDocumento}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-500" />
            <div>
              <p className="text-xs text-slate-400">Data</p>
              <p className="text-xs text-white">
                {formatDate(despesa.dataDocumento)}
              </p>
              <p className="text-xs text-slate-400">
                {despesa.mes?.toString().padStart(2, '0')}/{despesa.ano}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-slate-500" />
            <div>
              <p className="text-xs text-slate-400">Valor Bruto</p>
              <p className="text-xs text-white">
                {formatCurrency(despesa.valorDocumento)}
              </p>
              {despesa.parcela && (
                <p className="text-xs text-slate-400">
                  Parcela {despesa.parcela}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Status e CNPJ */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-700">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-slate-500" />
            <div>
              {despesa.cnpjCpfFornecedor && (
                <p className="text-xs text-slate-400">
                  CNPJ/CPF: {despesa.cnpjCpfFornecedor}
                </p>
              )}
              {despesa.numRessarcimento && (
                <p className="text-xs text-slate-400">
                  Ressarcimento: {despesa.numRessarcimento}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {despesa.valorGlosa > 0 && (
              <span className={`text-xs px-2 py-1 rounded ${getStatusColor(despesa.valorGlosa)}`}>
                Com Glosa
              </span>
            )}
            {despesa.urlDocumento && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
              >
                <FileText className="w-3 h-3" />
                Ver documento
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Document Modal */}
      {despesa.urlDocumento && (
        <DocumentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          url={despesa.urlDocumento}
          type="document"
          title={`Documento - ${despesa.nomeFornecedor || 'Sem fornecedor'}`}
        />
      )}
    </div>
  );
}

function FrenteCard({ frente }: { frente: any }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 hover:bg-slate-750 transition-colors">
      <div className="space-y-3">
        {/* Header - Título */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-white leading-tight">
              {frente.titulo || "Frente sem título"}
            </h3>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <Users className="w-4 h-4 text-blue-500" />
            <span className="text-xs bg-blue-900 text-blue-300 px-2 py-1 rounded">
              Frente Parlamentar
            </span>
          </div>
        </div>

        {/* Informações */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4 text-slate-500" />
            <div>
              <p className="text-xs text-slate-400">ID da Frente</p>
              <p className="text-xs text-white font-mono">
                {frente.id || "N/A"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-slate-500" />
            <div>
              <p className="text-xs text-slate-400">Legislatura</p>
              <p className="text-xs text-white">
                {frente.idLegislatura ? `${frente.idLegislatura}ª Legislatura` : "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* URI Link */}
        {frente.uri && (
          <div className="pt-2 border-t border-slate-700">
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
            >
              <FileText className="w-3 h-3" />
              Ver detalhes da frente
            </button>
          </div>
        )}
      </div>

      {/* Document Modal */}
      {frente.uri && (
        <DocumentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          url={frente.uri}
          type="frente"
          title={`Frente - ${frente.titulo || 'Sem título'}`}
        />
      )}
    </div>
  );
}

function DeputadoDetalhePage() {
  const { deputadoId } = useParams({ from: "/deputado/$deputadoId" });
  const [activeTab, setActiveTab] = useState("eventos");
  
  const { data: deputadosResponse } = useListarDeputados();
  const { data: eventosResponse, isLoading: loadingEventos, error: errorEventos } = useEventosDeputado(deputadoId);
  const { data: despesasResponse, isLoading: loadingDespesas, error: errorDespesas } = useDespesasDeputado(deputadoId);
  const { data: frentesResponse, isLoading: loadingFrente, error: errorFrente } = useFrentesDeputado(deputadoId);
  
  const deputados = deputadosResponse?.deputados || [];
  const deputadoAtual = deputados.find((dep: any) => dep.id.toString() === deputadoId);
  
  const eventos = eventosResponse?.eventos || [];
  const despesas = despesasResponse?.despesas || [];
  const frentes = frentesResponse?.frentes || [];

  const tabs = [
    { id: "eventos", label: "Eventos", count: eventos.length },
    { id: "despesas", label: "Despesas", count: despesas.length },
    { id: "frentes", label: "Frentes Atuantes", count: frentes.length },
  ];

  return (
    <div className="bg-slate-900 min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-slate-400 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">
                {deputadoAtual ? (deputadoAtual.nomeEleitoral || deputadoAtual.nome) : 'Deputado'}
              </h1>
              {deputadoAtual && deputadoAtual.nome !== deputadoAtual.nomeEleitoral && (
                <p className="text-slate-400">
                  {deputadoAtual.nome}
                </p>
              )}
              {deputadoAtual && (
                <div className="flex items-center gap-3 mt-1">
                  {deputadoAtual.siglaPartido && (
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-slate-500" />
                      <span className="text-xs text-slate-300 font-medium">
                        {deputadoAtual.siglaPartido}
                      </span>
                    </div>
                  )}
                  
                  {deputadoAtual.siglaUf && (
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-slate-400">
                        {deputadoAtual.siglaUf}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Foto do Deputado */}
          <div className="flex-shrink-0">
            {deputadoAtual?.urlFoto ? (
              <img
                src={deputadoAtual.urlFoto}
                alt={deputadoAtual.nome}
                className="w-16 h-16 rounded-full object-cover border-2 border-slate-600"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-slate-600 flex items-center justify-center">
                <User className="w-8 h-8 text-slate-300" />
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-700 mb-6">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-400"
                    : "border-transparent text-slate-400 hover:text-slate-300"
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className="ml-2 bg-slate-700 text-slate-300 text-xs px-2 py-1 rounded">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "eventos" && (
          <div>
            {loadingEventos && (
              <div className="text-center py-12">
                <Loader className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-400" />
                <p className="text-slate-400">Carregando eventos...</p>
              </div>
            )}

            {errorEventos && (
              <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-bold">!</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-red-400 font-medium">Erro ao carregar eventos</h3>
                    <p className="text-red-300 text-sm mt-1">
                      {errorEventos.message}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {eventos && eventos.length > 0 && !loadingEventos && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium text-white">
                    {eventos.length} eventos encontrados
                  </h2>
                </div>

                <div className="grid gap-4">
                  {eventos.map((evento: any, index: number) => (
                    <EventoCard key={evento.id || index} evento={evento} />
                  ))}
                </div>
              </div>
            )}

            {!loadingEventos && !errorEventos && eventos.length === 0 && (
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center">
                <Calendar className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">
                  Nenhum evento encontrado
                </h3>
                <p className="text-slate-400">
                  Este deputado não possui eventos registrados.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "despesas" && (
          <div>
            {loadingDespesas && (
              <div className="text-center py-12">
                <Loader className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-400" />
                <p className="text-slate-400">Carregando despesas...</p>
              </div>
            )}

            {errorDespesas && (
              <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-bold">!</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-red-400 font-medium">Erro ao carregar despesas</h3>
                    <p className="text-red-300 text-sm mt-1">
                      {errorDespesas.message}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {despesas && despesas.length > 0 && !loadingDespesas && (
              <div className="space-y-6">
                {/* Ranking Chart */}
                <RankingDespesasChart deputadoId={deputadoId} />

                {/* Despesas List */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-medium text-white">
                      {despesas.length} despesas encontradas
                    </h2>
                    <div className="text-sm text-slate-400">
                      Total: {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(
                        despesas.reduce((sum: number, despesa: any) => sum + (despesa.valorLiquido || 0), 0)
                      )}
                    </div>
                  </div>

                  <div className="grid gap-4">
                    {despesas.map((despesa: any, index: number) => (
                      <DespesaCard key={despesa.codDocumento || index} despesa={despesa} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {!loadingDespesas && !errorDespesas && despesas.length === 0 && (
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center">
                <Receipt className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">
                  Nenhuma despesa encontrada
                </h3>
                <p className="text-slate-400">
                  Este deputado não possui despesas registradas.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "frentes" && (
          <div>
            {loadingFrente && (
              <div className="text-center py-12">
                <Loader className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-400" />
                <p className="text-slate-400">Carregando frentes parlamentares...</p>
              </div>
            )}

            {errorFrente && (
              <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-bold">!</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-red-400 font-medium">Erro ao carregar frentes</h3>
                    <p className="text-red-300 text-sm mt-1">
                      {errorFrente.message}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {frentes && frentes.length > 0 && !loadingFrente && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium text-white">
                    {frentes.length} frentes parlamentares
                  </h2>
                  <div className="text-sm text-slate-400">
                    Participação ativa em grupos temáticos
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {frentes.map((frente: any, index: number) => (
                    <FrenteCard key={frente.id || index} frente={frente} />
                  ))}
                </div>
              </div>
            )}

            {!loadingFrente && !errorFrente && frentes.length === 0 && (
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center">
                <Users className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">
                  Nenhuma frente parlamentar encontrada
                </h3>
                <p className="text-slate-400">
                  Este deputado não participa de frentes parlamentares registradas.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default (parentRoute: RootRoute) =>
  createRoute({
    path: "/deputado/$deputadoId",
    component: DeputadoDetalhePage,
    getParentRoute: () => parentRoute,
  });
