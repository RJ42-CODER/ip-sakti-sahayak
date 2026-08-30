import React from 'react'

export default function App() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <header style={{ maxWidth: '700px' }}>
        <span style={{
          fontSize: '0.85rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: '#10b981',
          background: 'rgba(16, 185, 129, 0.1)',
          padding: '0.35rem 0.85rem',
          borderRadius: '9999px',
          display: 'inline-block',
          marginBottom: '1rem'
        }}>
          SIH 2026 — Ministry of Ayush (SIH26045)
        </span>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1rem', background: 'linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          IP-SAKTI Sahayak
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '2rem' }}>
          Multilingual RAG-based AI assistant providing strict legal & intellectual property guidance for Ayurvedic products with statutory source citations.
        </p>
        <div style={{
          padding: '1.5rem',
          backgroundColor: '#1e293b',
          borderRadius: '12px',
          border: '1px solid #334155',
          textAlign: 'left'
        }}>
          <h3 style={{ color: '#f8fafc', fontSize: '1rem', marginBottom: '0.5rem' }}>System Status</h3>
          <p style={{ color: '#10b981', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }}></span>
            Skeleton Application Ready — Awaiting Document Ingestion Pipeline Setup
          </p>
        </div>
      </header>
    </div>
  )
}
