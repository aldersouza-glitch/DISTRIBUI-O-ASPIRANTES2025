import React, { useState } from 'react';

interface LoginProps {
  onLoginSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'GSCG' && password === 'PMAL2025') {
      onLoginSuccess();
    } else {
      setError('Login ou senha incorretos.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-800 flex flex-col items-center justify-center p-4 font-sans">
      {/* Titles */}
      <div className="text-center text-white mb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-wider uppercase">
          Assessoria do Subcomandante Geral
        </h1>
        <p className="text-lg md:text-xl font-light tracking-widest mt-2 uppercase">
          Distribuição de Oficiais
        </p>
        <div className="w-24 h-px bg-red-500 mx-auto mt-6"></div>
      </div>

      {/* Form Card */}
      <div className="w-full max-w-sm bg-white rounded-xl shadow-2xl p-8">
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-5">
            <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="username">
              Usuário
            </label>
            <input
              className="appearance-none border border-slate-600 rounded-md w-full py-2 px-3 bg-slate-700 text-white placeholder-slate-400 leading-tight focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              id="username"
              type="text"
              placeholder="Digite seu usuário"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              aria-label="Usuário"
            />
          </div>
          <div className="mb-6">
            <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="password">
              Senha
            </label>
            <input
              className="appearance-none border border-slate-600 rounded-md w-full py-2 px-3 bg-slate-700 text-white placeholder-slate-400 leading-tight focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              id="password"
              type="password"
              placeholder="Digite sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              aria-label="Senha"
            />
          </div>
          {error && <p className="text-red-500 text-xs italic mb-4 text-center">{error}</p>}
          <div className="flex flex-col items-center">
            <button
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline w-full text-lg transition-colors duration-200"
              type="submit"
            >
              Entrar
            </button>
            <div className="w-20 h-1 bg-red-300 mt-2 rounded-full"></div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;