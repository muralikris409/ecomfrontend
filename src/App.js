import logo from './logo.svg';
import './App.css';
import './index.css';
import Login from './Screens/Login';
import { BrowserRouter,Routes,Route } from 'react-router-dom';
import Signup from './Screens/Signup';
import Categories from './Screens/Categories';
import Products from './Screens/Products';
import AllProducts from './Screens/AllProducts';
import ProductSearch from './Screens/test';
import Products2 from './AllProducts2';
function App() {
  return (
    <BrowserRouter>
    <Routes>
      <Route  path="/login" element={<Login/>}></Route>
      <Route  path="/signup" element={<Signup/>}></Route>
      <Route index path="/" element={<Categories/>}></Route>
      <Route path="/products/:categoryId" element={<Products />} />
      <Route path="/allproducts" element={<AllProducts />} />
      <Route path="/allproducts2" element={<Products2 />} />

      <Route path="/test" element={<ProductSearch />} />

    </Routes>
    </BrowserRouter>
  );
}

export default App;
