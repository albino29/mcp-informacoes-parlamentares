import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useFetchDocument } from "@/hooks/useDeputados";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  ExternalLink, 
  Loader, 
  AlertCircle, 
  Copy,
  Table,
  Link as LinkIcon,
} from "lucide-react";
import { toast } from "sonner";

interface DocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  type: "document" | "registro" | "frente";
  title?: string;
}

const DocumentModal: React.FC<DocumentModalProps> = ({
  isOpen,
  onClose,
  url,
  type,
  title,
}) => {
  const { data: documentData, isLoading, error } = useFetchDocument(url, type);

  const handleCopyContent = () => {
    if (documentData?.parsedContent?.text) {
      navigator.clipboard.writeText(documentData.parsedContent.text);
      toast.success("Conteúdo copiado para a área de transferência");
    }
  };

  const handleOpenOriginal = () => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const formatMetadata = (metadata: Record<string, any>) => {
    return Object.entries(metadata).map(([key, value]) => ({
      key: key.charAt(0).toUpperCase() + key.slice(1),
      value: typeof value === 'string' ? value : JSON.stringify(value),
    }));
  };

  const getModalTitle = () => {
    if (documentData?.title) return documentData.title;
    if (title) return title;
    
    switch (type) {
      case 'document':
        return 'Documento Parlamentar';
      case 'registro':
        return 'Registro Completo';
      case 'frente':
        return 'Detalhes da Frente';
      default:
        return 'Documento';
    }
  };

  const isPDF = (url: string) => {
    return url.toLowerCase().includes('.pdf') || url.toLowerCase().includes('pdf');
  };

  const shouldShowPDFViewer = () => {
    return type === 'document' && isPDF(url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {getModalTitle()}
          </DialogTitle>
          <DialogDescription>
            {url}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          {/* PDF Viewer for document type */}
          {shouldShowPDFViewer() && (
            <div className="h-full">
              <div className="bg-slate-800 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-white font-medium">Nota Fiscal / Documento</span>
                </div>
                <div className="text-sm text-slate-300 mb-4">
                  Visualização do documento PDF. Se não carregar, use o botão "Ver Original" abaixo.
                </div>
                
                <div className="bg-white rounded-lg overflow-hidden" style={{ height: '400px' }}>
                  <iframe
                    src={`${url}#toolbar=1&navpanes=1&scrollbar=1&view=FitH`}
                    width="100%"
                    height="100%"
                    style={{ border: 'none' }}
                    title="Documento PDF"
                    onError={() => {
                      console.warn('PDF iframe failed to load');
                    }}
                  />
                </div>
                
                <div className="mt-4 text-xs text-slate-400">
                  💡 Dica: Use Ctrl+Scroll para zoom ou clique em "Ver Original" para abrir em nova aba
                </div>
              </div>
            </div>
          )}

          {/* Regular content parsing for non-PDF documents */}
          {!shouldShowPDFViewer() && (
            <>
              {isLoading && (
                <div className="flex items-center justify-center p-8">
                  <Loader className="w-6 h-6 animate-spin mr-2" />
                  <span>Carregando documento...</span>
                </div>
              )}

              {error && (
                <div className="flex items-center justify-center p-8 text-red-400">
                  <AlertCircle className="w-6 h-6 mr-2" />
                  <div>
                    <div className="font-medium">Erro ao carregar documento</div>
                    <div className="text-sm text-slate-400 mt-1">
                      {error.message}
                    </div>
                  </div>
                </div>
              )}

              {documentData && !documentData.success && (
                <div className="flex items-center justify-center p-8 text-yellow-400">
                  <AlertCircle className="w-6 h-6 mr-2" />
                  <div>
                    <div className="font-medium">Documento não pôde ser processado</div>
                    <div className="text-sm text-slate-400 mt-1">
                      {documentData.error}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {!shouldShowPDFViewer() && documentData?.success && documentData.parsedContent && (
            <div className="space-y-6">
              {/* Metadata Section */}
              {documentData.parsedContent.metadata && 
               Object.keys(documentData.parsedContent.metadata).length > 0 && (
                <div className="bg-slate-800 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Informações do Documento
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {formatMetadata(documentData.parsedContent.metadata).map(({ key, value }) => (
                      <div key={key} className="space-y-1">
                        <div className="text-xs text-slate-400">{key}</div>
                        <div className="text-sm text-white">{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Main Content */}
              {documentData.parsedContent.text && (
                <div className="bg-slate-800 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-white mb-3">
                    Conteúdo do Documento
                  </h3>
                  <div className="prose prose-invert prose-sm max-w-none">
                    <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {documentData.parsedContent.text}
                    </div>
                  </div>
                </div>
              )}

              {/* Tables Section */}
              {documentData.parsedContent.tables && 
               documentData.parsedContent.tables.length > 0 && (
                <div className="bg-slate-800 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                    <Table className="w-4 h-4" />
                    Tabelas Encontradas
                  </h3>
                  <div className="space-y-4">
                    {documentData.parsedContent.tables.map((table: any[], index: number) => (
                      <div key={index} className="overflow-x-auto">
                        <table className="min-w-full text-xs">
                          <tbody>
                            {table.map((row: string[], rowIndex: number) => (
                              <tr key={rowIndex} className={rowIndex === 0 ? 'bg-slate-700' : 'bg-slate-800'}>
                                {row.map((cell: string, cellIndex: number) => (
                                  <td 
                                    key={cellIndex} 
                                    className={`p-2 border border-slate-600 ${
                                      rowIndex === 0 ? 'font-medium text-white' : 'text-slate-300'
                                    }`}
                                  >
                                    {cell}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Links Section */}
              {documentData.parsedContent.links && 
               documentData.parsedContent.links.length > 0 && (
                <div className="bg-slate-800 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                    <LinkIcon className="w-4 h-4" />
                    Links Encontrados
                  </h3>
                  <div className="space-y-2">
                    {documentData.parsedContent.links.map((link: any, index: number) => (
                      <div key={index} className="flex items-start gap-2">
                        <ExternalLink className="w-3 h-3 text-blue-400 mt-1 flex-shrink-0" />
                        <div>
                          <a 
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-400 hover:text-blue-300 underline"
                          >
                            {link.text || link.url}
                          </a>
                          {link.text && link.text !== link.url && (
                            <div className="text-xs text-slate-400 mt-1">
                              {link.url}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Raw Content (fallback) */}
              {!documentData.parsedContent.text && 
               !documentData.parsedContent.tables?.length && 
               documentData.rawContent && (
                <div className="bg-slate-800 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-white mb-3">
                    Conteúdo Bruto
                  </h3>
                  <div className="text-xs text-slate-300 font-mono max-h-60 overflow-auto">
                    <pre className="whitespace-pre-wrap">{documentData.rawContent}</pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-700">
          <div className="flex items-center gap-2">
            {documentData?.contentType && (
              <span className="text-xs text-slate-400">
                Tipo: {documentData.contentType}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {!shouldShowPDFViewer() && documentData?.parsedContent?.text && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyContent}
                className="flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Copiar Texto
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenOriginal}
              className="flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              {shouldShowPDFViewer() ? 'Abrir PDF' : 'Ver Original'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentModal;
