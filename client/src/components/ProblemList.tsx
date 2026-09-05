import React, { useState, useEffect } from 'react';
import { Problem } from '../types';
import { api } from '../services/api';
import {
  Search,
  Plus,
  ExternalLink,
  Trash2,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface ProblemListProps {
  onOpenAddModal: () => void;
  onSelectReviewProblem?: (p: Problem) => void;
}

export const ProblemList: React.FC<ProblemListProps> = ({ onOpenAddModal }) => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [topic, setTopic] = useState<string>('All');
  const [difficulty, setDifficulty] = useState<string>('All');
  const [status, setStatus] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  const topicsList = [
    'All',
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
  ];

  const fetchProblems = async () => {
    setLoading(true);
    try {
      const data = await api.getProblems({
        page,
        limit: 10,
        search: search.trim() || undefined,
        topic: topic !== 'All' ? topic : undefined,
        difficulty: difficulty !== 'All' ? difficulty : undefined,
        status: status !== 'All' ? status : undefined,
        sortBy,
        order,
      });

      setProblems(data.problems);
      setTotalPages(data.pagination.totalPages);
      setTotalCount(data.pagination.total);
    } catch (err) {
      console.error('Failed to load problems:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, [page, topic, difficulty, status, sortBy, order]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchProblems();
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Delete problem "${title}" from repository?`)) return;
    try {
      await api.deleteProblem(id);
      fetchProblems();
    } catch (err) {
      console.error('Failed to delete problem:', err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header and Add Action */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          borderBottom: '2px solid #000000',
          paddingBottom: '16px',
          flexWrap: 'wrap',
          gap: '14px',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900 }}>Problem Repository</h2>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            INDEX OF {totalCount} TOTAL QUESTIONS LOGGED
          </p>
        </div>

        <button className="btn btn-primary" onClick={onOpenAddModal}>
          <Plus size={14} />
          <span>Add Problem</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="glass-card-thick"
        style={{
          padding: '16px 20px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Search */}
        <form
          onSubmit={handleSearchSubmit}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 240px' }}
        >
          <div style={{ position: 'relative', width: '100%' }}>
            <Search
              size={16}
              color="var(--text-muted)"
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              className="input-field"
              placeholder="Search title, notes..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: '36px', height: '38px', fontSize: '0.82rem' }}
            />
          </div>
          <button type="submit" className="btn btn-secondary btn-sm" style={{ height: '38px' }}>
            Search
          </button>
        </form>

        {/* Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <select
            className="input-field"
            value={topic}
            onChange={e => {
              setTopic(e.target.value);
              setPage(1);
            }}
            style={{ width: 'auto', padding: '6px 12px', fontSize: '0.8rem', height: '38px' }}
          >
            {topicsList.map(t => (
              <option key={t} value={t}>
                {t === 'All' ? 'All Topics' : t}
              </option>
            ))}
          </select>

          <select
            className="input-field"
            value={difficulty}
            onChange={e => {
              setDifficulty(e.target.value);
              setPage(1);
            }}
            style={{ width: 'auto', padding: '6px 12px', fontSize: '0.8rem', height: '38px' }}
          >
            <option value="All">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          <select
            className="input-field"
            value={status}
            onChange={e => {
              setStatus(e.target.value);
              setPage(1);
            }}
            style={{ width: 'auto', padding: '6px 12px', fontSize: '0.8rem', height: '38px' }}
          >
            <option value="All">All Statuses</option>
            <option value="DUE">Due Today</option>
            <option value="LEARNING">Learning</option>
            <option value="MASTERED">Mastered</option>
          </select>

          <select
            className="input-field"
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            style={{ width: 'auto', padding: '6px 12px', fontSize: '0.8rem', height: '38px' }}
          >
            <option value="createdAt">Sort: Added</option>
            <option value="nextRevisionDate">Sort: Due Date</option>
            <option value="confidence">Sort: Confidence</option>
            <option value="interval">Sort: Interval</option>
          </select>

          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))}
            title="Toggle sort order"
            style={{ height: '38px', padding: '0 12px' }}
          >
            <ArrowUpDown size={14} />
          </button>
        </div>
      </div>

      {/* Problems Table */}
      <div className="glass-card-thick" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr
                style={{
                  borderBottom: '2px solid #000000',
                  backgroundColor: '#F5F5F5',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.74rem',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                <th style={{ padding: '14px 20px' }}>Problem Title</th>
                <th style={{ padding: '14px 16px' }}>Topic</th>
                <th style={{ padding: '14px 16px' }}>Difficulty</th>
                <th style={{ padding: '14px 16px' }}>Confidence</th>
                <th style={{ padding: '14px 16px' }}>Next Revision</th>
                <th style={{ padding: '14px 16px' }}>Status</th>
                <th style={{ padding: '14px 20px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ padding: '48px', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                    [ QUERYING DATABASE... ]
                  </td>
                </tr>
              ) : problems.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '48px', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                    [ NO MATCHING PROBLEMS FOUND ]
                  </td>
                </tr>
              ) : (
                problems.map(p => {
                  const isDue = new Date(p.nextRevisionDate).getTime() <= Date.now();
                  return (
                    <tr
                      key={p.id}
                      style={{
                        borderBottom: '1px solid #000000',
                      }}
                    >
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontWeight: 800, fontSize: '0.98rem', fontFamily: 'var(--font-display)' }}>
                              {p.title}
                            </span>
                            {p.url && (
                              <a
                                href={p.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: '#000000' }}
                                title="Open URL"
                              >
                                <ExternalLink size={13} />
                              </a>
                            )}
                          </div>
                          {p.notes && (
                            <span
                              style={{
                                fontSize: '0.82rem',
                                color: 'var(--text-muted)',
                                fontStyle: 'italic',
                                maxWidth: '340px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {p.notes}
                            </span>
                          )}
                        </div>
                      </td>

                      <td style={{ padding: '16px 16px' }}>
                        <span className="badge badge-medium">
                          {p.topic}
                        </span>
                      </td>

                      <td style={{ padding: '16px 16px' }}>
                        <span className={`badge badge-${p.difficulty.toLowerCase()}`}>
                          {p.difficulty}
                        </span>
                      </td>

                      <td style={{ padding: '16px 16px', fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>
                        <span>
                          {'●'.repeat(p.confidence)}
                          {'○'.repeat(5 - p.confidence)}
                        </span>
                        <span style={{ marginLeft: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          ({p.confidence}/5)
                        </span>
                      </td>

                      <td style={{ padding: '16px 16px', fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>
                        <span style={{ fontWeight: isDue ? 800 : 500, textDecoration: isDue ? 'underline' : 'none' }}>
                          {new Date(p.nextRevisionDate).toISOString().slice(0, 10)}
                        </span>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          Int: {p.interval}d
                        </div>
                      </td>

                      <td style={{ padding: '16px 16px' }}>
                        {isDue ? (
                          <span className="badge badge-due">[ DUE TODAY ]</span>
                        ) : p.status === 'MASTERED' ? (
                          <span className="badge badge-mastered">[ MASTERED ]</span>
                        ) : (
                          <span className="badge badge-easy">[ LEARNING ]</span>
                        )}
                      </td>

                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        <button
                          onClick={() => handleDelete(p.id, p.title)}
                          title="Delete problem"
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#000000',
                            cursor: 'pointer',
                            padding: '4px',
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div
          style={{
            padding: '14px 20px',
            borderTop: '2px solid #000000',
            backgroundColor: '#F5F5F5',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.82rem',
          }}
        >
          <span>
            PAGE {page} OF {Math.max(1, totalPages)}
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="btn btn-secondary btn-sm"
            >
              <ChevronLeft size={14} />
              <span>Prev</span>
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className="btn btn-secondary btn-sm"
            >
              <span>Next</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
