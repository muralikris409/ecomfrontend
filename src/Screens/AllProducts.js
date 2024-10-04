import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Products = () => {
  const [products, setProducts] = useState([]); // Store fetched data
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1); // Store current page
  const [loading, setLoading] = useState(false); // To handle loading state
  const [error, setError] = useState(null); // To handle errors
  const [searchQuery, setSearchQuery] = useState(''); // State for search query
  const [elasticQuery, setElasticQuery] = useState(''); // State for search query
  const [flag, setFlag] = useState(''); // State for search query

  const [filterVisible, setFilterVisible] = useState(false); // Show filter form
  const [filters, setFilters] = useState({
    category: '',
    discount: '',
    stock: '',
    mrp: ''
  });
  const [useElasticSearch, setUseElasticSearch] = useState(false); // Toggle state for ElasticSearch

  const navigate = useNavigate();
  const itemsPerPage = 10; // Number of items per page

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
          navigate("/login"); // Redirect using navigate
        }
      })
      .catch(error => {
        console.error('Error:', error);
        setError('An error occurred in session auth.');
      });
  };

  // Fetch products data from API
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true); // Start loading
      try {
        const response = await axios.get('http://127.0.0.1:8080/api/products');
        setProducts(response.data.data); // Set fetched data to state
        setFilteredProducts(response.data.data); // Set initial filtered data
      } catch (error) {
        setError('Failed to fetch data');
      } finally {
        setLoading(false); // End loading
      }
    };

    isAuth(localStorage.getItem('sessionKey'));
    fetchProducts();
  }, []);

  // Handle search and ElasticSearch toggle
  useEffect(() => {
    const searchProducts = async () => {
      if (useElasticSearch) {
        try {
          const response = await axios.get(`http://localhost:8080/search?searchTerm=${elasticQuery}`);
          setFilteredProducts(response.data);
        } catch (err) {
          console.error("Elasticsearch error:", err.response || err.message); // Log the actual error


        }
      } else {
        const filtered = products.filter(product =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredProducts(filtered);
      }
      setCurrentPage(1); // Reset to first page when search changes
    };
    searchProducts();
  }, [searchQuery, products, flag,useElasticSearch]);

  // Handle filter input change
  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  // Apply filters
  const applyFilters = (product) => {
    const productCategory = useElasticSearch
    ? product.category.toString().toLowerCase() // ElasticSearch returns category as a string
    : product.category?.category.toLowerCase(); //
    return (
      (filters.category ? productCategory.toLowerCase() === filters.category.toLowerCase() : true) &&
      (filters.discount ? product.discount >= parseFloat(filters.discount) : true) &&
      (filters.stock ? product.stock >= parseInt(filters.stock) : true) &&
      (filters.mrp ? product.mrp <= parseFloat(filters.mrp) : true)
    );
  };

  const filteredAndSearchedProducts = filteredProducts.filter(applyFilters);
  
  // Get current products for the current page after filtering
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredAndSearchedProducts.slice(indexOfFirstItem, indexOfLastItem);

  // Pagination Logic
  const totalPages = Math.ceil(filteredAndSearchedProducts.length / itemsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrev = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Generate pagination
  const generatePagination = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5; // Show 5 pages at a time

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

    return pageNumbers;
  };

  const pageNumbers = generatePagination();

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div>
      <nav className="bg-gray-800 p-4 mb-4">
        <div className="flex justify-between items-center">
          <div className="text-white text-2xl font-bold">All Products</div>
          <div className="relative w-1/3">
          {(!useElasticSearch) && <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => {
                  setSearchQuery(e.target.value)
                
              }
              }
              className="w-full p-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
            />}
                 {(useElasticSearch) && 
<div class=" mx-auto">   
    <label for="default-search" class="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label>
    <div class="relative">
        {/* <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
            <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
            </svg>
        </div> */}
        <input type="search" value={elasticQuery} 
        onChange={(e)=>{setElasticQuery(e.target.value)}}
        id="default-search" class="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Search products..." required />
        <button type="button"  onClick={(e)=>{setFlag(elasticQuery)}}
 class="text-white absolute end-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Search</button>
    </div>
</div>
}
            <svg
              className="absolute left-2 top-2 w-4 h-4 text-gray-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 20"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
              />
            </svg>
          </div>
          <label className="inline-flex relative items-center cursor-pointer">
  <input
    type="checkbox"
    className="sr-only peer"
    checked={useElasticSearch}
    onChange={() => setUseElasticSearch(!useElasticSearch)}
  />
  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer dark:bg-gray-700 peer-checked:bg-blue-600 transition-all duration-300"></div>
  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 transform peer-checked:translate-x-5"></div>
  <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">Elastic Search</span>
