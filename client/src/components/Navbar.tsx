import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, LogIn, Plus } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAddModal: () => void;
  onOpenAuthModal: () => void;
  dueCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddModal,
  onOpenAuthModal,
  dueCount,
}) => {
  const { user, logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    {
      id: 'review',
      label: dueCount > 0 ? `Review Deck (${dueCount})` : 'Review Deck',
    },
    { id: 'problems', label: 'Problems' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'planner', label: 'Study Planner' },
  ];

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: '#FFFFFF',
        borderBottom: '2px solid #000000',
        padding: '16px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '24px',
      }}
    >
      {/* Editorial Masthead */}
      <div
        style={{
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={() => setActiveTab('dashboard')}
      >
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.4rem',
            fontWeight: 900,
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
            color: '#000000',
          }}
        >
          TRACK MY DSA
        </span>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.68rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            marginTop: '2px',
          }}
        >
          Algorithmic Retention Engine // SM-2
        </span>
      </div>

      {/* Navigation Tabs */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {navItems.map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8rem',
                fontWeight: isActive ? 700 : 500,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                padding: '8px 14px',
                backgroundColor: isActive ? '#000000' : 'transparent',
                color: isActive ? '#FFFFFF' : '#000000',
                border: '1px solid #000000',
                cursor: 'pointer',
                transition: 'all var(--transition-instant)',
              }}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Actions & User Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {user ? (
          <>
            {/* Quick Log Problem */}
            <button className="btn btn-primary btn-sm" onClick={onOpenAddModal}>
              <Plus size={14} />
              <span>Log Problem</span>
            </button>

            {/* Monospace User Stats Pill */}
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.78rem',
                padding: '6px 12px',
                border: '1px solid #000000',
                backgroundColor: '#F5F5F5',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <span>
                STREAK: <strong>{user.streakCount}D</strong>
              </span>
              <span>|</span>
              <span>
                LVL <strong>{user.level}</strong>
              </span>
              <span>|</span>
              <span>
                <strong>{user.currentXP}</strong>/{user.nextLevelXP} XP
              </span>

              <button
                onClick={logout}
                title="Sign Out"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#000000',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '2px',
                  marginLeft: '4px',
                }}
              >
                <LogOut size={14} />
              </button>
            </div>
          </>
        ) : (
          <button className="btn btn-primary btn-sm" onClick={onOpenAuthModal}>
            <LogIn size={14} />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};
