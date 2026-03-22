import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';

// Lazy load pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Claims = lazy(() => import('./pages/Claims'));
const Entities = lazy(() => import('./pages/Entities'));
const Team = lazy(() => import('./pages/Team'));
const Settings = lazy(() => import('./pages/Settings'));

function App() {
  return (
    <Router basename="/PettyBox">
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="claims" element={<Claims />} />
            <Route path="entities" element={<Entities />} />
            <Route path="team" element={<Team />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
