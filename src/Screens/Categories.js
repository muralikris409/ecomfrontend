import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const itemsPerPage = 10;

  const isAuth = (sessionKey) => {
    fetch('http://127.0.0.1:8080/api/isauth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: sessionKey }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (!data.success) navigate('/login');
      })
      .catch((error) => setError('An error occurred in session auth.'));
  };

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://127.0.0.1:8080/api/categories');
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
    const sessionKey = localStorage.getItem('sessionKey');
    isAuth(sessionKey);
  }, [navigate]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const filteredCategories = categories.filter(
    (category) =>
      category.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.id.toString().includes(searchQuery) ||
      new Date(category.creationDate).toLocaleDateString().includes(searchQuery)
  );

  const currentCategories = filteredCategories.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const logout = async () => {
    const res = await fetch('http://127.0.0.1:8080/api/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: localStorage.getItem('sessionKey') }),
    });

    res
      .json()
      .then((data) => {
        if (data.success) navigate('/login');
        else alert('Something went wrong');
      })
      .catch((err) => console.log(err));
  };

  if (loading) return <div className="text-center">Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <nav className="bg-gray-800 p-4 mb-4">
        <div className="flex justify-between items-center">
          <div className="text-white text-2xl font-bold">Category Manager</div>
          <div className="relative w-1/3">
            <input
              type="text"
              placeholder="Search categories..."
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
          <button
            type="button"
            onClick={logout}
            className="text-white bg-gray-400 hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-4 py-2"
          >
            Signout
          </button>
        </div>
      </nav>

      <div className="container mx-auto p-4">
        <div className="mb-4 flex justify-end">
          <button
            onClick={() => navigate('/allproducts')}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            View All Products
          </button>
        </div>

        <div className="flex flex-col">
          <div className="-m-1.5 overflow-x-auto">
            <div className="p-1.5 min-w-full inline-block align-middle">
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">ID</th>
                      <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">Category</th>
                      <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">Creation Date</th>
                      <th className="px-6 py-3 text-end text-xs font-medium text-gray-500 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentCategories.length > 0 ? (
                      currentCategories.map((category) => (
                        <tr key={category.id} className="odd:bg-white even:bg-gray-100">
                          <td className="px-6 py-4 text-sm font-medium text-gray-800">{category.id}</td>
                          <td
                            className="px-6 py-4 text-sm font-medium text-gray-800 cursor-pointer hover:text-blue-500"
                            onClick={() => navigate(`/products/${category.id}`)}
                          >
                            {category.category}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-800">
                            {new Date(category.creationDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-end text-sm font-medium">
                            <button
                              onClick={() => navigate(`/products/${category.id}`)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center px-6 py-4 text-gray-800">
                          No categories available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-between items-center mt-4">
          <button
            className={`px-4 py-2 text-white bg-gray-800 rounded ${
              currentPage === 1 && 'opacity-50 cursor-not-allowed'
            }`}
            onClick={handlePrev}
            disabled={currentPage === 1}
          >
            Previous
          </button>

          <div className="space-x-2">
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index + 1}
                className={`px-4 py-2 ${
                  currentPage === index + 1 ? 'bg-blue-500 text-white' : 'bg-gray-300'
                }`}
                onClick={() => setCurrentPage(index + 1)}
              >
                {index + 1}
              </button>
            ))}
          </div>

          <button
            className={`px-4 py-2 text-white bg-gray-800 rounded ${
              currentPage === totalPages && 'opacity-50 cursor-not-allowed'
            }`}
            onClick={handleNext}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Categories;
