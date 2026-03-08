import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { LogIn, UserPlus, Mail, Lock, Eye, EyeOff, Zap } from 'lucide-react';

export const Auth = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { username } },
        });
        if (error) throw error;
        if (data.user) {
          await supabase.from('profiles').update({ username }).eq('id', data.user.id);
        }
      }
      onAuthSuccess();
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.message || 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onAuthSuccess();
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-900/30 via-purple-900/20 to-pink-900/30" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-block p-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 mb-4 shadow-[0_0_50px_rgba(0,255,255,0.5)] border border-cyan-400/50">
            <Zap className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(0,255,255,0.5)]">
            ⚡ Zavtrak
          </h1>
          <p className="text-cyan-400/80">{isLogin ? 'Войти в аккаунт' : 'Создать аккаунт'}</p>
        </div>

        <form onSubmit={handleAuth} className="bg-black/60 backdrop-blur-md rounded-3xl p-6 border border-cyan-500/30 shadow-[0_0_30px_rgba(0,255,255,0.2)]">
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          {!isLogin && (
            <div className="mb-4">
              <label className="block text-cyan-400 text-sm mb-2">Имя пользователя</label>
              <div className="relative">
                <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-black/40 border border-purple-500/30 rounded-xl py-3 pl-10 pr-4 text-white placeholder-purple-400/50 focus:outline-none focus:border-cyan-400 transition-all"
                  placeholder="cyber_user"
                  required={!isLogin}
                />
              </div>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-cyan-400 text-sm mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/40 border border-cyan-500/30 rounded-xl py-3 pl-10 pr-4 text-white placeholder-cyan-400/50 focus:outline-none focus:border-cyan-400 transition-all"
                placeholder="user@example.com"
                required
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-cyan-400 text-sm mb-2">Пароль</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-pink-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/40 border border-pink-500/30 rounded-xl py-3 pl-10 pr-12 text-white placeholder-pink-400/50 focus:outline-none focus:border-cyan-400 transition-all"
                placeholder="••••••••"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400 hover:text-cyan-400 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 py-3 rounded-xl font-bold text-white hover:from-cyan-600 hover:via-purple-600 hover:to-pink-600 disabled:opacity-50 transition-all transform hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(0,255,255,0.4)] border border-cyan-400/50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isLogin ? (
              <><LogIn className="w-5 h-5" /> Войти</>
            ) : (
              <><UserPlus className="w-5 h-5" /> Зарегистрироваться</>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            className="text-cyan-400 hover:text-pink-400 transition-colors text-sm"
          >
            {isLogin ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
          </button>
        </div>

        <button
          onClick={handleLogout}
          className="mt-4 w-full py-2 text-purple-400 hover:text-pink-400 transition-colors text-sm border border-purple-500/30 rounded-xl hover:bg-purple-500/10"
        >
          Выйти из аккаунта
        </button>
      </div>
    </div>
  );
};

export default Auth;