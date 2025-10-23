import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { DataProvider } from './contexts/DataContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Survey from './pages/Survey';
import Dashboard from './pages/Dashboard';
import About from './pages/About';

const App: React.FC = () => {
  return (
    <DataProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          {/* <Navbar /> */}
          <AnimatePresence mode="wait">
            <motion.main
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex-grow"
            >
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/survey" element={<Survey />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/about" element={<About />} />
              </Routes>
            </motion.main>
          </AnimatePresence>
          <Footer />
        </div>
      </Router>
    </DataProvider>
  );
};

export default App;