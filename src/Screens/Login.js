import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import Link and useNavigate from react-router-dom
import '../index.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate(); // useNavigate to handle routing

    const handleSubmit = (event) => {
        event.preventDefault();

        if (email === '' || password === '') {
            setError('Both fields are required.');
            return;
        }

        login(email, password);
    };

    const login = (email, password) => {
        fetch('http://127.0.0.1:8080/api/auth', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Store session key and redirect to dashboard
                localStorage.setItem('sessionKey', data.message);
                navigate("/"); // Redirect using navigate
            } else {
                setError('Login failed. Please check your credentials.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            setError('An error occurred. Please try again.');
        });
    };
    const isAuth = (sessionKey) => {
        console.log(sessionKey);
        fetch('http://127.0.0.1:8080/api/isauth', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({name: sessionKey })
            
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Store session key and redirect to dashboard
                
                navigate("/"); // Redirect using navigate
            } else {
                setError('Session Expired');
                navigate('/login');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            setError('An error occurred in session auth.');
        });
    };
    useEffect(() => {
        const sessionKey = localStorage.getItem('sessionKey');
       isAuth(sessionKey);
    },[navigate]);

    return (
        <section className="bg-gray-50">
            <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
                <Link to="/" className="flex items-center mb-6 text-2xl font-semibold text-gray-900"> {/* Replaced a with Link */}
                    <img className="w-8 h-8 mr-2" src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/logo.svg" alt="logo" />
                    Ecom    
                </Link>
                <div className="w-full bg-white rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0">
                    <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                        <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
                            Sign in to your account
                        </h1>
                        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                            <div>
                                <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900">Your email</label>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                                    placeholder="name@company.com"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900">Password</label>
                                <input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                                    required
                                />
                            </div>
                            {error && <p className="text-red-500">{error}</p>}
                            <button type="submit" className="w-full text-white bg-gray-800 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">
                                Sign in
                            </button>
                            <p className="text-sm font-light text-gray-500">
                                Don’t have an account yet? <Link to="/signup" className="font-medium text-blue-600 hover:underline">Sign up</Link> {/* Replaced a with Link */}
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Login;
