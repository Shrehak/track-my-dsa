import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { api } from '../services/api';
import { TopicStat, DashboardStats } from '../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export const AnalyticsView: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [topicStats, setTopicStats] = useState<TopicStat[]>([]);
  const [recommendation, setRecommendation] = useState<string>('');
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const [weakData, dashData] = await Promise.all([
          api.getWeakTopics(),
          api.getDashboardStats(),
        ]);
        setTopicStats(weakData.topicStats);
        setRecommendation(weakData.recommendation);
        setDashboardStats(dashData);
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading || !dashboardStats) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px', fontFamily: 'var(--font-mono)' }}>
        <p style={{ letterSpacing: '0.1em' }}>[ GENERATING TOPIC AUDIT & RETENTION GRAPHS... ]</p>
      </div>
    );
  }

  // Pure Monochrome Bar Chart
  const barChartData = {
    labels: topicStats.map(t => t.topic),
    datasets: [
      {
        label: 'Total Solved',
        data: topicStats.map(t => t.totalProblems),
        backgroundColor: '#000000',
        borderColor: '#000000',
        borderWidth: 1,
        borderRadius: 0,
      },
      {
        label: 'Mastered',
        data: topicStats.map(t => t.masteredCount),
        backgroundColor: '#A3A3A3',
        borderColor: '#000000',
        borderWidth: 1,
        borderRadius: 0,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#000000',
          font: { family: 'JetBrains Mono', size: 11 },
        },
      },
    },
    scales: {
      x: {
        grid: { color: '#E5E5E5' },
        ticks: { color: '#000000', font: { family: 'JetBrains Mono', size: 10 } },
      },
      y: {
        grid: { color: '#E5E5E5' },
        ticks: { color: '#000000', font: { family: 'JetBrains Mono', size: 10 }, stepSize: 1 },
      },
    },
  };

  // Pure Monochrome Doughnut Chart
  const doughnutData = {
    labels: ['Easy', 'Medium', 'Hard'],
    datasets: [
      {
        data: [
          dashboardStats.difficultyBreakdown.Easy,
          dashboardStats.difficultyBreakdown.Medium,
          dashboardStats.difficultyBreakdown.Hard,
        ],
        backgroundColor: ['#E5E5E5', '#737373', '#000000'],
        borderColor: '#000000',
        borderWidth: 2,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#000000',
          font: { family: 'JetBrains Mono', size: 11 },
        },
      },
    },
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header */}
      <div style={{ borderBottom: '2px solid #000000', paddingBottom: '16px' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 900 }}>Analytics & Topic Diagnostics</h2>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
          COGNITIVE RETENTION AUDIT & TOPIC MASTERY METRICS
        </p>
      </div>

      {/* Algorithmic Diagnostic Box */}
      <div
        className="glass-card-thick"
        style={{
          borderLeft: '8px solid #000000',
          backgroundColor: '#F5F5F5',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.74rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            display: 'block',
            marginBottom: '4px',
          }}
        >
          [ Algorithmic Diagnostic Assessment ]
        </span>
        <h4 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '6px' }}>
          Intervention Advice
        </h4>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {recommendation}
        </p>
      </div>

      {/* Charts Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '24px',
        }}
      >
        {/* Topic Problem Counts & Mastery */}
        <div className="glass-card-thick">
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '16px' }}>
            Topic Distribution (Total vs Mastered)
          </h3>
          <div style={{ minHeight: '260px' }}>
            {topicStats.length > 0 ? (
              <Bar data={barChartData} options={barChartOptions} />
            ) : (
              <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textAlign: 'center', paddingTop: '40px' }}>
                [ NO DATA ]
              </p>
            )}
          </div>
        </div>

        {/* Difficulty Breakdown */}
        <div className="glass-card-thick">
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '16px' }}>
            Difficulty Composition
          </h3>
          <div style={{ maxWidth: '280px', margin: '0 auto', minHeight: '260px', display: 'flex', alignItems: 'center' }}>
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* Detailed Diagnostic Table */}
      <div className="glass-card-thick" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '2px solid #000000', backgroundColor: '#F5F5F5' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Topic Mastery Diagnostic Breakdown</h3>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            SCORE = 50% CONFIDENCE + 35% MASTERY RATIO - 15% OVERDUE PENALTY
          </p>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr
                style={{
                  borderBottom: '2px solid #000000',
                  backgroundColor: '#FFFFFF',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.74rem',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                <th style={{ padding: '12px 20px' }}>Topic</th>
                <th style={{ padding: '12px 16px' }}>Total Solved</th>
                <th style={{ padding: '12px 16px' }}>Mastered</th>
                <th style={{ padding: '12px 16px' }}>Avg Confidence</th>
                <th style={{ padding: '12px 16px' }}>Mastery Score</th>
                <th style={{ padding: '12px 20px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {topicStats.map(t => (
                <tr key={t.topic} style={{ borderBottom: '1px solid #000000' }}>
                  <td style={{ padding: '14px 20px', fontWeight: 800, fontFamily: 'var(--font-display)', fontSize: '1rem' }}>
                    {t.topic}
                  </td>
                  <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)' }}>
                    {t.totalProblems}
                  </td>
                  <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                    {t.masteredCount}
                  </td>
                  <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)' }}>
                    {t.avgConfidence} / 5.0
                  </td>
                  <td style={{ padding: '14px 16px', fontFamily: 'var(--font-mono)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div
                        style={{
                          width: '80px',
                          height: '8px',
                          border: '1px solid #000000',
                          backgroundColor: '#FFFFFF',
                        }}
                      >
                        <div
                          style={{
                            width: `${t.masteryScore}%`,
                            height: '100%',
                            backgroundColor: '#000000',
                          }}
                        />
                      </div>
                      <span style={{ fontWeight: 800 }}>{t.masteryScore}%</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    {t.isWeak ? (
                      <span className="badge badge-due">
                        [ WEAK AREA ]
                      </span>
                    ) : (
                      <span className="badge badge-easy">
                        [ RETAINED ]
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