</label>

          <button
            onClick={() => setFilterVisible(!filterVisible)}
            className="bg-transparent hover:bg-gray-700 text-blue-700 font-semibold hover:border border-white-400 hover:text-white py-2 px-4 border border-white-300 hover:border-transparent rounded"
          >
            Filter
          </button>
        </div>
      </nav>

      {/* Filter Form */}
      {filterVisible && (
        <div className="bg-white shadow-lg rounded-lg p-4 mb-4">
          <h2 className="text-lg font-bold mb-4">Filter Products</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2">Category</label>
              <select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">All Categories</option>
                <option value="Electronics">Electronics</option>
                <option value="Clothing">Clothing</option>
                <option value="Books">Books</option>
                <option value="Home Appliances">Home Appliances</option>
                <option value="Sports Equipment">Sports Equipment</option>
                <option value="Beauty Products">Beauty Products</option>
              </select>
            </div>

            <div>
              <label className="block mb-2">Minimum Discount (%)</label>
              <input
                type="number"
                name="discount"
                value={filters.discount}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block mb-2">Minimum Stock</label>
              <input
                type="number"
                name="stock"
                value={filters.stock}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block mb-2">Maximum MRP (₹)</label>
              <input
                type="number"
                name="mrp"
                value={filters.mrp}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>
      )}

      {/* Products Display */}
  { 
    (!useElasticSearch)&&
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {currentProducts.map(product => (
          <div key={product.id} className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-lg font-bold mb-2">{product.name}</h3>
            <p className="text-gray-600">Category: {product.category.category}</p>
            <p className="text-gray-600">Description: {product.description}</p>

            <p className="text-gray-600">MRP: ₹{product.mrp}</p>
            <p className="text-gray-600">Stock: {product.stock}</p>
            <p className="text-gray-600">Discount: {product.discount}</p>
          </div>
        ))}
      </div>
}
{(useElasticSearch) && (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
    {currentProducts
      // Filter out duplicates based on unique product ID
      .filter((product, index, self) => 
        index === self.findIndex((p) => p.id === product.id)
      )
      .map(product => (
        <div key={product.id} className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-lg font-bold mb-2">{product.name}</h3>
          <p className="text-gray-600">Category: {product.category.toString()}</p>
          <p className="text-gray-600">Description: {product.description}</p>
          <p className="text-gray-600">MRP: ₹{product.mrp}</p>
          <p className="text-gray-600">Stock: {product.stock}</p>
          <p className="text-gray-600">Discount: {product.discount}</p>
        </div>
      ))}
  </div>
)}


      {/* Pagination */}
      <div className="flex justify-center mt-4">
        <button
          onClick={handlePrev}
          disabled={currentPage === 1}
          className="px-4 py-2 mx-1 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md"
        >
          Previous
        </button>
        {pageNumbers.map((number, index) => (
          <button
            key={index}
            onClick={() => paginate(number)}
            className={`px-4 py-2 mx-1 ${currentPage === number ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-800'} rounded-md`}
          >
            {number}
          </button>
        ))}
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className="px-4 py-2 mx-1 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Products;
