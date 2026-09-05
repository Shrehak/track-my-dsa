import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { api } from './services/api';
import { DashboardStats } from './types';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { RevisionQueue } from './components/RevisionQueue';
import { ProblemList } from './components/ProblemList';
import { AnalyticsView } from './components/AnalyticsView';
import { StudyPlanner } from './components/StudyPlanner';
import { AddProblemModal } from './components/AddProblemModal';
import { AuthModal } from './components/AuthModal';

export const App: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState<boolean>(false);

  const fetchStats = async () => {
    if (!user) return;
    setStatsLoading(true);
    try {
      const data = await api.getDashboardStats();
      setDashboardStats(data);
    } catch (err) {
      console.error('Failed to load dashboard statistics:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchStats();
    } else {
      setDashboardStats(null);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) {
      setIsAuthModalOpen(true);
    }
  }, [authLoading, user]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#FFFFFF' }}>
      {/* Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        dueCount={dashboardStats?.counts.due || 0}
      />

      {/* Main Content Area */}
      <main style={{ flex: 1, maxWidth: '1180px', width: '100%', margin: '0 auto', padding: '36px 24px 64px' }}>
        {activeTab === 'dashboard' && (
          <Dashboard
            stats={dashboardStats}
            loading={statsLoading || authLoading}
            onStartReview={() => setActiveTab('review')}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onNavigateToProblems={() => setActiveTab('problems')}
          />
        )}

        {activeTab === 'review' && (
          <RevisionQueue
            onReviewCompleted={() => {
              fetchStats();
            }}
          />
        )}

        {activeTab === 'problems' && (
          <ProblemList
            onOpenAddModal={() => setIsAddModalOpen(true)}
          />
        )}

        {activeTab === 'analytics' && <AnalyticsView />}

        {activeTab === 'planner' && <StudyPlanner />}
      </main>

      {/* Editorial Footer */}
      <footer
        style={{
          borderTop: '2px solid #000000',
          padding: '24px',
          textAlign: 'center',
          backgroundColor: '#FFFFFF',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.78rem',
          color: 'var(--text-muted)',
        }}
      >
        <div style={{ maxWidth: '1180px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <strong>TRACK MY DSA</strong> // EDITORIAL RETENTION SYSTEM (SUPERMEMO SM-2)
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <span>REACT 18 + NODE.JS + PRISMA ORM</span>
            <span>•</span>
            <a
              href="https://github.com/Shrehak/track-my-dsa"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#000000', textDecoration: 'underline' }}
            >
              SOURCE REPOSITORY
            </a>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AddProblemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onProblemAdded={() => {
          fetchStats();
        }}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};
