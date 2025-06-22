import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import AddItemPage from './pages/AddItemPage';
import ViewItemsPage from './pages/ViewItemsPage';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<AddItemPage />} />
          <Route path="/view-items" element={<ViewItemsPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
