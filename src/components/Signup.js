import React, {useState,useRef} from 'react';
import '../CSS/Signup.css';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const host = 'http://localhost:5000'
  const [credentials, setCredentials] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    gender: "",
    address: "",
    city: "",
    state: "",
    zipcode: ""
  })
  const navigate = useNavigate()
  const handleSubmit = async (e, res) => {
    e.preventDefault()

    const response = await fetch(`${host}/api/auth/createuser`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: credentials.name,
        phone: credentials.phone,
        email: credentials.email,
        password: credentials.password,
        confirmPassword: credentials.confirmPassword,
        gender: credentials.gender,
        address: credentials.address,
        city: credentials.city,
        state: credentials.state,
        zipcode: credentials.zipcode
      })
    });
    const json = await response.json()
    if (json.success) {
      navigate('/login')
      console.log(json)
    }
    else {
      console.log(json)
    }
  }
  const onchange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value })
  }
  const passref1 = useRef(null)
  const passref2 = useRef(null)
  const togglePasswordVisibility = (e,inputField) => {
    const inputType = inputField.current.type === 'password' ? 'text' : 'password';
    inputField.current.type = inputType;
    e.target.classList.toggle('fa-eye-slash');
  };
  return (
    <section className='auth' id='signup'>
      <form onSubmit={handleSubmit}>
        <h1>Signup</h1>
        <input onChange={onchange} type="text" id='name' name='name' placeholder='Enter Your Name' required minLength={3} />
        <input onChange={onchange} type="email" id='email' name='email' placeholder='Enter Your Email' required />
        <div className="pass">
          <input ref={passref1} onChange={onchange} autoComplete='on' type="password" id='password' name='password' placeholder='Enter Password' required minLength={8} />
          <i onClick={(e)=>{togglePasswordVisibility(e,passref1)}} className='fas fa-eye' aria-label="Toggle password visibility"></i>
        </div>
        <div className="pass">
          <input ref={passref2} onChange={onchange} autoComplete='on' type="password" id='confirmPassword' name='confirmPassword' placeholder='Enter Password Again' required minLength={8} />
          <i onClick={(e)=>{togglePasswordVisibility(e,passref2)}} className='fas fa-eye' aria-label="Toggle password visibility"></i>
        </div>
        <button type="submit">Signup</button>
      </form>
    </section>
  );
}

export default Signup;
