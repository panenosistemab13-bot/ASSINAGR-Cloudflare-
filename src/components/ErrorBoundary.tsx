import React from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State;
  props: Props;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  render() {
    const { hasError, error } = this.state;
    const { children } = this.props;

    if (hasError) {
      return (
        <div className="min-h-screen bg-[#0c0a09] flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Ops! Algo deu errado.</h1>
          <p className="text-slate-400 max-w-md mb-8">
            Ocorreu um erro inesperado ao carregar o aplicativo. Isso pode ser causado por configurações ausentes ou problemas de conexão.
          </p>
          <div className="glass-dark rounded-xl p-4 mb-8 w-full max-w-md text-left">
            <p className="text-xs font-mono text-red-400 break-all text-center">
              {error?.message || 'Erro desconhecido'}
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors"
          >
            <RefreshCcw className="w-4 h-4" />
            Recarregar Aplicativo
          </button>
        </div>
      );
    }

    return children;
  }
}
