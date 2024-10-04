import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const Products = () => {
  const { categoryId } = useParams(); // Get category ID from URL
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState(''); // State for search query
  const [currentPage, setCurrentPage] = useState(1); // Current page
  const itemsPerPage = 10; // Items per page
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
          navigate("/login"); // Redirect using navigate
        }
      })
      .catch(error => {
        console.error('Error:', error);
        setError('An error occurred in session auth.');
      });
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://127.0.0.1:8080/api/products/category/${categoryId}`);
        const data = await response.json();
        setProducts(data); // Set fetched data to state
        setLoading(false);
      } catch (error) {
        setError('Failed to fetch products');
        setLoading(false);
      }
    };
    isAuth(localStorage.getItem('sessionKey'));
    fetchProducts();
  }, [categoryId]);

  // Filter products based on search query
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

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

  // Generate pagination buttons with ellipses
  const generatePagination = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5; // Maximum number of page buttons to show

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
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <nav className="bg-gray-800 p-4 mb-4">
        <div className="flex justify-between items-center">
          <div className="text-white text-2xl font-bold">Products</div>
          <div className="relative w-1/3">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
            />
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
        </div>
      </nav>

      <div className="container mx-auto p-4">
        {currentProducts.length > 0 ? (
          <div className="flex flex-col">
            <div className="-m-1.5 overflow-x-auto">
              <div className="p-1.5 min-w-full inline-block align-middle">
                <div className="overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">ID</th>
                        <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">Description</th>
                        <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">MRP</th>
                        <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">Discount</th>
                        <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">Stock</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentProducts.map((product) => (
                        <tr key={product.id} className="odd:bg-white even:bg-gray-100">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{product.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{product.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{product.description}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{product.mrp}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{product.discount}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{product.stock}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-700">No products available in this category.</p>
        )}

        {/* Pagination */}
        <div className="flex justify-center mt-4">
          <button
            onClick={handlePrev}
            className="bg-transparent hover:bg-gray-500 text-blue-700 font-semibold py-2 px-4 border border-blue-500 hover:border-transparent rounded"
            disabled={currentPage === 1}
          >
            Previous
          </button>

          {pageNumbers.map((number, index) =>
            number === '...' ? (
              <span key={index} className="px-3 py-2">...</span>
            ) : (
              <button
                key={index}
                onClick={() => paginate(number)}
                className={`px-3 py-2 mx-1 border rounded ${currentPage === number ? 'bg-blue-500 text-white' : 'bg-transparent text-blue-700 border-blue-500'}`}
              >
                {number}
              </button>
            )
          )}

          <button
            onClick={handleNext}
            className="bg-transparent hover:bg-gray-500 text-blue-700 font-semibold py-2 px-4 border border-blue-500 hover:border-transparent rounded"
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Products;
