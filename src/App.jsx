import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Header from './components/Header';
import Toolbar from './components/Toolbar';
import Sidebar from './components/Sidebar';
import Editor from './components/Editor/Editor';
import DraftManager from './components/Modals/DraftManager';
import SignInScreen from './components/Auth/SignInScreen';
import LoadingSpinner from './components/Auth/LoadingSpinner';

export default function App() {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // ── Auth gating ───────────────────────────────────────────────────────────
  if (loading) return <LoadingSpinner />;
  if (!user)   return <SignInScreen />;

  // ── Authenticated editor shell ────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <Header
        sidebarOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(v => !v)}
      />
      <Toolbar />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {sidebarOpen && <Sidebar />}
        <Editor />
      </div>
      <DraftManager />
    </div>
  );
}
