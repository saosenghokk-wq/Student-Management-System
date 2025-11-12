import React from 'react';
import DashboardLayout from '../components/DashboardLayout';

function ComingSoon({ pageName = 'This feature' }) {
  return (
    <DashboardLayout>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center',
        padding: '40px'
      }}>
        <div style={{
          fontSize: '5rem',
          marginBottom: '24px'
        }}>
          🚧
        </div>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 800,
          color: '#1f2937',
          marginBottom: '16px'
        }}>
          Coming Soon
        </h1>
        <p style={{
          fontSize: '1.2rem',
          color: '#6b7280',
          marginBottom: '32px',
          maxWidth: '600px'
        }}>
          {pageName} is currently under development. We're working hard to bring you this feature soon!
        </p>
        <div style={{
          display: 'flex',
          gap: '12px',
          fontSize: '2rem'
        }}>
          <span>⏳</span>
          <span>🔨</span>
          <span>💻</span>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default ComingSoon;
