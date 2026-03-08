import React, { useState, useEffect, useCallback, memo } from 'react';
import { supabase } from './supabaseClient';
import { Upload, Play, Heart, MessageCircle, Share2, Plus, Zap, LogOut, Shield } from 'lucide-react';
import VideoCard from './components/VideoCard';
import Auth from './components/Auth';

const UploadPage = memo(({ onUploadSuccess, user, isAdmin }) => {
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  const handleUpload = useCallback(async () => {
    if (!file || !user) return alert("Выберите файл и войдите в аккаунт!");
    setLoading(true);
    setUploadProgress(0);

    try {
      console.log('📤 НАЧАЛО ЗАГРУЗКИ:', { fileName: file.name, userId: user.id });
      
      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      
      // 1. Загружаем файл в Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('videos')
        .upload(fileName, file, { cacheControl: '3600', upsert: false });

      if (uploadError) {
        console.error('❌ ОШИБКА ЗАГРУЗКИ ФАЙЛА:', uploadError);
        throw uploadError;
      }
      
      console.log('✅ ФАЙЛ ЗАГРУЖЕН:', uploadData);
      setUploadProgress(50);

      // 2. Получаем публичную ссылку
      const { data: { publicUrl } } = supabase.storage
        .from('videos')
        .getPublicUrl(fileName);

      console.log('✅ ПУБЛИЧНАЯ ССЫЛКА:', publicUrl);
      setUploadProgress(75);

      // 3. Сохраняем в базу данных
      const { data: dbData, error: dbError } = await supabase
        .from('videos')
        .insert([{ 
          video_url: publicUrl, 
          description: description || '',
          likes: 0,
          user_id: user.id,
          created_by_email: user.email
        }])
        .select();

      if (dbError) {
        console.error('❌ ОШИБКА БАЗЫ ДАННЫХ:', dbError);
        throw dbError;
      }
      
      console.log('✅ ВИДЕО СОХРАНЕНО В БД:', dbData);
      setUploadProgress(100);
      alert("🎉 Видео загружено!");
      onUploadSuccess();
    } catch (error) {
      console.error("❌ ПОЛНАЯ ОШИБКА ЗАГРУЗКИ:", error);
      alert("Ошибка: " + (error.message || "Не удалось загрузить видео"));
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  }, [file, description, user, onUploadSuccess]);

  return (
    <div className="h-screen w-full bg-black text-white p-4 sm:p-6 flex flex-col items-center justify-center relative overflow-hidden safe-top safe-bottom">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-900/30 via-purple-900/20 to-pink-900/30" />

      <div className="w-full max-w-lg relative z-10 px-4">
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-block p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 mb-4 shadow-[0_0_50px_rgba(0,255,255,0.5)] border border-cyan-400/50">
            <Upload className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(0,255,255,0.5)]">
            ЗАГРУЗИТЬ ВИДЕО
          </h1>
          <p className="text-cyan-400/80 text-sm sm:text-base">
            {user?.email === 'promir12345678910@gmail.com' && '👑 АДМИН: '}
            Поделись моментом в Zavtrak
          </p>
          {user && (
            <p className="text-purple-400/60 text-xs mt-2">
              Аккаунт: {user.email} {isAdmin && <Shield className="inline w-3 h-3 text-pink-400" />}
            </p>
          )}
        </div>

        {preview && (
          <div className="mb-4 sm:mb-6 rounded-2xl overflow-hidden border-2 border-cyan-500/50 shadow-[0_0_30px_rgba(0,255,255,0.3)]">
            <video src={preview} className="w-full h-48 sm:h-72 object-cover" controls />
          </div>
        )}

        <label className="block w-full mb-4 touch-button">
          <div className="border-2 border-dashed border-cyan-500/50 rounded-2xl p-6 sm:p-8 text-center hover:border-cyan-400 transition-all cursor-pointer bg-black/60 backdrop-blur-sm hover:bg-black/80 group shadow-[0_0_20px_rgba(0,255,255,0.2)]">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(0,255,255,0.5)]">
              <Plus className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>
            <p className="text-cyan-400 font-semibold text-sm sm:text-base">Нажмите для выбора видео</p>
            <p className="text-purple-400/60 text-xs sm:text-sm mt-2">MP4, WebM до 50MB</p>
          </div>
          <input type="file" accept="video/*" onChange={(e) => setFile(e.target.files[0])} className="hidden" />
        </label>

        <textarea placeholder="Опишите ваше видео..." className="w-full bg-black/60 backdrop-blur-sm border border-cyan-500/30 rounded-2xl p-4 mb-4 text-white placeholder-purple-400/50 focus:outline-none focus:border-cyan-400 focus:bg-black/80 transition-all resize-none shadow-[0_0_15px_rgba(0,255,255,0.2)] text-sm sm:text-base" rows="3" onChange={(e) => setDescription(e.target.value)} value={description} />

        {loading && (
          <div className="mb-4 sm:mb-6">
            <div className="flex justify-between text-xs sm:text-sm text-cyan-400/80 mb-2">
              <span>Загрузка...</span>
              <span className="text-pink-400 font-bold">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-black/60 rounded-full h-3 overflow-hidden border border-cyan-500/30">
              <div className="bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 h-full rounded-full transition-all duration-500 shadow-[0_0_20px_rgba(0,255,255,0.5)]" style={{ width: `${uploadProgress}%` }} />
            </div>
          </div>
        )}

        <button onClick={handleUpload} disabled={loading || !file} className="w-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-bold text-white hover:from-cyan-600 hover:via-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(0,255,255,0.5)] border border-cyan-400/50 flex items-center justify-center gap-2 touch-button text-sm sm:text-base">
          {loading ? (<><div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />Загрузка...</>) : (<><Zap className="w-4 h-4 sm:w-5 sm:h-5" />🚀 ОПУБЛИКОВАТЬ</>)}
        </button>
      </div>
    </div>
  );
});

