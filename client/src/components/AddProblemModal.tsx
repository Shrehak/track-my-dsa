import React, { useState } from 'react';
import { api } from '../services/api';
import { Difficulty } from '../types';
import { useAuth } from '../context/AuthContext';
import { X } from 'lucide-react';

interface AddProblemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProblemAdded: () => void;
}

export const AddProblemModal: React.FC<AddProblemModalProps> = ({
  isOpen,
  onClose,
  onProblemAdded,
}) => {
  const { updateUserStats } = useAuth();
  const [title, setTitle] = useState<string>('');
  const [topic, setTopic] = useState<string>('Arrays');
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
  const [url, setUrl] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [confidence, setConfidence] = useState<number>(3);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  const topicsList = [
    'Arrays',
    'Strings',
    'Trees',
    'Graphs',
    'DP',
    'Math',
    'LinkedList',
    'Binary Search',
    'Heap',
    'Backtracking',
    'Trie',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Problem title is required');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await api.createProblem({
        title: title.trim(),
        topic,
        difficulty,
        url: url.trim() || undefined,
        notes: notes.trim() || undefined,
        confidence,
      });

      updateUserStats(res.userStats);
      onProblemAdded();
      onClose();

      setTitle('');
      setUrl('');
      setNotes('');
      setConfidence(3);
    } catch (err: any) {
      setError(err.message || 'Failed to log problem');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div
          style={{
            padding: '20px 28px',
            borderBottom: '2px solid #000000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#F5F5F5',
          }}
        >
          <div>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
              }}
            >
              [ LOG QUESTION ]
            </span>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, marginTop: '2px' }}>
              Add Solved Problem
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#000000',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {error && (
            <div
              style={{
                padding: '10px 14px',
                backgroundColor: '#000000',
                color: '#FFFFFF',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.82rem',
              }}
            >
              [ ERROR: {error} ]
            </div>
          )}

          {/* Title */}
          <div>
            <label
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.78rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: '6px',
              }}
            >
              Problem Title *
            </label>
            <input
              type="text"
              required
              className="input-field"
              placeholder="e.g. Trapping Rain Water, Course Schedule"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>

          {/* Topic & Difficulty */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.78rem',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  display: 'block',
                  marginBottom: '6px',
                }}
              >
                Topic Domain
              </label>
              <select
                className="input-field"
                value={topic}
                onChange={e => setTopic(e.target.value)}
              >
                {topicsList.map(t => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.78rem',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  display: 'block',
                  marginBottom: '6px',
                }}
              >
                Difficulty
              </label>
              <select
                className="input-field"
                value={difficulty}
                onChange={e => setDifficulty(e.target.value as Difficulty)}
              >
                <option value="Easy">Easy (+10 XP)</option>
                <option value="Medium">Medium (+25 XP)</option>
                <option value="Hard">Hard (+45 XP)</option>
              </select>
            </div>
          </div>

          {/* LeetCode URL */}
          <div>
            <label
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.78rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: '6px',
              }}
            >
              Problem URL (Optional)
            </label>
            <input
              type="url"
              className="input-field"
              placeholder="https://leetcode.com/problems/..."
              value={url}
              onChange={e => setUrl(e.target.value)}
            />
          </div>

          {/* Confidence Rating Buttons */}
          <div>
            <label
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.78rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: '8px',
              }}
            >
              Self-Reported Confidence (1 to 5):
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[1, 2, 3, 4, 5].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setConfidence(val)}
                  style={{
                    flex: 1,
                    padding: '8px 0',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    border: '2px solid #000000',
                    backgroundColor: confidence === val ? '#000000' : '#FFFFFF',
                    color: confidence === val ? '#FFFFFF' : '#000000',
                    cursor: 'pointer',
                  }}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.78rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: '6px',
              }}
            >
              Confusion Notes & Algorithmic Invariants
            </label>
            <textarea
              rows={3}
              className="input-field"
              placeholder="Key edge cases, recurrence relation, or complexity gotchas..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? '[ SAVING... ]' : '[ ADD TO REPOSITORY ]'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
