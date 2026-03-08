import React, { useState, useEffect, useCallback, memo } from 'react';
import { supabase } from '../supabaseClient';
import { Upload, Plus, Zap, Shield } from 'lucide-react';

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
      console.log('📤 НАЧАЛО ЗАГРУЗКИ:', { fileName: file.name, userId: user?.id });
      
      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('videos')
        .upload(fileName, file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;
      
      console.log('✅ ФАЙЛ ЗАГРУЖЕН:', uploadData);
      setUploadProgress(50);

      const { data: { publicUrl } } = supabase.storage
        .from('videos')
        .getPublicUrl(fileName);

      console.log('✅ ПУБЛИЧНАЯ ССЫЛКА:', publicUrl);
      setUploadProgress(75);

      const videoData = { 
        video_url: publicUrl, 
        description: description || '',
        likes: 0,
        created_by_email: user?.email || null
      };
      
      if (user?.id) {
        videoData.user_id = user.id;
      }

      const { data: dbData, error: dbError } = await supabase
        .from('videos')
        .insert([videoData])
        .select();

      if (dbError) throw dbError;
      
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

export default UploadPage;