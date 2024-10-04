import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Products = () => {
  const [products, setProducts] = useState({ primary: [], similar: [] });
  const [currentPagePrimary, setCurrentPagePrimary] = useState(1); // Pagination for primary products
  const [currentPageSimilar, setCurrentPageSimilar] = useState(1); // Pagination for similar products
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [flag, setFlag] = useState();
  const [filters, setFilters] = useState({
    category: '',
    discount: '',
    stock: '',
    mrp: ''
  });
  const itemsPerPage = 10;

  const navigate = useNavigate();

  const isAuth = (sessionKey) => {
    fetch('http://127.0.0.1:8080/api/isauth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: sessionKey })
    })
      .then(response => response.json())
      .then(data => {
        if (!data.success) {
          navigate("/login");
        }
      })
      .catch(error => {
        console.error('Error:', error);
        setError('An error occurred in session auth.');
      });
  };

  useEffect(() => {
    isAuth(localStorage.getItem('sessionKey'));
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:8080/search2?searchTerm=${searchQuery}`);
        setProducts(response.data);
      } catch (error) {
        setError('Error fetching products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [flag]);

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const applyFilters = (product) => {
    return (
      (filters.category ? product.category.toLowerCase() === filters.category.toLowerCase() : true) &&
      (filters.discount ? product.discount >= parseFloat(filters.discount) : true) &&
      (filters.stock ? product.stock >= parseInt(filters.stock) : true) &&
      (filters.mrp ? product.mrp <= parseFloat(filters.mrp) : true)
    );
  };

  const filteredSimilarProducts = products.similar.filter(applyFilters);

  // Pagination logic for matched products
  const indexOfLastPrimary = currentPagePrimary * itemsPerPage;
  const indexOfFirstPrimary = indexOfLastPrimary - itemsPerPage;
  const currentPrimaryProducts = products.primary.slice(indexOfFirstPrimary, indexOfLastPrimary);
  const totalPagesPrimary = Math.ceil(products.primary.length / itemsPerPage);

  // Pagination logic for similar products
  const indexOfLastSimilar = currentPageSimilar * itemsPerPage;
  const indexOfFirstSimilar = indexOfLastSimilar - itemsPerPage;
  const currentSimilarProducts = filteredSimilarProducts.slice(indexOfFirstSimilar, indexOfLastSimilar);
  const totalPagesSimilar = Math.ceil(filteredSimilarProducts.length / itemsPerPage);

  const paginatePrimary = (pageNumber) => setCurrentPagePrimary(pageNumber);
  const paginateSimilar = (pageNumber) => setCurrentPageSimilar(pageNumber);

  const handleNextPrimary = () => {
    if (currentPagePrimary < totalPagesPrimary) {
      setCurrentPagePrimary(currentPagePrimary + 1);
    }
  };
  const handlePrevPrimary = () => {
    if (currentPagePrimary > 1) {
      setCurrentPagePrimary(currentPagePrimary - 1);
    }
  };

  const handleNextSimilar = () => {
    if (currentPageSimilar < totalPagesSimilar) {
      setCurrentPageSimilar(currentPageSimilar + 1);
    }
  };
  const handlePrevSimilar = () => {
    if (currentPageSimilar > 1) {
      setCurrentPageSimilar(currentPageSimilar - 1);
    }
  };

  const generatePagination = (totalPages, currentPage, paginate, handleNext, handlePrev) => {
    const pageNumbers = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      const startPage = Math.max(currentPage - 2, 1);
      const endPage = Math.min(currentPage + 2, totalPages);

      if (startPage > 1) pageNumbers.push(1);
      if (startPage > 2) pageNumbers.push('...');

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      if (endPage < totalPages - 1) pageNumbers.push('...');
      if (endPage < totalPages) pageNumbers.push(totalPages);
    }

    return (
      <div className="flex justify-center mt-4">
        <button onClick={handlePrev} disabled={currentPage === 1} className="px-4 py-2 mx-1 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md">Previous</button>
        {pageNumbers.map((number, index) => (
          <button key={index} onClick={() => paginate(number)} className={`px-4 py-2 mx-1 ${currentPage === number ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-800'} rounded-md`}>
            {number}
          </button>
        ))}
        <button onClick={handleNext} disabled={currentPage === totalPages} className="px-4 py-2 mx-1 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md">Next</button>
      </div>
    );
  };

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div>
      {/* Navbar */}
      <nav className="bg-gray-800 p-4 mb-4">
        <div className="flex justify-between items-center">
          <div className="text-white text-2xl font-bold">All Products</div>
          <div className="mx-auto w-full max-w-md px-4"> {/* Set a max width for the search bar */}
            <label htmlFor="default-search" className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">
              Search
            </label>
            <div className="relative">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); }}
                id="default-search"
                className="block w-full p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="Search products..."
                required
              />
              <button
                type="button"
                onClick={() => { setFlag(searchQuery); }}
                className="text-white absolute right-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </nav>

{/* Matching Products Section */}
<div>
  {products.primary.length > 0 ? (
    <div>
      <h2 className="text-xl font-bold mb-2">Matching Results</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Display unique primary products */}
        {Array.from(new Set(currentPrimaryProducts.map(product => product.id))) // Filter unique IDs
          .map(id => {
            const product = products.primary.find(p => p.id === id);
            return (
              <div key={product.id} className="bg-white rounded-lg shadow-md p-4">
                <h3 className="text-lg font-bold mb-2">{product.name}</h3>
                <p className="text-gray-600">Category: {product.category}</p>
                <p className="text-gray-600">Description: {product.description}</p>
                <p className="text-gray-600">MRP: ₹{product.mrp}</p>
                <p className="text-gray-600">Stock: {product.stock}</p>
                <p className="text-gray-600">Discount: {product.discount}%</p>
              </div>
            );
          })}
      </div>
      {generatePagination(totalPagesPrimary, currentPagePrimary, paginatePrimary, handleNextPrimary, handlePrevPrimary)}
    </div>
  ) : (
    <div className="text-gray-600">No Matching Results</div>
  )}
</div>

{/* Similar Products Section */}
<div className="mt-8">
  <h2 className="text-xl font-bold mb-2">Similar Products</h2>
  {filteredSimilarProducts.length > 0 ? (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from(new Set(currentSimilarProducts)) // Use Set to remove duplicate similar products by ID
          .filter(similarProduct =>
            !products.primary.some(primaryProduct => primaryProduct.id === similarProduct.id) // Filter out already matched products
          ).filter((product, index, self) => 
            index === self.findIndex((p) => p.id === product.id)
          )
          .map(product => (
            <div key={product.id} className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-lg font-bold mb-2">{product.name}</h3>
              <p className="text-gray-600">Category: {product.category}</p>
              <p className="text-gray-600">Description: {product.description}</p>
              <p className="text-gray-600">MRP: ₹{product.mrp}</p>
              <p className="text-gray-600">Stock: {product.stock}</p>
              <p className="text-gray-600">Discount: {product.discount}%</p>
            </div>
        ))}
      </div>
      {generatePagination(totalPagesSimilar, currentPageSimilar, paginateSimilar, handleNextSimilar, handlePrevSimilar)}
    </div>
  ) : (
    <div className="text-gray-600">No Similar Products Available</div>
  )}
</div>

 </div>
    
  );
};

export default Products;

