import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import VisitedGlobe from './VisitedGlobe';
import AdminPanel from './AdminPanel';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<VisitedGlobe />} />
                <Route path="/admin" element={<AdminPanel />} />
            </Routes>
        </Router>
    );
}
export default App;