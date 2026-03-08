import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Upload, Play, LogOut, Shield } from 'lucide-react';

// 🔴 ПРЯМЫЕ ИМПОРТЫ (без lazy, без memo — для стабильности)
import Auth from './components/Auth';
import UploadPage from './components/UploadPage';
import VideoCard from './components/VideoCard';

function App() {
  const [view, setView] = useState('feed');
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authView, setAuthView] = useState(null);

  // Проверка сессии
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          setIsAdmin(session.user.email === 'promir12345678910@gmail.com');
        }
      } catch (error) {
        console.error('Session error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
        setIsAdmin(session.user.email === 'promir12345678910@gmail.com');
      } else {
        setUser(null);
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Загрузка видео
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const { data, error } = await supabase
          .from('videos')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);
        if (error) throw error;
        setVideos(data || []);
      } catch (error) {
        console.error('Fetch error:', error);
      }
    };
    fetchVideos();
  }, []);

  const handleAuthSuccess = () => {
    setAuthView(null);
    // Перезагружаем видео после авторизации
    window.location.reload();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
    window.location.reload();
  };

  // Если показываем авторизацию
  if (authView) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  // Если показываем загрузку видео
  if (view === 'upload') {
    if (!user) {
      return (
        <div className="h-screen flex flex-col items-center justify-center text-cyan-400 px-4 bg-black">
          <Shield className="w-20 h-20 mb-4 text-pink-400" />
          <p className="text-xl font-bold text-white mb-2">Требуется вход</p>
          <button onClick={() => setAuthView('login')} className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-6 py-3 rounded-xl">
            Войти
          </button>
        </div>
      );
    }
    return <UploadPage onUploadSuccess={() => { setView('feed'); window.location.reload(); }} user={user} isAdmin={isAdmin} />;
  }

  // Главная лента
  return (
    <div className="h-screen w-full overflow-hidden bg-black relative">
      {/* Верхняя панель */}
      <div className="fixed top-0 left-0 w-full z-[100] flex justify-between items-center p-4 bg-black/80 backdrop-blur-md border-b border-cyan-500/20">
        <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">⚡ Zavtrak</h1>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              {isAdmin && <Shield className="w-5 h-5 text-pink-400" />}
              <button onClick={() => setView('upload')} className="bg-cyan-500/20 text-cyan-400 px-4 py-2 rounded-xl border border-cyan-500/50">
                Загрузить
              </button>
              <button onClick={handleLogout} className="text-purple-400 p-2"><LogOut className="w-5 h-5" /></button>
            </>
          ) : (
            <button onClick={() => setAuthView('login')} className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-4 py-2 rounded-xl">
              Войти
            </button>
          )}
        </div>
      </div>

      {/* Список видео */}
      <div className="h-full w-full overflow-y-scroll snap-y pt-16 pb-20">
        {isLoading ? (
          <div className="h-screen flex items-center justify-center text-cyan-400">Загрузка...</div>
        ) : videos.length === 0 ? (
          <div className="h-screen flex flex-col items-center justify-center text-cyan-400">
            <Upload className="w-16 h-16 mb-4" />
            <p className="text-lg">НЕТ ВИДЕО</p>
          </div>
        ) : (
          videos.map((video, index) => (
            <VideoCard key={video.id} video={video} isActive={index === 0} user={user} isAdmin={isAdmin} />
          ))
        )}
      </div>

      {/* Нижняя панель */}
      <div className="fixed bottom-0 left-0 w-full z-[100] flex justify-around items-center p-3 bg-black/90 backdrop-blur-md border-t border-cyan-500/20">
        <button className="text-cyan-400 flex flex-col items-center"><Play className="w-6 h-6" /><span className="text-xs">Главная</span></button>
        <button className="text-purple-400 flex flex-col items-center"><Upload className="w-6 h-6" /><span className="text-xs">Друзья</span></button>
        <div className="w-12" />
        <button onClick={user ? handleLogout : () => setAuthView('login')} className="text-pink-400 flex flex-col items-center">
          {user ? <LogOut className="w-6 h-6" /> : <Shield className="w-6 h-6" />}
          <span className="text-xs">{user ? 'Выход' : 'Профиль'}</span>
        </button>
      </div>
    </div>
  );
}

export default App;