import React, { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public props: Props;
  public state: State;

  constructor(props: Props) {
    super(props);
    this.props = props;
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[DOMUS ErrorBoundary] Erro de renderização capturado:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    localStorage.removeItem('domus_auth_house');
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[100dvh] w-full max-w-full bg-[#e4f0ee] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-[#d9e5e3] shadow-xl text-center space-y-4 animate-in fade-in duration-300">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl">warning</span>
            </div>

            <h1 className="text-xl font-black text-[#16302e]">
              Algo inesperado aconteceu
            </h1>

            <p className="text-xs text-[#727877] leading-relaxed">
              Ocorreu uma falha ao renderizar esta tela. Clique no botão abaixo para recarregar a residência com segurança.
            </p>

            {this.state.error?.message && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-left">
                <p className="text-[11px] font-mono text-rose-700 break-words">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="space-y-2 pt-2">
              <button
                onClick={this.handleReload}
                className="w-full py-3 px-4 bg-[#16302e] hover:bg-[#2d4644] active:scale-[0.99] text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">refresh</span>
                <span>Recarregar Aplicação</span>
              </button>

              <button
                onClick={this.handleReset}
                className="w-full py-2.5 px-4 bg-transparent hover:bg-[#f0fcfa] text-[#727877] hover:text-[#16302e] rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                <span>Alternar Residência</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
