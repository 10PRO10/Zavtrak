import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { Heart, MessageCircle, Share2, Play, Volume2, VolumeX, Zap, Trash2 } from 'lucide-react';

const VideoCard = ({ video, isActive, user, isAdmin }) => {
  const videoRef = useRef(null);
  const [likeCount, setLikeCount] = useState(video.likes || 0);
  const [hasLiked, setHasLiked] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showHeart, setShowHeart] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  // Автоплей видео когда оно активно
  useEffect(() => {
    if (isActive && videoRef.current) {
      videoRef.current.play().catch(e => console.log("Autoplay blocked:", e));
      setIsPlaying(true);
    } else if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setIsPlaying(false);
    }
    
    // Проверка лайков в localStorage
    const likedVideos = JSON.parse(localStorage.getItem('likedVideos') || '[]');
    if (likedVideos.includes(video.id)) setHasLiked(true);
  }, [isActive, video.id]);

  // Обработка лайка
  const handleLike = async () => {
    if (hasLiked || !user) return;
    
    // Анимация сердечка
    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 1000);
    
    // Обновляем локально
    const newLikeCount = likeCount + 1;
    setLikeCount(newLikeCount);
    setHasLiked(true);
    
    // Сохраняем в localStorage
    const likedVideos = JSON.parse(localStorage.getItem('likedVideos') || '[]');
    likedVideos.push(video.id);
    localStorage.setItem('likedVideos', JSON.stringify(likedVideos));
    
    // Отправляем в базу
    const { error } = await supabase
      .from('videos')
      .update({ likes: newLikeCount })
      .eq('id', video.id);
    
    if (error) {
      console.error("❌ Ошибка лайка:", error);
      // Откат изменений при ошибке
      setLikeCount(likeCount);
      setHasLiked(false);
      likedVideos.pop();
      localStorage.setItem('likedVideos', JSON.stringify(likedVideos));
    }
  };

  // Play/Pause по клику
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Вкл/выкл звук
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Удаление видео (только админ или автор)
  const handleDelete = async () => {
    if (!window.confirm('Удалить это видео?')) return;
    
    try {
      // Удаляем файл из Storage
      const videoPath = video.video_url.split('/').pop();
      if (videoPath) {
        await supabase.storage.from('videos').remove([videoPath]);
      }
      
      // Удаляем запись из БД
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', video.id);
      
      if (error) throw error;
      
      alert('✅ Видео удалено');
      // Перезагружаем страницу для обновления списка
      window.location.reload();
    } catch (err) {
      console.error('❌ Ошибка удаления:', err);
      alert('❌ Не удалось удалить видео: ' + err.message);
    }
  };

  // 🔴 БЕЗОПАСНОЕ получение имени пользователя
  const getUsername = () => {
    try {
      if (video.profiles?.username) {
        return video.profiles.username;
      }
      if (video.created_by_email) {
        return video.created_by_email.split('@')[0];
      }
      if (video.id) {
        return `user_${String(video.id).slice(0, 6)}`;
      }
      return 'anon_user';
    } catch (e) {
      return 'anon_user';
    }
  };

  return (
    <div className="snap-center h-screen w-full relative bg-black flex items-center justify-center overflow-hidden">
      {/* Киберпанк фон */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-900/20 via-purple-900/10 to-pink-900/20" />

      {/* Контейнер видео */}
      <div className="relative w-full max-w-md h-[70vh] sm:h-[75vh] rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,255,255,0.3)] border border-cyan-500/30 mx-4 sm:mx-0">
        {/* Skeleton loader */}
        {!isVideoLoaded && (
          <div className="absolute inset-0 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 animate-pulse" />
        )}
        
        {/* Видео элемент */}
        <video
          ref={videoRef}
          src={video.video_url}
          className="h-full w-full object-cover"
          loop
          playsInline
          muted={isMuted}
          onClick={togglePlay}
          onLoadedData={() => setIsVideoLoaded(true)}
          preload="metadata"
        />

        {/* Scan lines эффект */}
        <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.3)_50%)] bg-[size:100%_4px] pointer-events-none opacity-20" />
        
        {/* Градиент поверх видео для читаемости текста */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90 pointer-events-none" />

        {/* Анимация лайка */}
        {showHeart && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
            <div className="animate-ping">
              <Heart className="w-32 h-32 sm:w-40 sm:h-40 text-pink-500 fill-pink-500 drop-shadow-[0_0_30px_rgba(255,0,128,0.8)]" />
            </div>
          </div>
        )}

        {/* Кнопка Play по центру (когда пауза) */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <div className="bg-black/70 backdrop-blur-sm p-4 sm:p-6 rounded-full border-2 border-cyan-500/50 shadow-[0_0_30px_rgba(0,255,255,0.5)]">
              <Play className="w-16 h-16 sm:w-20 sm:h-20 text-cyan-400 fill-cyan-400" />
            </div>
          </div>
        )}

        {/* Информация о видео (внизу) */}
        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 z-20">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 flex items-center justify-center border-2 border-cyan-400/50 shadow-[0_0_20px_rgba(0,255,255,0.5)]">
              <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-cyan-400 text-sm sm:text-base drop-shadow-[0_0_10px_rgba(0,255,255,0.8)]">
                @{getUsername()}
              </h3>
              <p className="text-purple-400 text-xs">Zavtrak Creator</p>
            </div>
          </div>
          <p className="text-white text-xs sm:text-sm mb-2 drop-shadow-md line-clamp-2">
            {video.description || "Без описания"}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-pink-400 text-xs drop-shadow-[0_0_5px_rgba(255,0,128,0.8)]">
              🎵 Оригинальный звук
            </span>
          </div>
        </div>

        {/* Кнопка Mute (справа вверху) */}
        <button 
          onClick={toggleMute} 
          className="absolute top-3 sm:top-4 right-3 sm:right-4 z-30 p-2 sm:p-3 rounded-full bg-black/60 backdrop-blur-sm hover:bg-black/80 transition-all border border-cyan-500/30 shadow-[0_0_15px_rgba(0,255,255,0.3)] touch-button"
        >
          {isMuted ? (
            <VolumeX className="text-cyan-400 w-4 h-4 sm:w-5 sm:h-5" />
          ) : (
            <Volume2 className="text-cyan-400 w-4 h-4 sm:w-5 sm:h-5" />
          )}
        </button>
      </div>

      {/* Кнопки действий (справа внизу) */}
      <div className="absolute bottom-16 sm:bottom-20 left-1/2 transform -translate-x-1/2 z-30 flex items-center gap-3 sm:gap-6 px-4">
        {/* Кнопка лайка */}
        <button 
          onClick={handleLike} 
          className={`group relative p-3 sm:p-4 rounded-xl transition-all duration-300 transform touch-button ${
            hasLiked 
              ? 'bg-gradient-to-r from-pink-600 to-purple-600 scale-110 shadow-[0_0_30px_rgba(255,0,128,0.6)] border border-pink-400' 
              : 'bg-black/80 backdrop-blur-md hover:bg-black/90 hover:scale-110 border border-cyan-500/50 shadow-[0_0_20px_rgba(0,255,255,0.3)]'
          } active:scale-95`} 
          type="button" 
          disabled={hasLiked || !user}
        >
          <div className="relative">
            <Heart className={`w-6 h-6 sm:w-8 sm:h-8 transition-all duration-300 ${
              hasLiked 
                ? 'text-pink-400 fill-pink-400 drop-shadow-[0_0_15px_rgba(255,0,128,0.8)]' 
                : 'text-cyan-400 group-hover:text-pink-400'
            }`} />
            {hasLiked && (
              <div className="absolute inset-0 animate-ping">
                <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-pink-400 fill-pink-400 opacity-50" />
              </div>
            )}
          </div>
          <span className="text-cyan-400 text-xs mt-1 block text-center font-bold drop-shadow-[0_0_5px_rgba(0,255,255,0.8)]">
            {likeCount}
          </span>
        </button>

        {/* Кнопка комментариев */}
        <button className="group relative p-3 sm:p-4 rounded-xl bg-black/80 backdrop-blur-md hover:bg-black/90 transition-all duration-300 transform hover:scale-110 border border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.3)] active:scale-95 touch-button">
          <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400 group-hover:text-purple-300 group-hover:drop-shadow-[0_0_15px_rgba(168,85,247,0.8)] transition-all" />
          <span className="text-purple-400 text-xs mt-1 block text-center font-bold drop-shadow-[0_0_5px_rgba(168,85,247,0.8)]">0</span>
        </button>

        {/* Кнопка поделиться */}
        <button className="group relative p-3 sm:p-4 rounded-xl bg-black/80 backdrop-blur-md hover:bg-black/90 transition-all duration-300 transform hover:scale-110 border border-pink-500/50 shadow-[0_0_20px_rgba(255,0,128,0.3)] active:scale-95 touch-button">
          <Share2 className="w-6 h-6 sm:w-8 sm:h-8 text-pink-400 group-hover:text-pink-300 group-hover:drop-shadow-[0_0_15px_rgba(255,0,128,0.8)] transition-all" />
          <span className="text-pink-400 text-xs mt-1 block text-center font-bold drop-shadow-[0_0_5px_rgba(255,0,128,0.8)]">Share</span>
        </button>

        {/* 🔴 Кнопка удаления (только для админа или автора) */}
        {(isAdmin || user?.id === video.user_id) && (
          <button 
            onClick={handleDelete} 
            className="group relative p-3 sm:p-4 rounded-xl bg-black/80 backdrop-blur-md hover:bg-red-500/20 transition-all duration-300 transform hover:scale-110 border border-red-500/50 shadow-[0_0_20px_rgba(255,0,0,0.3)] active:scale-95 touch-button" 
            title="Удалить видео"
          >
            <Trash2 className="w-6 h-6 sm:w-8 sm:h-8 text-red-400 group-hover:text-red-300 group-hover:drop-shadow-[0_0_15px_rgba(255,0,0,0.8)] transition-all" />
            <span className="text-red-400 text-xs mt-1 block text-center font-bold drop-shadow-[0_0_5px_rgba(255,0,0,0.8)]">Del</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default VideoCard;