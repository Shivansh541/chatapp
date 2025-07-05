import './App.css';
import Home from './components/Home';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import { useEffect, useState } from 'react';

function App() {
  const host = 'http://localhost:5000';
  const [user, setUser] = useState({});
  const [conversations, setConversations] = useState([]);

  const getUser = async () => {
    try {
      const response = await fetch(`${host}/api/auth/getuser`, {
        method: "POST",
        headers: {
          "auth-token": localStorage.getItem('token'),
        },
      });
      if (response.ok) {
        const user = await response.json();
        setUser(user);
      } else {
        console.error('Failed to fetch user');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  useEffect(() => {
    if (localStorage.getItem('token')) {
      getUser();
    }
  }, []);

  useEffect(() => {
    const getUserConversation = async () => {
      try {
        if (user._id) {
          const response = await fetch(`${host}/api/conversation/${user._id}`, {
            method: "GET",
            headers: {
              "content-type": "application/json",
            },
          });
          if (response.ok) {
            const conversation = await response.json();
            console.log(conversation)
            setConversations(conversation);
          } else {
            console.error('Failed to fetch conversations');
          }
        }
      } catch (error) {
        console.error('Error fetching conversations:', error);
      }
    };

    if (user._id) {
      getUserConversation();
    }
  }, [user._id]);

  return (
    <Router>
      <Routes>
        <Route path='/chatapp' element={<Home user={user} conversations={conversations} />} />
        <Route path='/chatapp/login' element={<Login />} />
        <Route path='/chatapp/signup' element={<Signup />} />
      </Routes>
    </Router>
  );
}

export default App;
