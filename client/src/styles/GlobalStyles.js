import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    font-size: 16px;
    scroll-behavior: smooth;
  }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    line-height: 1.6;
    color: #2d3748;
    background: #f7fafc;
    overflow-x: hidden;
  }

  /* Custom scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb {
    background: rgba(102, 126, 234, 0.3);
    border-radius: 4px;
    transition: background 0.2s ease;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: rgba(102, 126, 234, 0.6);
  }

  /* Leaflet map fixes */
  .leaflet-container {
    height: 100%;
    width: 100%;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  }

  .leaflet-popup-content-wrapper {
    background: transparent !important;
    box-shadow: none !important;
    padding: 0 !important;
  }

  .leaflet-popup-content {
    margin: 0 !important;
    padding: 0 !important;
    line-height: inherit !important;
  }

  .leaflet-popup-tip-container {
    display: none !important;
  }

  .leaflet-container a.leaflet-popup-close-button {
    color: #94a3b8 !important;
    padding: 10px 14px 0 0 !important;
    font-weight: bold !important;
    background: transparent !important;
    border: none !important;
  }

  .leaflet-container a.leaflet-popup-close-button:hover {
    color: white !important;
  }

  /* Chart.js canvas styling */
  canvas {
    border-radius: 8px;
  }

  /* Focus styles */
  *:focus {
    outline: 2px solid #667eea;
    outline-offset: 2px;
  }

  /* Selection styles */
  ::selection {
    background: rgba(102, 126, 234, 0.2);
    color: #2d3748;
  }

  ::-moz-selection {
    background: rgba(102, 126, 234, 0.2);
    color: #2d3748;
  }

  /* Heading styles */
  h1, h2, h3, h4, h5, h6 {
    font-weight: 600;
    line-height: 1.2;
    margin-bottom: 0.5rem;
  }

  h1 {
    font-size: 2.5rem;
    font-family: 'Space Grotesk', sans-serif;
  }

  h2 {
    font-size: 2rem;
    font-family: 'Space Grotesk', sans-serif;
  }

  h3 {
    font-size: 1.5rem;
  }

  h4 {
    font-size: 1.25rem;
  }

  h5 {
    font-size: 1.125rem;
  }

  h6 {
    font-size: 1rem;
  }

  /* Link styles */
  a {
    color: #667eea;
    text-decoration: none;
    transition: color 0.2s ease;
  }

  a:hover {
    color: #5a67d8;
    text-decoration: underline;
  }

  /* Button base styles */
  button {
    font-family: inherit;
    cursor: pointer;
    border: none;
    border-radius: 8px;
    padding: 0.75rem 1.5rem;
    font-weight: 500;
    transition: all 0.2s ease;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    text-decoration: none;
    
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  /* Input base styles */
  input, select, textarea {
    font-family: inherit;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    padding: 0.75rem;
    font-size: 1rem;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
    background: white;
    
    &:focus {
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
  }

  /* Card styles */
  .card {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    }
  }

  /* Glass morphism effect */
  .glass {
    background: rgba(255, 255, 255, 0.25);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.18);
    border-radius: 12px;
  }

  /* Loading animation */
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slideInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideInDown {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-spin {
    animation: spin 1s linear infinite;
  }

  .animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  .animate-fade-in {
    animation: fadeIn 0.5s ease-in-out;
  }

  .animate-slide-up {
    animation: slideInUp 0.5s ease-out;
  }

  .animate-slide-down {
    animation: slideInDown 0.5s ease-out;
  }

  /* Utility classes */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }

  .text-gradient {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .shadow-nasa {
    box-shadow: 0 10px 25px rgba(102, 126, 234, 0.15);
  }

  .border-gradient {
    border: 2px solid transparent;
    background: linear-gradient(white, white) padding-box,
                linear-gradient(135deg, #667eea, #764ba2) border-box;
  }

  /* Responsive breakpoints */
  @media (max-width: 768px) {
    html {
      font-size: 14px;
    }
    
    .card {
      padding: 1rem;
      border-radius: 8px;
    }
    
    h1 {
      font-size: 2rem;
    }
    
    h2 {
      font-size: 1.75rem;
    }
  }

  @media (max-width: 480px) {
    html {
      font-size: 13px;
    }
    
    .card {
      padding: 0.75rem;
      border-radius: 6px;
    }
    
    h1 {
      font-size: 1.75rem;
    }
    
    h2 {
      font-size: 1.5rem;
    }
    
    button {
      padding: 0.625rem 1rem;
      font-size: 0.875rem;
    }
  }

  /* Print styles */
  @media print {
    * {
      -webkit-print-color-adjust: exact;
      color-adjust: exact;
    }
    
    body {
      background: white;
    }
    
    .no-print {
      display: none !important;
    }
    
    .card {
      box-shadow: none;
      border: 1px solid #e2e8f0;
      break-inside: avoid;
    }
  }

  /* High contrast mode */
  @media (prefers-contrast: high) {
    .card {
      border: 2px solid #2d3748;
    }
    
    button {
      border: 2px solid currentColor;
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
`;

export default GlobalStyles;
