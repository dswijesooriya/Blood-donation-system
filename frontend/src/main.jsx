// Import React library (needed for JSX)
import React from 'react';
// Import ReactDOM to render the React app into the browser
import ReactDOM from 'react-dom/client';
// Import the root App component
import App from './App.jsx';
// Import global CSS styles applied to the whole app
import './index.css';

// Find the #root div in index.html and render the App into it
ReactDOM.createRoot(document.getElementById('root')).render(
  <App />  
);