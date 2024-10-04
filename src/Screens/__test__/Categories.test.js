import '@testing-library/jest-dom'; // Provides matchers like 'toBeInTheDocument'
import Categories from '../Categories';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';

  
// Mock the fetch API to handle API requests for the component
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () =>
      Promise.resolve([
        { id: 1, category: 'Electronics', creationDate: '2023-01-01' },
        { id: 2, category: 'Books', creationDate: '2023-01-02' },
      ]),
  })
);

// Mock the useNavigate function from react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

describe('Categories Component', () => {
  beforeEach(() => {
    // Clear fetch mock before each test
    fetch.mockClear();
    localStorage.setItem('sessionKey', 'validSessionKey'); // Mock a session key
  });

  test('renders loading state initially', () => {
    render(
      <MemoryRouter>
        <Categories />
      </MemoryRouter>
    );
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test('renders categories once data is fetched', async () => {
    render(
      <MemoryRouter>
        <Categories />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Electronics/i)).toBeInTheDocument();
    });
  });

  test('search functionality filters categories', async () => {
    render(
      <MemoryRouter>
        <Categories />
      </MemoryRouter>
    );


    const searchInput = screen.getByPlaceholderText(/search categories/i);
    fireEvent.change(searchInput, { target: { value: 'Books' } });

    await waitFor(() => {
      expect(screen.queryByText(/Electronics/i)).not.toBeInTheDocument();
    });
  });

  test('pagination works correctly', async () => {
    render(
      <MemoryRouter>
        <Categories />
      </MemoryRouter>
    );


    const nextButton = screen.getByText(/next/i);
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.queryByText(/Electronics/i)).not.toBeInTheDocument();
    });

    const prevButton = screen.getByText(/previous/i);
    fireEvent.click(prevButton);

    await waitFor(() => {
      expect(screen.getByText(/Electronics/i)).toBeInTheDocument();
    });
  });

  test('shows error when fetch fails', async () => {
    // Override fetch to simulate a failure
    global.fetch.mockImplementationOnce(() =>
      Promise.reject(new Error('Failed to fetch data'))
    );

    render(
      <MemoryRouter>
        <Categories />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/failed to fetch data/i)).toBeInTheDocument();
    });
  });

  test('redirects to login if not authenticated', async () => {
    // Simulate a failed session authentication by mocking fetch response
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        json: () => Promise.resolve({ success: false }),
      })
    );

    render(
      <MemoryRouter>
        <Categories />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('http://127.0.0.1:8080/api/isauth', expect.anything());
    });
  });
});
