import React, { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Login = (props) => {
  const host = 'http://localhost:5000';
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const navigate = useNavigate();
  const passRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${host}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials)
      });
      const json = await response.json();
      if (json.success) {
        console.log('Successfully logged in');
        localStorage.setItem('token', json.authToken);
        navigate('/');
      } else {
        console.error('Login failed:', json.message);
        alert('Login failed: ' + json.message);
      }
    } catch (error) {
      console.error('Error during login:', error);
      alert('An error occurred during login. Please try again later.');
    }
  };

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = (e) => {
    const inputType = passRef.current.type === 'password' ? 'text' : 'password';
    passRef.current.type = inputType;
    e.target.classList.toggle('fa-eye-slash');
  };

  return (
    <div id='login' className='auth'>
      <form onSubmit={handleSubmit}>
        <h1>Login</h1>
        <input type="email" name='email' id="email" onChange={handleChange} aria-label="Email" placeholder='Enter Your Email Here' required minLength={5} />
        <div className="pass">
          <input ref={passRef} onChange={handleChange} autoComplete='on' type="password" id='password' name='password' aria-label="Password" placeholder='Enter Password' required minLength={8} />
          <i onClick={togglePasswordVisibility} className='fas fa-eye' aria-label="Toggle password visibility"></i>
        </div>
        <div className="buttons">
          <button type="submit" className="btn">Submit</button>
          <Link to="/signup">Signup</Link>
        </div>
      </form>
    </div>
  );
};

export default Login;
