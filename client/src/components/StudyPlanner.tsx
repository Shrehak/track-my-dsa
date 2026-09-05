import React, { useState } from 'react';
import { api } from '../services/api';
import { StudyPlanResponse } from '../types';
import { useAuth } from '../context/AuthContext';

export const StudyPlanner: React.FC = () => {
  const { updateUserStats } = useAuth();
  const [minutes, setMinutes] = useState<number>(45);
  const [plan, setPlan] = useState<StudyPlanResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [completedTasks, setCompletedTasks] = useState<Record<number, boolean>>({});
  const [sessionCompleted, setSessionCompleted] = useState<boolean>(false);
  const [completing, setCompleting] = useState<boolean>(false);

  const predefinedTimes = [20, 30, 45, 60, 90];

  const handleGeneratePlan = async () => {
    setLoading(true);
    setSessionCompleted(false);
    setCompletedTasks({});
    try {
      const data = await api.generatePlan(minutes);
      setPlan(data);
    } catch (err) {
      console.error('Failed to generate study plan:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = (index: number) => {
    setCompletedTasks(prev => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleCompleteSession = async () => {
    if (!plan) return;
    setCompleting(true);
    try {
      const res = await api.completePlan(plan.planId);
      setSessionCompleted(true);
      updateUserStats({ xp: res.bonusXP });
    } catch (err) {
      console.error('Failed to complete session:', err);
    } finally {
      setCompleting(false);
    }
  };

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div style={{ borderBottom: '2px solid #000000', paddingBottom: '16px' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 900 }}>Algorithmic Study Planner</h2>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
          SCHEDULE BALANCING URGENT REVISIONS AND WEAK-DOMAIN INTERVENTIONS
        </p>
      </div>

      {/* Configuration Card */}
      <div className="glass-card-thick" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <label
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            fontWeight: 700,
          }}
        >
          Select Available Practice Duration:
        </label>

        {/* Rectangular Time Pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {predefinedTimes.map(time => (
            <button
              key={time}
              type="button"
              className={`btn btn-sm ${minutes === time ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setMinutes(time)}
            >
              <span>{time} MIN</span>
            </button>
          ))}
        </div>

        {/* Custom Input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <input
            type="number"
            min={10}
            max={240}
            className="input-field"
            value={minutes}
            onChange={e => setMinutes(Math.max(10, parseInt(e.target.value) || 10))}
            style={{ maxWidth: '140px' }}
          />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>MINUTES TOTAL</span>
        </div>

        <button
          className="btn btn-primary"
          onClick={handleGeneratePlan}
          disabled={loading}
          style={{ alignSelf: 'flex-start', marginTop: '4px' }}
        >
          <span>{loading ? '[ COMPUTING SCHEDULE... ]' : '[ GENERATE SESSION PLAN ]'}</span>
        </button>
      </div>

      {/* Generated Plan Output */}
      {plan && (
        <div
          className="glass-card-thick"
          style={{
            backgroundColor: '#FFFFFF',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              borderBottom: '2px solid #000000',
              paddingBottom: '16px',
              marginBottom: '20px',
            }}
          >
            <div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', letterSpacing: '0.12em', color: 'var(--text-muted)' }}>
                [ PRESCRIPTION PLAN ID: {plan.planId.slice(0, 8)} ]
              </span>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 900, marginTop: '2px' }}>
                {plan.targetMinutes}-Minute Structured Session
              </h3>
            </div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.85rem',
                fontWeight: 700,
                border: '1px solid #000000',
                padding: '4px 10px',
                backgroundColor: '#F5F5F5',
              }}
            >
              +{plan.estimatedXP} POTENTIAL XP
            </div>
          </div>

          {/* Task List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {plan.tasks.map((task, index) => {
              const isChecked = !!completedTasks[index];
              return (
                <div
                  key={index}
                  onClick={() => toggleTask(index)}
                  style={{
                    padding: '16px',
                    border: '1px solid #000000',
                    backgroundColor: isChecked ? '#F5F5F5' : '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div
                      style={{
                        width: '20px',
                        height: '20px',
                        border: '2px solid #000000',
                        backgroundColor: isChecked ? '#000000' : '#FFFFFF',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 900,
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {isChecked ? 'X' : ''}
                    </div>

                    <div>
                      <div
                        style={{
                          fontWeight: 800,
                          fontSize: '1rem',
                          fontFamily: 'var(--font-display)',
                          textDecoration: isChecked ? 'line-through' : 'none',
                          color: isChecked ? 'var(--text-muted)' : 'var(--text-primary)',
                        }}
                      >
                        {task.title}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                        <span className={`badge badge-${task.difficulty.toLowerCase()}`}>
                          {task.difficulty}
                        </span>
                        <span className="badge badge-medium">
                          {task.topic}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                    }}
                  >
                    ~{task.estimatedMinutes}M
                  </div>
                </div>
              );
            })}
          </div>

          {/* Completion Action */}
          <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '2px solid #000000' }}>
            {sessionCompleted ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '16px',
                  backgroundColor: '#000000',
                  color: '#FFFFFF',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                }}
              >
                [ SESSION COMPLETED // +25 BONUS XP RECORDED ]
              </div>
            ) : (
              <button
                className="btn btn-primary"
                onClick={handleCompleteSession}
                disabled={completing}
                style={{ width: '100%', padding: '14px' }}
              >
                <span>
                  {completing
                    ? '[ RECORDING COMPLETION... ]'
                    : '[ COMPLETE SESSION & CLAIM +25 XP BONUS ]'}
                </span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
