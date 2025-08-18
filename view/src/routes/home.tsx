import { createRoute, type RootRoute, Link } from "@tanstack/react-router";
import {
  User,
  Loader,
  Mail,
  Users,
  MapPin,
} from "lucide-react";
import { useListarDeputados } from "@/hooks/useDeputados";
import { Button } from "@/components/ui/button";

function DeputadoCard({ deputado }: { deputado: any }) {
  return (
    <Link 
      to="/deputado/$deputadoId" 
      params={{ deputadoId: deputado.id.toString() }}
      className="block bg-slate-800 border border-slate-700 rounded-lg p-4 hover:bg-slate-700 hover:border-slate-600 transition-colors"
    >
      <div className="flex items-start gap-4">
        {/* Foto */}
        <div className="flex-shrink-0">
          {deputado.urlFoto ? (
            <img
              src={deputado.urlFoto}
              alt={deputado.nome}
              className="w-12 h-12 rounded-full object-cover border-2 border-slate-600"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-slate-600 flex items-center justify-center">
              <User className="w-6 h-6 text-slate-300" />
            </div>
          )}
        </div>
        
        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-white truncate">
                {deputado.nomeEleitoral || deputado.nome}
              </h3>
              {deputado.nome !== deputado.nomeEleitoral && (
                <p className="text-xs text-slate-400 truncate">
                  {deputado.nome}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3 mt-2">
            {deputado.siglaPartido && (
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3 text-slate-500" />
                <span className="text-xs text-slate-300 font-medium">
                  {deputado.siglaPartido}
                </span>
              </div>
            )}
            
            {deputado.siglaUf && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-500" />
                <span className="text-xs text-slate-300">
                  {deputado.siglaUf}
                </span>
              </div>
            )}
          </div>
          
          {deputado.email && (
            <div className="flex items-center gap-1 mt-2">
              <Mail className="w-3 h-3 text-slate-500" />
              <span className="text-xs text-slate-400 truncate">
                {deputado.email}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

function HomePage() {
  const { data: response, isLoading, error, refetch } = useListarDeputados();

  // Debug: apenas log essencial
  console.log("Estado:", { loading: isLoading, hasData: !!response, hasError: !!error });

  const deputados = response?.deputados || [];

  const handleRetry = () => {
    refetch();
  };

  return (
    <div className="bg-slate-900 min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Deco"
              className="w-8 h-8 object-contain"
            />
            <div>
              <h1 className="text-2xl font-bold text-white">
                Deputados da Câmara
              </h1>
              <p className="text-slate-400">
                Consulte informações dos deputados federais
              </p>
            </div>
          </div>
        </div>





        {/* Loading */}
        {isLoading && (
          <div className="text-center py-12">
            <Loader className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-400" />
            <p className="text-slate-400">Carregando deputados...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-bold">!</span>
              </div>
              <div className="flex-1">
                <h3 className="text-red-400 font-medium">Erro ao carregar deputados</h3>
                <p className="text-red-300 text-sm mt-1">
                  {error.message}
                </p>
                <button 
                  onClick={handleRetry}
                  className="mt-3 text-xs bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
                >
                  Tentar novamente
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {deputados && deputados.length > 0 && !isLoading && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-white">
                {deputados.length} deputados encontrados
              </h2>
            </div>

            {/* Grid de Deputados */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {deputados.map((deputado: any) => (
                <DeputadoCard key={deputado.id} deputado={deputado} />
              ))}
            </div>
          </div>
        )}

        {/* Estado quando não há dados */}
        {!isLoading && !error && deputados.length === 0 && (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center">
            <User className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">
              Nenhum deputado encontrado
            </h3>
            <p className="text-slate-400 mb-4">
              Erro ao carregar dados da API.
            </p>
            <Button onClick={handleRetry} className="bg-blue-600 hover:bg-blue-500">
              Tentar Novamente
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default (parentRoute: RootRoute) =>
  createRoute({
    path: "/",
    component: HomePage,
    getParentRoute: () => parentRoute,
  });
