import React from 'react';
import { DashboardStats } from '../types';
import { ArrowRight, Plus } from 'lucide-react';

interface DashboardProps {
  stats: DashboardStats | null;
  loading: boolean;
  onStartReview: () => void;
  onOpenAddModal: () => void;
  onNavigateToProblems: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  stats,
  loading,
  onStartReview,
  onOpenAddModal,
  onNavigateToProblems,
}) => {
  if (loading || !stats) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px', color: 'var(--text-muted)' }}>
        <p>Loading your dashboard…</p>
      </div>
    );
  }

  const { counts, difficultyBreakdown, weeklyActivity, recentReflections, user } = stats;
  const masteryPercentage =
    counts.total > 0 ? Math.round((counts.mastered / counts.total) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
      <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '28px' }}>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.78rem',
            fontWeight: 650,
            color: 'var(--text-muted)',
            display: 'block',
            marginBottom: '8px',
          }}
        >
          Welcome back, {user.name}
        </span>
        <h1
          style={{
            fontSize: 'clamp(2.2rem, 5vw, 3.35rem)',
            lineHeight: 1.08,
            fontWeight: 780,
            letterSpacing: '-0.045em',
            marginBottom: '12px',
          }}
        >
          Keep your problem-solving skills fresh.
        </h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: '680px' }}>
          Track solved problems, review them at the right time, and turn short-term practice into lasting pattern recognition.
        </p>

        {/* Action Row */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '20px', flexWrap: 'wrap' }}>
          {counts.due > 0 ? (
            <button className="btn btn-primary" onClick={onStartReview}>
              <span>Start Review Deck ({counts.due} Due)</span>
              <ArrowRight size={14} />
            </button>
          ) : (
            <div
              style={{
                fontSize: '0.85rem',
                padding: '10px 16px',
                border: '1px solid var(--border-color)',
                borderRadius: '10px',
                backgroundColor: 'var(--surface-soft)',
                fontWeight: 600,
              }}
            >
              All revisions completed today ✓
            </div>
          )}
          <button className="btn btn-secondary" onClick={onOpenAddModal}>
            <Plus size={14} />
            <span>Add Solved Problem</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px',
        }}
      >
        {/* Total Solved */}
        <div className="glass-card-thick">
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              marginBottom: '12px',
            }}
          >
            Total solved
          </div>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '3rem',
              fontWeight: 900,
              lineHeight: 1,
              marginBottom: '8px',
            }}
          >
            {counts.total}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            {counts.mastered} Mastered • {counts.learning} Learning
          </div>
        </div>

        {/* Due Today */}
        <div
          className={counts.due > 0 ? 'glass-card-thick card-inverted' : 'glass-card-thick'}
          style={{
            color: counts.due > 0 ? 'white' : 'var(--text-primary)',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: counts.due > 0 ? 'rgba(255,255,255,.78)' : 'var(--text-muted)',
              marginBottom: '12px',
            }}
          >
            Revisions due
          </div>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '3rem',
              fontWeight: 900,
              lineHeight: 1,
              marginBottom: '8px',
              color: counts.due > 0 ? 'white' : 'var(--text-primary)',
            }}
          >
            {counts.due}
          </div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.78rem',
              color: counts.due > 0 ? 'rgba(255,255,255,.78)' : 'var(--text-muted)',
            }}
          >
            {counts.due > 0 ? 'Urgent memory reinforcement' : 'Zero backlog pending'}
          </div>
        </div>

        {/* Active Streak */}
        <div className="glass-card-thick">
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              marginBottom: '12px',
            }}
          >
            Active streak
          </div>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '3rem',
              fontWeight: 900,
              lineHeight: 1,
              marginBottom: '8px',
            }}
          >
            {user.streakCount} <span style={{ fontSize: '1.4rem' }}>Days</span>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Consistency rate maintained
          </div>
        </div>

        {/* Mastery Tier */}
        <div className="glass-card-thick">
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              marginBottom: '12px',
            }}
          >
            Retention level
          </div>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '3rem',
              fontWeight: 900,
              lineHeight: 1,
              marginBottom: '8px',
            }}
          >
            Lvl {user.level}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            {user.currentXP} / {user.nextLevelXP} XP ({user.progress}%)
          </div>
        </div>
      </div>

      {/* Middle Row: 7-Day Consistency Grid & Difficulty Breakdown */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '24px',
        }}
      >
        {/* 7-Day Consistency Grid */}
        <div className="glass-card-thick">
          <div style={{ marginBottom: '18px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>7-Day Consistency Grid</h3>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Your problem-solving activity this week
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '10px',
              textAlign: 'center',
            }}
          >
            {weeklyActivity.map(day => (
              <div
                key={day.date}
                style={{
                  padding: '14px 6px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  backgroundColor: day.solved ? 'var(--brand)' : 'var(--surface-soft)',
                  color: day.solved ? 'var(--brand-contrast)' : 'var(--text-secondary)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', letterSpacing: '0.05em' }}>
                  {day.dayName}
                </span>
                <span style={{ fontSize: '1.2rem', fontWeight: 900 }}>
                  {day.solved ? '●' : '○'}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>
                  {day.count} {day.count === 1 ? 'prob' : 'probs'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Difficulty Distribution */}
        <div className="glass-card-thick">
          <div style={{ marginBottom: '18px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Difficulty Distribution</h3>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Problems grouped by difficulty
            </p>
          </div>

          {counts.total > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Stacked Monochrome Meter */}
              <div
                style={{
                  width: '100%',
                  height: '16px',
                  border: '2px solid var(--border-color)',
                  display: 'flex',
                  backgroundColor: 'var(--surface)',
                }}
              >
                <div
                  style={{
                    width: `${(difficultyBreakdown.Easy / counts.total) * 100}%`,
                    backgroundColor: 'var(--success)',
                    borderRight: '1px solid var(--surface)',
                  }}
                  title={`Easy: ${difficultyBreakdown.Easy}`}
                />
                <div
                  style={{
                    width: `${(difficultyBreakdown.Medium / counts.total) * 100}%`,
                    backgroundColor: 'var(--warning)',
                    borderRight: '1px solid var(--surface)',
                  }}
                  title={`Medium: ${difficultyBreakdown.Medium}`}
                />
                <div
                  style={{
                    width: `${(difficultyBreakdown.Hard / counts.total) * 100}%`,
                    backgroundColor: 'var(--brand)',
                  }}
                  title={`Hard: ${difficultyBreakdown.Hard}`}
                />
              </div>

              {/* Monospace Legend */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--success)' }} />
                  <span>EASY: <strong>{difficultyBreakdown.Easy}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--warning)' }} />
                  <span>MEDIUM: <strong>{difficultyBreakdown.Medium}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--danger)' }} />
                  <span>HARD: <strong>{difficultyBreakdown.Hard}</strong></span>
                </div>
              </div>

              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.78rem',
                  padding: '10px 14px',
                  backgroundColor: 'var(--surface-soft)',
                  border: '1px solid var(--border-light)',
                  color: 'var(--text-secondary)',
                }}
              >
                MASTERY RATIO: <strong>{masteryPercentage}%</strong> of completed problems have reached stable recall.
              </div>
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              No problems logged yet.
            </p>
          )}
        </div>
      </div>

      {/* Reflections & Takeaways */}
      <div className="glass-card-thick">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            borderBottom: '1px solid var(--border-color)',
            paddingBottom: '14px',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Recent Notes & Reflections</h3>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              CRITICAL GOTCHAS CAPTURED DURING SOLVES
            </p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onNavigateToProblems}>
            <span>View All Problems</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {recentReflections.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {recentReflections.map(r => (
              <div
                key={r.id}
                style={{
                  padding: '16px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--surface)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '8px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontWeight: 800, fontSize: '1rem', fontFamily: 'var(--font-display)' }}>
                      {r.title}
                    </span>
                    <span className="badge badge-medium">{r.topic}</span>
                    <span className={`badge badge-${r.difficulty.toLowerCase()}`}>
                      {r.difficulty}
                    </span>
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {new Date(r.date).toISOString().slice(0, 10)}
                  </span>
                </div>
                <p style={{ fontStyle: 'italic', color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.5 }}>
                  "{r.notes}"
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '24px 0', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
            [ NO REFLECTIONS RECORDED YET ]
          </p>
        )}
      </div>
    </div>
  );
};
