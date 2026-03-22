import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import Claims from './pages/Claims';
import Dashboard from './pages/Dashboard';
import Entities from './pages/Entities';
import Settings from './pages/Settings';
import Team from './pages/Team';

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/claims" element={<Claims />} />
          <Route path="/entities" element={<Entities />} />
          <Route path="/team" element={<Team />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
