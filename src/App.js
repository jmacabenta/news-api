import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import NewsArticle from './components/NewsArticle';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<Home />} />
        <Route path="/article" element={<NewsArticle />} />
      </Routes>
    </Router>
  );
};

export default App;
