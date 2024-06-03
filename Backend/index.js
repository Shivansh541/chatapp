const express = require('express');
const app = express();
const port = 5000;
const mongoose = require('mongoose');
const connectToMongo = require('./db');
const cors = require('cors');
const User = require('./modules/User');
const socketIo = require('socket.io');

// Database connection
mongoose.set('strictQuery', true);
connectToMongo();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/conversation', require('./routes/conversation'));
app.use('/api/message', require('./routes/message'));

// Socket.io setup
const io = socketIo(8000, {
    cors: {
        origin: "http://localhost:3000",
    }
});

let users = [];

const addUser = (userId, socketId) => {
    if (userId && !users.some(user => user.userId === userId)) {
        users.push({ userId, socketId });
    }
};

const removeUser = (socketId) => {
    users = users.filter(user => user.socketId !== socketId);
};

const getUser = (userId) => {
    return users.find(user => user.userId === userId);
};

io.on('connection', (socket) => {
    console.log("User connected", socket.id);

    // Add user
    socket.on('addUser', (userId) => {
        addUser(userId, socket.id);
        io.emit('getUsers', users);
    });

    // Send and receive messages
    socket.on('sendMessage', async (data) => {
        const { senderId, receiverId, message, conversationId } = data;
        const receiver = getUser(receiverId);
        const sender = getUser(senderId);

        if (receiver && sender) {
            try {
                const user = await User.findById(senderId);
                if (user) {
                    io.to(receiver.socketId).to(sender.socketId).emit('receiveMessage', {
                        senderId,
                        receiverId,
                        message,
                        conversationId,
                        user: {userId: user._id, name: user.name,email: user.email}
                    });
                }
            } catch (error) {
                console.error('Error sending message:', error);
            }
        }
    });

    // Remove user on disconnect
    socket.on('disconnect', () => {
        console.log('User disconnected', socket.id);
        removeUser(socket.id);
        io.emit('getUsers', users);
    });
});

// Default route
app.get('/', (req, res) => {
    res.send("Hello World");
});

// Start the server
app.listen(port, () => {
    console.log(`Chatapp backend listening at http://localhost:${port}`);
});
