import React from 'react';
import pagepath from './PagePaths/pagePath';
import { Routes, Route } from 'react-router';
import Login from './Pages/Login';
import Register from './Pages/Register'; 
import LandingPage from './Pages/LandingPage';
import AddProductForm from './Components/AddProduct';
function App() {
  return (
      <Routes>
        <Route path={pagepath.home} element={<LandingPage />} />
        <Route path={pagepath.login} element={<Login />} />
        <Route path={pagepath.register} element={<Register />} />
        <Route path={pagepath.addProduct} element={<AddProductForm/>} />

      </Routes>
  );
}

export default App;