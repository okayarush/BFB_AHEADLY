import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

import GlobalErrorBoundary from './components/GlobalErrorBoundary';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <GlobalErrorBoundary>
      <App />
    </GlobalErrorBoundary>
  </React.StrictMode>
);
