import React, { useState, useEffect, useCallback, useMemo, Suspense, lazy } from 'react';
import { supabase } from './supabaseClient';
import { Upload, Play, Heart, MessageCircle, Share2, Plus, Zap, LogOut, Shield } from 'lucide-react';

// 🔴 ИМПОРТЫ КОМПОНЕНТОВ (исправлено: без фигурных скобок, так как в файлах export default)
import VideoCard from './components/VideoCard';
const Auth = lazy(() => import('./components/Auth'));
const UploadPage = lazy(() => import('./components/UploadPage'));

// 🔴 МЕМОИЗИРОВАННЫЕ ВСПОМОГАТЕЛЬНЫЕ КОМПОНЕНТЫ
const LoadingSpinner = React.memo(() => (
  <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/90 backdrop-blur-sm pointer-events-none">
    <div className="text-center">
      <div className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4 shadow-[0_0_30px_rgba(0,255,255,0.5)]" />
      <p className="text-cyan-400 text-base sm:text-lg font-semibold drop-shadow-[0_0_10px_rgba(0,255,255,0.8)] animate-pulse">ЗАГРУЗКА...</p>
    </div>
  </div>
));

const EmptyState = React.memo(({ user }) => (
  <div className="h-screen flex flex-col items-center justify-center text-cyan-400 px-4">
    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(0,255,255,0.5)] border border-cyan-400/50">
      <Upload className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
    </div>
    <p className="text-xl sm:text-2xl font-bold text-white mb-2 drop-shadow-[0_0_10px_rgba(0,255,255,0.8)] text-center">НЕТ ВИДЕО</p>
    <p className="text-sm text-purple-400 text-center">{user ? 'Будь первым кто загрузит в Zavtrak!' : 'Войдите, чтобы начать'}</p>
  </div>
));

const NavBar = React.memo(({ user, isAdmin, view, onViewChange, onLogout, onAuthClick }) => (
  <div className="fixed top-0 left-0 w-full z-[100] flex justify-between items-center p-3 sm:p-4 bg-gradient-to-b from-black/90 via-black/80 to-transparent backdrop-blur-md border-b border-cyan-500/20 safe-top">
    <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(0,255,255,0.5)]">
      ⚡ Zavtrak
    </h1>
    <div className="flex items-center gap-2">
      {user ? (
        <>
          {isAdmin && <Shield className="w-5 h-5 text-pink-400 drop-shadow-[0_0_10px_rgba(255,0,128,0.8)]" />}
          <button 
            onClick={() => onViewChange(view === 'feed' ? 'upload' : 'feed')} 
            className="bg-black/60 backdrop-blur-md text-cyan-400 px-4 sm:px-5 py-2 rounded-xl font-semibold border border-cyan-500/50 hover:bg-black/80 transition-all touch-button text-xs sm:text-sm flex items-center gap-1"
          >
            {view === 'feed' ? (
              <>
                <Plus className="inline w-4 h-4" /> Загрузить
              </>
            ) : '← Лента'}
          </button>
          <button onClick={onLogout} className="bg-black/60 backdrop-blur-md text-purple-400 p-2 rounded-xl border border-purple-500/50 hover:bg-black/80 transition-all touch-button" title="Выйти">
            <LogOut className="w-4 h-4" />
          </button>
        </>
      ) : (
        <button onClick={onAuthClick} className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-4 sm:px-5 py-2 rounded-xl font-semibold hover:from-cyan-600 hover:to-purple-600 transition-all touch-button text-xs sm:text-sm">
          Войти
        </button>
      )}
    </div>
  </div>
));

