import React, { useState } from 'react';

const ProductSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);

  const handleSearch = async () => {
    const response = await fetch(`http://localhost:8080/search?searchTerm=${searchTerm}`);
    const result = await response.json();
    setProducts(result);
  };

  return (
    <div>
      <h1>Product Search</h1>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search products"
      />
      <button onClick={handleSearch}>Search</button>

      <div>
        <h2>Search Results</h2>
        <ul>
          {products.map((product) => (
            <li key={product.id}>
              {product.name} - {product.category} - ₹{product.mrp}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ProductSearch;
