import React from 'react';
import { Home, Upload, Heart, Users, LogOut, Zap, Menu, X } from 'lucide-react';

export const SideNav = ({ user, isAdmin, view, setView, onLogout, isOpen, setIsOpen }) => {
  const menuItems = [
    { id: 'feed', icon: Home, label: 'Главная', color: 'cyan' },
    { id: 'upload', icon: Upload, label: 'Загрузить', color: 'purple' },
    { id: 'likes', icon: Heart, label: 'Лайки', color: 'pink' },
    { id: 'friends', icon: Users, label: 'Друзья', color: 'purple' },
  ];

  return (
    <>
      {/* 🔴 Overlay для мобильного */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[99] md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* 🔴 Боковая панель */}
      <div className={`fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-black via-gray-900/95 to-black border-r border-cyan-500/30 z-[100] transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        {/* Заголовок */}
        <div className="p-6 border-b border-cyan-500/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center shadow-[0_0_20px_rgba(0,255,255,0.5)]">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Zavtrak
              </h2>
              {user && (
                <p className="text-xs text-purple-400/80">@{user.username || user.email?.split('@')[0]}</p>
              )}
            </div>
          </div>
          
          {isAdmin && (
            <div className="mt-2 flex items-center gap-1 text-pink-400 text-xs">
              <span>👑</span>
              <span>Администратор</span>
            </div>
          )}
        </div>

        {/* Меню */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setView(item.id);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                view === item.id 
                  ? `bg-${item.color}-500/20 border border-${item.color}-500/50 text-${item.color}-400 shadow-[0_0_20px_rgba(0,255,255,0.2)]` 
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon className={`w-5 h-5 ${view === item.id ? `text-${item.color}-400` : ''}`} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Выход */}
        {user && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-cyan-500/30">
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 border border-red-500/30 transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Выйти</span>
            </button>
          </div>
        )}
      </div>

      {/* 🔴 Кнопка меню (для мобильного) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-[101] md:hidden p-2 rounded-xl bg-black/60 backdrop-blur-md border border-cyan-500/50 text-cyan-400"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>
    </>
  );
};

export default SideNav;