const BottomNav = React.memo(({ user, onLogout, onAuthClick }) => (
  <div className="fixed bottom-0 left-0 w-full z-[100] flex justify-around items-center p-2 sm:p-3 bg-gradient-to-t from-black/95 via-black/90 to-transparent backdrop-blur-md border-t border-cyan-500/30 safe-bottom" 
       style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
    <button className="flex flex-col items-center text-cyan-400 touch-button min-w-[60px]">
      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center shadow-[0_0_20px_rgba(0,255,255,0.4)]">
        <Play className="w-5 h-5 sm:w-6 sm:h-6" />
      </div>
      <span className="text-[10px] sm:text-xs mt-1 font-semibold drop-shadow-[0_0_5px_rgba(0,255,255,0.8)]">ГЛАВНАЯ</span>
    </button>
    <button className="flex flex-col items-center text-purple-400 hover:text-purple-300 transition-colors touch-button min-w-[60px]">
      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-black/60 flex items-center justify-center border border-purple-500/30">
        <Share2 className="w-5 h-5 sm:w-6 sm:h-6" />
      </div>
      <span className="text-[10px] sm:text-xs mt-1 drop-shadow-[0_0_5px_rgba(168,85,247,0.8)]">ДРУЗЬЯ</span>
    </button>
    <div className="w-12 sm:w-14" />
    <button className="flex flex-col items-center text-pink-400 hover:text-pink-300 transition-colors touch-button min-w-[60px]">
      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-black/60 flex items-center justify-center border border-pink-500/30">
        <Heart className="w-5 h-5 sm:w-6 sm:h-6" />
      </div>
      <span className="text-[10px] sm:text-xs mt-1 drop-shadow-[0_0_5px_rgba(255,0,128,0.8)]">ВХОДЯЩИЕ</span>
    </button>
    <button onClick={user ? onLogout : onAuthClick} className="flex flex-col items-center text-cyan-400 hover:text-cyan-300 transition-colors touch-button min-w-[60px]">
      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-black/60 flex items-center justify-center border border-cyan-500/30">
        {user ? <LogOut className="w-5 h-5 sm:w-6 sm:h-6" /> : <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />}
      </div>
      <span className="text-[10px] sm:text-xs mt-1 drop-shadow-[0_0_5px_rgba(0,255,255,0.8)]">
        {user ? 'ВЫХОД' : 'ПРОФИЛЬ'}
      </span>
    </button>
  </div>
));

const FloatingActionButton = React.memo(({ onClick }) => (
  <button 
    onClick={onClick}
    className="fixed bottom-[80px] sm:bottom-8 right-6 sm:right-8 z-[99] w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-[0_0_50px_rgba(0,255,255,0.6)] hover:scale-110 active:scale-95 transition-all transform border-4 border-cyan-400/50 group animate-pulse touch-button"
  >
    <Plus className="w-7 h-7 sm:w-8 sm:h-8 text-white group-hover:rotate-90 transition-transform drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
  </button>
));

const RequireAuth = React.memo(({ onAuthClick }) => (
  <div className="h-screen flex flex-col items-center justify-center text-cyan-400 px-4">
    <Shield className="w-20 h-20 mb-4 text-pink-400" />
    <p className="text-xl font-bold text-white mb-2">Требуется вход</p>
    <p className="text-sm text-purple-400 mb-4 text-center">Войдите, чтобы загружать видео</p>
    <button onClick={onAuthClick} className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-cyan-600 hover:to-purple-600 transition-all">
      Войти в аккаунт
    </button>
  </div>
));

