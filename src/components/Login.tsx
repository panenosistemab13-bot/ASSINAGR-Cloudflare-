import React, { useState } from 'react';
import { Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { LOGO_3_CORACOES } from '../constants';

export const Login = ({ onLogin }: { onLogin: () => void }) => {
  const [username, setUsername] = useState('assinagr3c');
  const [password, setPassword] = useState('agentesderisco3c');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    setTimeout(() => {
      if (username === 'assinagr3c' && password === 'agentesderisco3c') {
        onLogin();
      } else {
        setError('Acesso negado');
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 relative overflow-hidden">
      {/* Futuristic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-red-200 rounded-full blur-[120px] opacity-30" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-red-300 rounded-full blur-[120px] opacity-30" />
      </div>

      <div className="w-full max-w-md bg-white/70 backdrop-blur-2xl border border-white/50 rounded-3xl shadow-2xl p-8 relative z-10">
        <div className="flex flex-col items-center mb-8">
          <img src={LOGO_3_CORACOES} alt="3 Corações Logo" className="w-24 h-24 mb-6 drop-shadow-lg" />
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">AssinaGR</h1>
          <p className="text-slate-500 mt-2 text-sm font-medium">Gerenciamento de Risco</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-white/50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3.5 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all"
              placeholder="Identificação"
              required
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3.5 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all"
              placeholder="Código de acesso"
              required
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-red-600 hover:bg-red-700 text-white rounded-xl py-3.5 font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-500/20 disabled:opacity-70"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Entrar
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
