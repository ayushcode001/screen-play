import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function SignInScreen() {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const handleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError('Sign-in failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', height: '100vh',
      background: 'linear-gradient(160deg, #fafafa 0%, #f0f0f0 100%)',
      fontFamily: "'Inter', sans-serif",
    }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .sign-in-card { animation: fadeUp 0.4s ease both; }
        .google-btn {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 24px; border-radius: 8px;
          border: 1.5px solid #ddd; background: #fff;
          font-size: 0.9rem; font-weight: 500; color: #222;
          cursor: pointer; transition: all 0.15s ease;
          box-shadow: 0 1px 4px rgba(0,0,0,0.06);
          font-family: 'Inter', sans-serif;
          width: 100%;
          justify-content: center;
        }
        .google-btn:hover:not(:disabled) {
          border-color: #bbb; box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          transform: translateY(-1px);
        }
        .google-btn:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>

      <div className="sign-in-card" style={{
        backgroundColor: '#fff', borderRadius: 16,
        padding: '48px 40px', width: 360, maxWidth: '90vw',
        boxShadow: '0 8px 40px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)',
        textAlign: 'center',
      }}>
        {/* Logo / Brand */}
        <div style={{ marginBottom: 8 }}>
          <span style={{ fontSize: '2rem' }}>✍️</span>
        </div>
        <h1 style={{
          fontSize: '1.7rem', fontWeight: 800, color: '#111',
          letterSpacing: '-0.01em', marginBottom: 6,
        }}>
          लेखन मंच
        </h1>
        <p style={{
          fontSize: '0.85rem', color: '#666', lineHeight: 1.5,
          marginBottom: 32, maxWidth: 260, margin: '0 auto 32px',
        }}>
          Your unified workspace for Hindi Screenplays, Nataks &amp; Stories.
        </p>

        {/* Google Sign-In Button */}
        <button className="google-btn" onClick={handleSignIn} disabled={loading}>
          {loading ? (
            <>
              <div style={{
                width: 18, height: 18, borderRadius: '50%',
                border: '2px solid #ddd', borderTopColor: '#333',
                animation: 'spin 0.7s linear infinite', flexShrink: 0,
              }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
              Signing in…
            </>
          ) : (
            <>
              {/* Google "G" SVG logo */}
              <svg width="18" height="18" viewBox="0 0 18 18" style={{ flexShrink: 0 }}>
                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
                <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"/>
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"/>
              </svg>
              Sign in with Google
            </>
          )}
        </button>

        {error && (
          <p style={{ marginTop: 16, fontSize: '0.8rem', color: '#dc2626' }}>{error}</p>
        )}

        <p style={{ marginTop: 28, fontSize: '0.72rem', color: '#aaa', lineHeight: 1.5 }}>
          Your drafts are private and securely stored in the cloud.<br />
          Sign in to start writing.
        </p>
      </div>
    </div>
  );
}