// ============================================
// 🔴 ГЛАВНЫЙ КОМПОНЕНТ APP (ПОЛНАЯ ВЕРСИЯ)
// ============================================
function App() {
  // Группировка состояний для оптимизации рендеров
  const [state, setState] = useState({
    view: 'feed',
    videos: [],
    activeVideoIndex: 0,
    isLoading: true,
    visibleVideos: 3,
    user: null,
    isAdmin: false,
    authView: null,
  });

  const { view, videos, activeVideoIndex, isLoading, visibleVideos, user, isAdmin, authView } = state;

  // Стабильная функция обновления состояния
  const updateState = useCallback((updates) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Проверка сессии
  useEffect(() => {
    let isMounted = true;

    const checkSession = async () => {
      try {
        // 🔴 ИСПРАВЛЕНО: правильное деструктурирование ответа Supabase
        const { data: { session } } = await supabase.auth.getSession();
        if (!isMounted) return;
        
        if (session?.user) {
          const isAdminUser = session.user.email === 'promir12345678910@gmail.com';
          updateState({ user: session.user, isAdmin: isAdminUser });
        }
      } catch (error) {
        console.error('Session check error:', error);
      } finally {
        if (isMounted) updateState({ isLoading: false });
      }
    };
    
    checkSession();

    // Подписка на изменения авторизации
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;
      if (session?.user) {
        updateState({ 
          user: session.user, 
          isAdmin: session.user.email === 'promir12345678910@gmail.com' 
        });
      } else {
        updateState({ user: null, isAdmin: false });
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [updateState]);

  // Загрузка видео
  const fetchVideos = useCallback(async () => {
    if (state.isLoading && state.videos.length > 0) return;
    
    updateState({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      updateState({ videos: data || [] });
    } catch (error) {
      console.error("Ошибка загрузки видео:", error);
    } finally {
      updateState({ isLoading: false });
    }
  }, [updateState, state.isLoading, state.videos.length]);

  useEffect(() => { fetchVideos(); }, [fetchVideos]);

  // Обработчик скролла
  const handleScroll = useCallback((e) => {
    const index = Math.round(e.target.scrollTop / window.innerHeight);
    
    if (index !== activeVideoIndex) {
      updateState({ activeVideoIndex: index });
    }
    
    if (index > visibleVideos - 2 && visibleVideos < videos.length) {
      updateState({ visibleVideos: Math.min(visibleVideos + 3, videos.length) });
    }
  }, [activeVideoIndex, visibleVideos, videos.length, updateState]);

  // 🔴 КРИТИЧЕСКИ ВАЖНО: Правильные зависимости для колбэков
  const handleAuthSuccess = useCallback(() => { 
    fetchVideos(); 
    updateState({ authView: null }); 
  }, [fetchVideos, updateState]);

  const handleLogout = useCallback(async () => { 
    await supabase.auth.signOut(); 
    updateState({ user: null, isAdmin: false }); 
  }, [updateState]);

  const handleViewChange = useCallback((newView) => {
    updateState({ view: newView });
  }, [updateState]);

  const handleFloatingActionClick = useCallback(() => {
    handleViewChange('upload');
  }, [handleViewChange]);

  // Мемозированные вычисляемые значения
  const displayedVideos = useMemo(() => 
    videos.slice(0, visibleVideos), 
    [videos, visibleVideos]
  );

  const showUploadPage = useMemo(() => 
    view === 'upload' && user, 
    [view, user]
  );

  const showEmptyState = useMemo(() => 
    videos.length === 0 && !isLoading && view === 'feed', 
    [videos.length, isLoading, view]
  );

  const showRequireAuth = useMemo(() => 
    view === 'upload' && !user, 
    [view, user]
  );

  // Рендеринг страницы авторизации (с ленивой загрузкой)
  if (authView) {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <Auth onAuthSuccess={handleAuthSuccess} />
      </Suspense>
    );
  }

  return (
    <div className="h-screen w-full overflow-hidden bg-black relative safe-top safe-bottom">
      {/* Навигация */}
      <NavBar 
        user={user} 
        isAdmin={isAdmin} 
        view={view} 
        onViewChange={handleViewChange}
        onLogout={handleLogout}
        onAuthClick={() => updateState({ authView: 'login' })}
      />

      {/* Индикатор загрузки */}
      {isLoading && videos.length === 0 && <LoadingSpinner />}

      {/* Основной контент */}
      {showUploadPage ? (
        <Suspense fallback={<LoadingSpinner />}>
          <UploadPage 
            onUploadSuccess={handleAuthSuccess} 
            user={user} 
            isAdmin={isAdmin} 
          />
        </Suspense>
      ) : showRequireAuth ? (
        <RequireAuth onAuthClick={() => updateState({ authView: 'login' })} />
      ) : (
        <div 
          className="h-full w-full overflow-y-scroll snap-y hide-scrollbar" 
          onScroll={handleScroll} 
          style={{ scrollBehavior: 'smooth' }}
        >
          {showEmptyState ? (
            <EmptyState user={user} />
          ) : (
            displayedVideos.map((video, index) => (
              <VideoCard 
                key={video.id} 
                video={video} 
                isActive={index === activeVideoIndex} 
                user={user} 
                isAdmin={isAdmin} 
              />
            ))
          )}
        </div>
      )}

      {/* Плавающая кнопка */}
      {view === 'feed' && user && (
        <FloatingActionButton onClick={handleFloatingActionClick} />
      )}

      {/* Нижняя навигация */}
      {view === 'feed' && (
        <BottomNav 
          user={user} 
          onLogout={handleLogout} 
          onAuthClick={() => updateState({ authView: 'login' })} 
        />
      )}
    </div>
  );
}

export default App;