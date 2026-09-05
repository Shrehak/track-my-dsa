import React, { useState, useEffect } from 'react';
import { Problem, ReviewResult } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ExternalLink, RotateCcw } from 'lucide-react';

interface RevisionQueueProps {
  onReviewCompleted: () => void;
}

export const RevisionQueue: React.FC<RevisionQueueProps> = ({ onReviewCompleted }) => {
  const { updateUserStats } = useAuth();
  const [backlog, setBacklog] = useState<Problem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [showNotes, setShowNotes] = useState<boolean>(false);
  const [reviewNotes, setReviewNotes] = useState<string>('');
  const [reviewing, setReviewing] = useState<boolean>(false);
  const [xpCelebration, setXpCelebration] = useState<number | null>(null);

  const fetchBacklog = async () => {
    setLoading(true);
    try {
      const data = await api.getRevisionBacklog();
      setBacklog(data.backlog);
      setCurrentIndex(0);
    } catch (err) {
      console.error('Failed to load revision queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBacklog();
  }, []);

  const currentProblem = backlog[currentIndex];

  const handleReview = async (result: ReviewResult, confidence: number) => {
    if (!currentProblem) return;
    setReviewing(true);

    try {
      const res = await api.reviewProblem(currentProblem.id, {
        result,
        confidence,
        notes: reviewNotes.trim() || undefined,
      });

      updateUserStats(res.userStats);
      setXpCelebration(res.xpEarned);

      setTimeout(() => {
        setXpCelebration(null);
        setShowNotes(false);
        setReviewNotes('');
        setBacklog(prev => prev.filter((_, idx) => idx !== currentIndex));
        onReviewCompleted();
      }, 900);
    } catch (err) {
      console.error('Failed to record review:', err);
    } finally {
      setReviewing(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px', fontFamily: 'var(--font-mono)' }}>
        <p style={{ letterSpacing: '0.1em' }}>[ LOADING REVISION DECK... ]</p>
      </div>
    );
  }

  // Queue Empty State
  if (backlog.length === 0) {
    return (
      <div
        className="glass-card-thick"
        style={{
          textAlign: 'center',
          padding: '64px 32px',
          maxWidth: '560px',
          margin: '40px auto',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8rem',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            marginBottom: '12px',
          }}
        >
          [ REVISION BACKLOG ]
        </div>
        <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '12px' }}>
          Deck Cleared.
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '28px', lineHeight: 1.6 }}>
          All due problems have been reviewed. The forgetting curve intervals have expanded for tested problems.
        </p>
        <button className="btn btn-primary" onClick={fetchBacklog}>
          <RotateCcw size={14} />
          <span>Refresh Queue</span>
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Info */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          borderBottom: '2px solid #000000',
          paddingBottom: '16px',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900 }}>Spaced Repetition Deck</h2>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            ACTIVE CARD {currentIndex + 1} OF {backlog.length} // SM-2 ALGORITHM
          </p>
        </div>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8rem',
            padding: '4px 10px',
            border: '1px solid #000000',
            backgroundColor: '#000000',
            color: '#FFFFFF',
            fontWeight: 700,
          }}
        >
          DUE FOR REVIEW
        </div>
      </div>

      {/* Main Flashcard */}
      <div
        className="glass-card-thick"
        style={{
          position: 'relative',
          padding: '36px',
          backgroundColor: '#FFFFFF',
        }}
      >
        {/* Floating XP Toast */}
        {xpCelebration && (
          <div
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              backgroundColor: '#000000',
              color: '#FFFFFF',
              fontFamily: 'var(--font-mono)',
              padding: '6px 14px',
              fontSize: '0.85rem',
              fontWeight: 700,
              border: '1px solid #000000',
            }}
          >
            [ +{xpCelebration} XP AWARDED ]
          </div>
        )}

        {/* Monospace Metadata Tags */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px', flexWrap: 'wrap' }}>
          <span className={`badge badge-${currentProblem.difficulty.toLowerCase()}`}>
            {currentProblem.difficulty}
          </span>
          <span className="badge badge-medium">
            {currentProblem.topic}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              padding: '3px 8px',
              border: '1px solid #E5E5E5',
              backgroundColor: '#F5F5F5',
            }}
          >
            INTERVAL: {currentProblem.interval}D
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              padding: '3px 8px',
              border: '1px solid #E5E5E5',
              backgroundColor: '#F5F5F5',
            }}
          >
            REPS: {currentProblem.repetitionCount}
          </span>
        </div>

        {/* Problem Title */}
        <h3
          style={{
            fontSize: '2rem',
            fontWeight: 900,
            marginBottom: '16px',
            lineHeight: 1.15,
            fontFamily: 'var(--font-display)',
          }}
        >
          {currentProblem.title}
        </h3>

        {/* External Link */}
        {currentProblem.url && (
          <div style={{ marginBottom: '24px' }}>
            <a
              href={currentProblem.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-sm"
            >
              <span>Solve on External Platform</span>
              <ExternalLink size={13} />
            </a>
          </div>
        )}

        {/* Past Notes Toggle */}
        <div style={{ margin: '20px 0' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setShowNotes(prev => !prev)}
            style={{ width: '100%', justifyContent: 'space-between' }}
          >
            <span>{showNotes ? '[ HIDE HISTORICAL NOTES ]' : '[ REVEAL HISTORICAL NOTES ]'}</span>
            <span style={{ fontFamily: 'var(--font-mono)' }}>{showNotes ? '▲' : '▼'}</span>
          </button>

          {showNotes && (
            <div
              style={{
                marginTop: '12px',
                padding: '16px',
                backgroundColor: '#F5F5F5',
                border: '1px solid #000000',
                fontSize: '0.95rem',
                fontStyle: 'italic',
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
              }}
            >
              {currentProblem.notes || 'No historical confusion notes recorded for this item.'}
            </div>
          )}
        </div>

        {/* Optional Review Reflection Input */}
        <div style={{ marginTop: '20px' }}>
          <label
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.78rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              display: 'block',
              marginBottom: '8px',
            }}
          >
            Review Observations / Gotchas:
          </label>
          <textarea
            className="input-field"
            rows={2}
            placeholder="Document key complexity, edge case, or pattern takeaway..."
            value={reviewNotes}
            onChange={e => setReviewNotes(e.target.value)}
          />
        </div>

        {/* SM-2 Outcome Action Matrix */}
        <div style={{ marginTop: '28px', borderTop: '1px solid #000000', paddingTop: '20px' }}>
          <label
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              display: 'block',
              marginBottom: '12px',
            }}
          >
            Select Recall Quality Grade (SM-2):
          </label>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '10px',
            }}
          >
            {/* 01: Again */}
            <button
              disabled={reviewing}
              className="btn btn-secondary"
              onClick={() => handleReview('AGAIN', 1)}
              style={{
                flexDirection: 'column',
                padding: '12px 6px',
                textAlign: 'center',
              }}
            >
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>[ 01 ]</span>
              <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>AGAIN</span>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Reset 1D</span>
            </button>

            {/* 02: Hard */}
            <button
              disabled={reviewing}
              className="btn btn-secondary"
              onClick={() => handleReview('HARD', 2)}
              style={{
                flexDirection: 'column',
                padding: '12px 6px',
                textAlign: 'center',
              }}
            >
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>[ 02 ]</span>
              <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>HARD</span>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>+2-3D</span>
            </button>

            {/* 03: Good */}
            <button
              disabled={reviewing}
              className="btn btn-primary"
              onClick={() => handleReview('GOOD', 4)}
              style={{
                flexDirection: 'column',
                padding: '12px 6px',
                textAlign: 'center',
              }}
            >
              <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>[ 03 ]</span>
              <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>GOOD</span>
              <span style={{ fontSize: '0.68rem', opacity: 0.8 }}>+5-8D</span>
            </button>

            {/* 04: Easy */}
            <button
              disabled={reviewing}
              className="btn btn-secondary"
              onClick={() => handleReview('EASY', 5)}
              style={{
                flexDirection: 'column',
                padding: '12px 6px',
                textAlign: 'center',
              }}
            >
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>[ 04 ]</span>
              <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>EASY</span>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>+14+D</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
