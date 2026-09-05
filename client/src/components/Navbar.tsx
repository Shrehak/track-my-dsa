import React from 'react';
import { LogOut, LogIn, Moon, Plus, Sun } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAddModal: () => void;
  onOpenAuthModal: () => void;
  dueCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onOpenAddModal, onOpenAuthModal, dueCount }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'review', label: dueCount > 0 ? `Review (${dueCount})` : 'Review' },
    { id: 'problems', label: 'Problems' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'planner', label: 'Study Planner' },
  ];

  return (
    <header className="app-navbar">
      <button className="brand-button" onClick={() => setActiveTab('dashboard')} aria-label="Open dashboard">
        <span className="brand-mark">T</span>
        <span className="brand-copy">
          <span className="brand-title">Track My DSA</span>
          <span className="brand-subtitle">Learn consistently. Remember longer.</span>
        </span>
      </button>

      <nav className="nav-tabs" aria-label="Primary navigation">
        {navItems.map(item => (
          <button
            key={item.id}
            className={`nav-tab${activeTab === item.id ? ' active' : ''}`}
            onClick={() => setActiveTab(item.id)}
            aria-current={activeTab === item.id ? 'page' : undefined}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="nav-actions">
        <button className="icon-button" onClick={toggleTheme} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        {user ? (
          <>
            <button className="btn btn-primary btn-sm" onClick={onOpenAddModal}>
              <Plus size={15} /><span>Log Problem</span>
            </button>
            <div className="user-stats">
              <span>🔥 {user.streakCount}d</span>
              <span>Level {user.level}</span>
              <span>{user.currentXP}/{user.nextLevelXP} XP</span>
              <button className="icon-button" onClick={logout} title="Sign out" aria-label="Sign out"><LogOut size={15} /></button>
            </div>
          </>
        ) : (
          <button className="btn btn-primary btn-sm" onClick={onOpenAuthModal}><LogIn size={15} /><span>Sign In</span></button>
        )}
      </div>
    </header>
  );
};