function App() {
  const [view, setView] = useState('feed');
  const [videos, setVideos] = useState([]);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [visibleVideos, setVisibleVideos] = useState(3);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authView, setAuthView] = useState(null);

  useEffect(() => {
    const checkSession = async () => {
      console.log('🔍 Проверка сессии...');
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        console.log('✅ Пользователь авторизован:', session.user.email);
        setUser(session.user);
        if (session.user.email === 'promir12345678910@gmail.com') {
          console.log('👑 АДМИН обнаружен!');
          setIsAdmin(true);
        }
      } else {
        console.log('❌ Пользователь не авторизован');
      }
      setIsLoading(false);
    };
    
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Изменение авторизации:', event);
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

  // 🔴 ИСПРАВЛЕННАЯ ФУНКЦИЯ fetchVideos
  const fetchVideos = useCallback(async () => {
    console.log('📥 ЗАГРУЗКА ВИДЕО...');
    setIsLoading(true);
    try {
      // 🔴 ИСПРАВЛЕНО: безопасный запрос с явным указанием foreign key
      const { data, error } = await supabase
        .from('videos')
        .select(`
          *,
          profiles:user_id (
            username,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) {
        console.error('❌ ОШИБКА ЗАГРУЗКИ ВИДЕО:', error);
        // 🔴 Если ошибка 406 — пробуем без join с profiles
        if (error.code === '406' || error.message?.includes('406')) {
          console.log('🔄 Пробуем загрузить видео без профиля...');
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('videos')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);
          
          if (fallbackError) throw fallbackError;
          console.log('✅ ВИДЕО ЗАГРУЖЕНО (без профиля):', fallbackData);
          setVideos(fallbackData || []);
          return;
        }
        throw error;
      }
      
      console.log('✅ ВИДЕО ЗАГРУЖЕНО:', data);
      console.log('📊 КОЛИЧЕСТВО ВИДЕО:', data?.length);
      setVideos(data || []);
    } catch (error) {
      console.error("Ошибка загрузки видео:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { 
    console.log('🔄 useEffect: загрузка видео');
    fetchVideos(); 
  }, [fetchVideos]);

  const handleScroll = useCallback((e) => {
    const index = Math.round(e.target.scrollTop / window.innerHeight);
    setActiveVideoIndex(index);
    if (index > visibleVideos - 2 && visibleVideos < videos.length) {
      setVisibleVideos(prev => Math.min(prev + 3, videos.length));
    }
  }, [visibleVideos, videos.length]);

  const handleAuthSuccess = useCallback(() => { 
    console.log('✅ Авторизация успешна, обновляем видео...');
    fetchVideos(); 
    setAuthView(null); 
  }, [fetchVideos]);
  
  const handleLogout = async () => { 
    console.log('🚪 Выход из аккаунта...');
    await supabase.auth.signOut(); 
    setUser(null); 
    setIsAdmin(false); 
  };

  if (authView) return <Auth onAuthSuccess={handleAuthSuccess} />;

  return (
    <div className="h-screen w-full overflow-hidden bg-black relative safe-top safe-bottom">
      {/* Верхняя навигация */}
      <div className="fixed top-0 left-0 w-full z-[100] flex justify-between items-center p-3 sm:p-4 bg-gradient-to-b from-black/90 via-black/80 to-transparent backdrop-blur-md border-b border-cyan-500/20 safe-top">
        <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(0,255,255,0.5)]">
          ⚡ Zavtrak
        </h1>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              {isAdmin && <Shield className="w-5 h-5 text-pink-400 drop-shadow-[0_0_10px_rgba(255,0,128,0.8)]" />}
              <button 
                onClick={() => setView(view === 'feed' ? 'upload' : 'feed')}
                className="bg-black/60 backdrop-blur-md text-cyan-400 px-4 sm:px-5 py-2 rounded-xl font-semibold border border-cyan-500/50 hover:bg-black/80 transition-all touch-button text-xs sm:text-sm flex items-center gap-1"
              >
                {view === 'feed' ? <><Plus className="inline w-4 h-4" /> Загрузить</> : '← Лента'}
              </button>
              <button 
                onClick={handleLogout}
                className="bg-black/60 backdrop-blur-md text-purple-400 p-2 rounded-xl border border-purple-500/50 hover:bg-black/80 transition-all touch-button"
                title="Выйти"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button 
              onClick={() => setAuthView('login')}
              className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-4 sm:px-5 py-2 rounded-xl font-semibold hover:from-cyan-600 hover:to-purple-600 transition-all touch-button text-xs sm:text-sm"
            >
              Войти
            </button>
          )}
        </div>
      </div>

      {/* Индикатор загрузки */}
      {isLoading && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/90 backdrop-blur-sm">
          <div className="text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4 shadow-[0_0_30px_rgba(0,255,255,0.5)]" />
            <p className="text-cyan-400 text-base sm:text-lg font-semibold drop-shadow-[0_0_10px_rgba(0,255,255,0.8)]">ЗАГРУЗКА ДАННЫХ...</p>
          </div>
        </div>
      )}

      {view === 'upload' ? (
        user ? (
          <UploadPage onUploadSuccess={() => { console.log('✅ Загрузка завершена'); fetchVideos(); setView('feed'); }} user={user} isAdmin={isAdmin} />
        ) : (
          <div className="h-screen flex flex-col items-center justify-center text-cyan-400 px-4">
            <Shield className="w-20 h-20 mb-4 text-pink-400" />
            <p className="text-xl font-bold text-white mb-2">Требуется вход</p>
            <p className="text-sm text-purple-400 mb-4 text-center">Войдите, чтобы загружать видео</p>
            <button onClick={() => setAuthView('login')} className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-cyan-600 hover:to-purple-600 transition-all">
              Войти в аккаунт
            </button>
          </div>
        )
      ) : (
        <div className="h-full w-full overflow-y-scroll snap-y hide-scrollbar" onScroll={handleScroll} style={{ scrollBehavior: 'smooth' }}>
          {videos.length === 0 && !isLoading && (
            <div className="h-screen flex flex-col items-center justify-center text-cyan-400 px-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(0,255,255,0.5)] border border-cyan-400/50">
                <Upload className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
              </div>
              <p className="text-xl sm:text-2xl font-bold text-white mb-2 drop-shadow-[0_0_10px_rgba(0,255,255,0.8)] text-center">НЕТ ВИДЕО</p>
              <p className="text-sm text-purple-400 text-center">{user ? 'Будь первым кто загрузит в Zavtrak!' : 'Войдите, чтобы начать'}</p>
            </div>
          )}
          {videos.slice(0, visibleVideos).map((video, index) => (
            <VideoCard key={video.id} video={video} isActive={index === activeVideoIndex} user={user} isAdmin={isAdmin} />
          ))}
        </div>
      )}

      {/* Плавающая кнопка загрузки */}
      {view === 'feed' && user && (
        <button 
          onClick={() => setView('upload')}
          className="fixed bottom-[80px] sm:bottom-8 right-6 sm:right-8 z-[99] w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-[0_0_50px_rgba(0,255,255,0.6)] hover:scale-110 active:scale-95 transition-all transform border-4 border-cyan-400/50 group animate-pulse touch-button"
        >
          <Plus className="w-7 h-7 sm:w-8 sm:h-8 text-white group-hover:rotate-90 transition-transform drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
        </button>
      )}

      {/* Нижняя навигация */}
      {view === 'feed' && (
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
          <button 
            onClick={() => user ? handleLogout() : setAuthView('login')}
            className="flex flex-col items-center text-cyan-400 hover:text-cyan-300 transition-colors touch-button min-w-[60px]"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-black/60 flex items-center justify-center border border-cyan-500/30">
              {user ? <LogOut className="w-5 h-5 sm:w-6 sm:h-6" /> : <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />}
            </div>
            <span className="text-[10px] sm:text-xs mt-1 drop-shadow-[0_0_5px_rgba(0,255,255,0.8)]">
              {user ? 'ВЫХОД' : 'ПРОФИЛЬ'}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

export default App;