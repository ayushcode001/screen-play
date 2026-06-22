import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { DocumentProvider } from './context/DocumentContext.jsx';

/**
 * AuthedDocumentProvider
 * Reads the authenticated uid from AuthContext and passes it into
 * DocumentProvider so Firestore reads/writes are scoped to the right user.
 * When uid changes (sign-in / sign-out), DocumentProvider re-mounts with a
 * new key, which resets all document state — preventing data leakage.
 */
function AuthedDocumentProvider({ children }) {
  const { user } = useAuth();
  const uid = user?.uid ?? null;
  return (
    // key={uid} forces a full remount on user change → clears all doc state
    <DocumentProvider key={uid} uid={uid}>
      {children}
    </DocumentProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <AuthedDocumentProvider>
        <App />
      </AuthedDocumentProvider>
    </AuthProvider>
  </React.StrictMode>
);
