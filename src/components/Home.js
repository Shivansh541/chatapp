import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '../CSS/Home.css';
import io from 'socket.io-client';

const Home = (props) => {
    const [message, setMessage] = useState('');
    const [messageBox, setMessageBox] = useState({});
    const [isProfileVisible, setProfileVisible] = useState(false);
    const [isContactProfileVisible, setContactProfileVisible] = useState(false);
    const sendButtonRef = useRef(null);
    const messageInputRef = useRef(null);
    const profileBoxRef = useRef(null);
    const contactProfileBoxRef = useRef(null);
    const navigate = useNavigate();
    const host = 'http://localhost:5000';
    const [socket, setSocket] = useState(null);
    const [isContactVisible, setContactVisibility] = useState(false);
    const showContacts = useRef();
    const [conversations, setConversations] = useState([]);
    const toggleContactVisibility = () => {
        setContactVisibility(!isContactVisible);
    };

    useEffect(() => {
        setSocket(io('http://localhost:8000'));
    }, []);

    useEffect(() => {
        socket?.emit('addUser', props.user._id);
        socket?.on('getUsers', users => {
            console.log(users);
        });
        socket?.on('receiveMessage', data => {
            console.log(data);
            setMessageBox(prev => ({
                ...prev,
                messages: [...prev.messages, { user: data.user, message: data.message }]
            }));
        });
    }, [socket, props]);

    useEffect(() => {
        if (!localStorage.getItem('token')) {
            navigate('/login');
        }
    }, [navigate]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileBoxRef.current && !profileBoxRef.current.contains(event.target)) {
                setProfileVisible(false);
            }
        };
        if (isProfileVisible) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isProfileVisible]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showContacts.current && !showContacts.current.contains(event.target)) {
                setContactVisibility(false);
            }
        };
        if (isContactVisible) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isContactVisible]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (contactProfileBoxRef.current && !contactProfileBoxRef.current.contains(event.target)) {
                setContactProfileVisible(false);
            }
        };
        if (isContactProfileVisible) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isContactProfileVisible]);

    useEffect(() => {
        if (isProfileVisible) {
            profileBoxRef.current.classList.add('show');
        } else {
            profileBoxRef.current.classList.remove('show');
        }
    }, [isProfileVisible]);

    useEffect(() => {
        if (isContactVisible) {
            showContacts.current.classList.add('show');
        } else {
            showContacts.current.classList.remove('show');
        }
    }, [isContactVisible]);

    useEffect(() => {
        if (isContactProfileVisible) {
            contactProfileBoxRef.current?.classList.add('show');
        } else {
            contactProfileBoxRef.current?.classList.remove('show');
        }
    }, [isContactProfileVisible]);

    const handleVoiceInput = () => {
        const recognition = new window.webkitSpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setMessage(transcript);
            if (transcript.length > 0) {
                sendButtonRef.current.classList.add('show');
            } else {
                sendButtonRef.current.classList.remove('show');
            }
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error', event.error);
        };

        recognition.start();

        return () => {
            recognition.abort();
        };
    };

    const showBtn = useCallback((e) => {
        if (e.target.value.length > 0) {
            sendButtonRef.current.classList.add('show');
        } else {
            sendButtonRef.current.classList.remove('show');
        }
    }, []);

    const handleFormSubmit = async (e, conversationId, user) => {
        e.preventDefault();
        socket.emit('sendMessage', {
            message: message,
            conversationId: conversationId,
            senderId: props.user._id,
            receiverId: user.userId,
        });
        try {
            const response = await fetch(`${host}/api/message`, {
                method: "POST",
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify({
                    message: message,
                    conversationId: conversationId,
                    senderId: props.user._id
                })
            });
            const msg = await response.json();
            console.log(msg);
        } catch (error) {
            console.log(error);
        }
        setMessage('');
        sendButtonRef.current.classList.remove('show');
    };

    const toggleProfileVisibility = () => {
        setProfileVisible(!isProfileVisible);
    };

    const toggleContactProfileVisibility = () => {
        setContactProfileVisible(!isContactProfileVisible);
    };

    const getMessages = async (id, user) => {
        try {
            const response = await fetch(`${host}/api/message/${id}`, {
                method: "GET",
                headers: {
                    "content-type": "application/json"
                },
            });
            const messages = await response.json();
            setMessageBox({
                conversationId: id,
                user: user,
                messages: messages,
            });
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };
    const getUserConversation = async () => {
        try {
          if (props.user._id) {
            const response = await fetch(`${host}/api/conversation/${props.user._id}`, {
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
    const createConversation = async (senderId,contact) => {
        try {
            const response = await fetch(`${host}/api/conversation`, {
                method: "POST",
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify({
                    senderId,
                    receiverId: contact._id
                })
            });
            const conversation = await response.json();
            getMessages(conversation._id, contact);
            getUserConversation()
        } catch (error) {
            console.error('Error creating conversation:', error);
        }
    }
    useEffect(()=>{
        setConversations(props.conversations);
    })
    return (
        <section id="home">
            <div id="chatRoom">
                <div className="scroll">
                    <div className="row">
                        <h1>Chats</h1>
                        <div className="profile-container">
                            <button onClick={toggleContactVisibility}>
                                <i className="fa-solid fa-user-plus"></i>
                            </button>
                            <div ref={showContacts} className="addConvo">
                                <h1>New Chat</h1>
                                <input type="search" name='search' placeholder='Search a name or email' />
                                <button className='btn1'>Add Contact</button>
                                {props.user.contacts?.length > 0 ? props.user.contacts.map((contact,i) =>
                                    <div onClick={()=>{toggleContactVisibility();createConversation(props.user._id,contact);}} key={i} className="box">
                                        <img src="/images/profilePic.png" alt="loading" />
                                        <h4>{contact.name}</h4>
                                    </div>
                                ) : <h4>No Contacts Yet</h4>}
                            </div>
                            <img src="/images/profilePic.png" alt="Profile" id="profilePic" onClick={toggleProfileVisibility} />
                            <div className="profile" id="profileBox" ref={profileBoxRef}>
                                <img src="/images/profilePic.png" alt="Profile" />
                                <div className="column">
                                    <div className="row">
                                        <h1>{props.user.name}</h1>
                                        <i className="fa-solid fa-pen"></i>
                                    </div>
                                </div>
                                <div className="column fs">
                                    <div className="row">
                                        <h1>About</h1>
                                        <i className="fa-solid fa-pen"></i>
                                    </div>
                                    <p>Hey there! I'm using chatapp</p>
                                </div>
                                <div className="column fs">
                                    <h1>Email</h1>
                                    <p>{props.user.email}</p>
                                </div>
                                <button onClick={() => { localStorage.removeItem('token'); navigate('/login') }} id="logoutButton">Logout</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="contacts">
                    {conversations.length > 0 ?
                        conversations.map((conversation, index) => (
                            <div onClick={() => { getMessages(conversation.conversationId, conversation.user); }} className="contact" key={index}>
                                <img src="/images/profilePic.png" alt="Contact" />
                                <p className="name">{conversation.user?.name}</p>
                            </div>)) : <div>No conversations</div>}
                </div>
            </div>
            {Object.keys(messageBox).length > 0 ?
                <div id="messageBox">
                    <div className="nameBox">
                        <img src="/images/profilePic.png" alt="Profile" onClick={toggleContactProfileVisibility} />
                        <div>
                            <p onClick={toggleContactProfileVisibility}>{messageBox.user?.name}</p>
                            <p onClick={toggleContactProfileVisibility}>select for contact info</p>
                        </div>
                        <div className="contactProfile" ref={contactProfileBoxRef}>
                            <img src="/images/profilePic.png" alt="Profile" />
                            <div className="column">
                                <div className="row">
                                    <h1>{messageBox.user?.name}</h1>
                                </div>
                            </div>
                            <div className="column fs">
                                <div className="row">
                                    <h1>About</h1>
                                </div>
                                <p>Hey there! I'm using chatapp</p>
                            </div>
                            <div className="column fs">
                                <h1>Email</h1>
                                <p>{messageBox.user?.email}</p>
                            </div>
                        </div>
                    </div>
                    <div className="chatBox">
                        {messageBox.messages && messageBox.messages.length > 0 ?
                            messageBox.messages.map((msg, index) => (
                                <div className={`msg ${msg.user?.userId === props.user._id ? 'right' : 'left'}`} key={index}>
                                    {msg.message}
                                </div>
                            )) : <div>No messages</div>}
                    </div>
                    <form className="input" onSubmit={(e) => { handleFormSubmit(e, messageBox.conversationId, messageBox.user) }}>
                        <input
                            type="text"
                            name="message"
                            id="message"
                            placeholder="Enter Your Message Here"
                            value={message}
                            onChange={(e) => {
                                setMessage(e.target.value);
                                showBtn(e);
                            }}
                            ref={messageInputRef}
                        />
                        <button type="submit" id="sendButton" ref={sendButtonRef}>
                            <i className="fa-solid fa-paper-plane"></i>
                        </button>
                        <button type="button" onClick={handleVoiceInput}>
                            <i className="fa-solid fa-microphone"></i>
                        </button>
                    </form>
                </div> : <div>No Conversations</div>}
        </section>
    );
};

export default Home;
