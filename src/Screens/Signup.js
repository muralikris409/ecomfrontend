import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Signup = () => {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [emailError, setEmailError] = useState(false);
    const [usernameError, setUsernameError] = useState(false);
    const [passwordError, setPasswordError] = useState(false);
    const [confirmPasswordError, setConfirmPasswordError] = useState(false);
    const [isUsernameTaken, setIsUsernameTaken] = useState(false);
    const [passwordMatch, setPasswordMatch] = useState(false);
    const navigate = useNavigate();

    // Validation functions
   
    const validatePassword = (password) => {
    if (password.length <= 6) {
        setPasswordError(true);
    } else {
        setPasswordError(false);
    }}
    const matchPwd=(cpassword)=>{
        if (cpassword!==password) {
            setConfirmPasswordError(true);
        } else {
            setConfirmPasswordError(false);
        }
    }
    // Check for duplicate username (Mock API call)
    const checkDuplicateUsername = async (username) => {
        const response = await fetch(`http://127.0.0.1:8080/api/checkDuplicate/${username}`);
        const data = await response.json();

        setIsUsernameTaken(data.success);
    };
    const validateEmail = (email) =>{ 
    if (!(/^[^\s@]+@[^\s@]+\.[^\s@]{2,3}$/.test(email))) {
        setEmailError(true);
    } else {
        setEmailError(false);
    }}

    // Handle form submission
    const handleSubmit = async (event) => {
        event.preventDefault();

     
   

     

        

        if (!emailError && !usernameError && !passwordError && !confirmPasswordError) {
            // Send POST request to signup endpoint
            const user = {
                email,
                name: username,
                password,
            };

            fetch('http://127.0.0.1:8080/api/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(user),
            })
                .then((response) => {
                    if (response.ok) {
                        return response.json();
                    } else {
                        throw new Error('Signup failed');
                    }
                })
                .then((data) => {
                    if (data.success) {
                        alert('Signup successful!');
                        navigate('/login'); // Redirect to login page
                    } else {
                        alert('Error: ' + data.message);
                    }
                })
                .catch((error) => {
                    console.error('Error:', error);
                    alert('Signup failed: ' + error.message);
                });
        }
    };

    return (
        <section className="bg-gray-50">
            <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
                <Link to="/" className="flex items-center mb-6 text-2xl font-semibold text-gray-900">
                    Ecom
                </Link>
                <div className="w-full bg-white rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0">
                    <div className="p-6 space-y-4">
                        <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
                            Create an account
                        </h1>
                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900">
                                    Your email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5"
                                    placeholder="name@company.com"
                                    value={email}
                                    onChange={(e) => {setEmail(e.target.value);
                                        validateEmail(e.target.value);

                                    }}
                                    required
                                />
                                {emailError && <p className="text-red-600">Invalid email format</p>}
                            </div>
                            <div>
                                <label htmlFor="username" className="block mb-2 text-sm font-medium text-gray-900">
                                    Username
                                </label>
                                <input
                                    type="text"
                                    id="username"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5"
                                    placeholder="Username"
                                    value={username}
                                    onChange={(e) => {
                                        setUsername(e.target.value);
                                        checkDuplicateUsername(e.target.value);
                                    }}
                                    required
                                />
                                {isUsernameTaken && <p className="text-red-600">Username already taken</p>}
                                {!usernameError && !isUsernameTaken && username && (
                                    <span className="text-green-600">✔️</span>
                                )}
                            </div>
                            <div>
                                <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) =>{ setPassword(e.target.value);
                                        validatePassword(e.target.value);
                                    }}
                                    required
                                />
                                {passwordError && <p className="text-red-600">Password must be at least 6 characters</p>}
                            </div>
                            <div>
                                <label htmlFor="confirm-password" className="block mb-2 text-sm font-medium text-gray-900">
                                    Confirm password
                                </label>
                                <input
                                    type="password"
                                    id="confirm-password"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => {setConfirmPassword(e.target.value);
                                        matchPwd(e.target.value);
                                    }}
                                    required
                                />
                                {confirmPasswordError && <p className="text-red-600">Passwords do not match</p>}
                            </div>
                            <div className="flex items-start">
                                <div className="flex items-center h-5">
                                    <input
                                        id="terms"
                                        type="checkbox"
                                        className="w-4 h-4 border border-gray-300 rounded bg-gray-50"
                                        required
                                    />
                                </div>
                                <div className="ml-3 text-sm">
                                    <label htmlFor="terms" className="font-light text-gray-500">
                                        I accept the{' '}
                                        <Link to="/terms" className="font-medium text-primary-600 hover:underline">
                                            Terms and Conditions
                                        </Link>
                                    </label>
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="w-full text-white bg-gray-800 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                            >
                                Create an account
                            </button>
                            <p className="text-sm font-light text-gray-500">
                                Already have an account?{' '}
                                <Link to="/login" className="font-medium text-primary-600 hover:underline">
                                    Login here
                                </Link>
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Signup;
