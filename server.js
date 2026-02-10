const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Простая in-memory база данных
class Database {
    constructor() {
        this.users = new Map();
        this.chats = new Map();
        this.messages = new Map();
        this.loadSampleData();
    }

    loadSampleData() {
        // Пример пользователей
        const sampleUsers = [
            {
                id: 1,
                phone: '+79001234567',
                username: 'alexey',
                firstName: 'Алексей',
                lastName: 'Иванов',
                displayName: 'Алексей Иванов',
                avatarColor: '#667eea',
                status: 'online',
                lastSeen: new Date().toISOString()
            },
            {
                id: 2,
                phone: '+79001234568',
                username: 'maria',
                firstName: 'Мария',
                lastName: 'Петрова',
                displayName: 'Мария Петрова',
                avatarColor: '#f093fb',
                status: 'online',
                lastSeen: new Date().toISOString()
            },
            {
                id: 3,
                phone: '+79001234569',
                username: 'dmitry',
                firstName: 'Дмитрий',
                lastName: 'Сидоров',
                displayName: 'Дмитрий Сидоров',
                avatarColor: '#4facfe',
                status: 'online',
                lastSeen: new Date().toISOString()
            },
            {
                id: 4,
                phone: '+79001234570',
                username: 'ekaterina',
                firstName: 'Екатерина',
                lastName: 'Кузнецова',
                displayName: 'Екатерина Кузнецова',
                avatarColor: '#43e97b',
                status: 'offline',
                lastSeen: new Date(Date.now() - 3600000).toISOString()
            },
            {
                id: 5,
                phone: '+79001234571',
                username: 'support',
                firstName: 'Техническая',
                lastName: 'Поддержка',
                displayName: 'Техническая Поддержка',
                avatarColor: '#fa709a',
                status: 'online',
                lastSeen: new Date().toISOString()
            },
            {
                id: 6,
                phone: '+79001234572',
                username: 'monkey',
                firstName: 'Обезьянка',
                lastName: 'Веселая',
                displayName: 'Обезьянка Веселая',
                avatarColor: '#f5576c',
                status: 'online',
                lastSeen: new Date().toISOString()
            }
        ];

        sampleUsers.forEach(user => {
            this.users.set(user.username, user);
        });

        // Пример чатов
        const sampleChats = [
            {
                id: '1',
                name: 'Техническая поддержка',
                type: 'group',
                avatarColor: '#667eea',
                members: ['@support', '@alexey'],
                createdAt: new Date().toISOString(),
                lastMessage: 'Чем могу помочь?',
                lastMessageTime: new Date().toISOString(),
                unreadCount: 0
            },
            {
                id: '2',
                name: 'Друзья',
                type: 'group',
                avatarColor: '#f093fb',
                members: ['@alexey', '@maria', '@dmitry'],
                createdAt: new Date(Date.now() - 86400000).toISOString(),
                lastMessage: 'Встречаемся в 19:00',
                lastMessageTime: new Date(Date.now() - 3600000).toISOString(),
                unreadCount: 2
            },
            {
                id: '3',
                name: 'Мария Петрова',
                type: 'private',
                avatarColor: '#4facfe',
                members: ['@alexey', '@maria'],
                createdAt: new Date(Date.now() - 172800000).toISOString(),
                lastMessage: 'Привет! Как дела?',
                lastMessageTime: new Date(Date.now() - 7200000).toISOString(),
                unreadCount: 0
            }
        ];

        sampleChats.forEach(chat => {
            this.chats.set(chat.id, chat);
            this.messages.set(chat.id, []);
        });

        // Добавляем примеры сообщений
        const sampleMessages = [
            {
                id: '1',
                chatId: '1',
                text: 'Добрый день! Чем могу помочь?',
                sender: '@support',
                timestamp: new Date(Date.now() - 1800000).toISOString(),
                seen: true,
                seenBy: ['@alexey']
            },
            {
                id: '2',
                chatId: '1',
                text: 'Привет! У меня проблема с приложением',
                sender: '@alexey',
                timestamp: new Date(Date.now() - 1700000).toISOString(),
                seen: true,
                seenBy: ['@support']
            },
            {
                id: '3',
                chatId: '1',
                text: 'Опишите, пожалуйста, подробнее проблему',
                sender: '@support',
                timestamp: new Date(Date.now() - 1600000).toISOString(),
                seen: true,
                seenBy: ['@alexey']
            },
            {
                id: '4',
                chatId: '2',
                text: 'Привет всем!',
                sender: '@maria',
                timestamp: new Date(Date.now() - 86400000).toISOString(),
                seen: true,
                seenBy: ['@alexey', '@dmitry']
            },
            {
                id: '5',
                chatId: '2',
                text: 'Привет! Как дела?',
                sender: '@dmitry',
                timestamp: new Date(Date.now() - 86300000).toISOString(),
                seen: true,
                seenBy: ['@alexey', '@maria']
            },
            {
                id: '6',
                chatId: '2',
                text: 'Встречаемся в 19:00 в кафе',
                sender: '@maria',
                timestamp: new Date(Date.now() - 3600000).toISOString(),
                seen: false,
                seenBy: []
            },
            {
                id: '7',
                chatId: '3',
                text: 'Привет! Как дела?',
                sender: '@maria',
                timestamp: new Date(Date.now() - 7200000).toISOString(),
                seen: true,
                seenBy: ['@alexey']
            },
            {
                id: '8',
                chatId: '3',
                text: 'Привет! Все отлично, спасибо!',
                sender: '@alexey',
                timestamp: new Date(Date.now() - 7100000).toISOString(),
                seen: true,
                seenBy: ['@maria']
            }
        ];

        sampleMessages.forEach(message => {
            if (!this.messages.has(message.chatId)) {
                this.messages.set(message.chatId, []);
            }
            this.messages.get(message.chatId).push(message);
        });
    }

    getUserByUsername(username) {
        return this.users.get(username);
    }

    getUserByPhone(phone) {
        for (let user of this.users.values()) {
            if (user.phone === phone) {
                return user;
            }
        }
        return null;
    }

    searchUsers(query) {
        const results = [];
        const searchQuery = query.toLowerCase();
        
        for (let user of this.users.values()) {
            if (user.username.toLowerCase().includes(searchQuery) || 
                user.displayName.toLowerCase().includes(searchQuery)) {
                results.push(user);
            }
        }
        
        return results;
    }

    createUser(userData) {
        const newUser = {
            id: Date.now(),
            ...userData,
            avatarColor: this.getRandomColor(),
            status: 'online',
            lastSeen: new Date().toISOString()
        };
        
        this.users.set(newUser.username, newUser);
        return newUser;
    }

    getChatsForUser(username) {
        const userChats = [];
        
        for (let chat of this.chats.values()) {
            if (chat.members.includes(`@${username}`)) {
                userChats.push(chat);
            }
        }
        
        return userChats.sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));
    }

    createChat(chatData) {
        const newChat = {
            id: Date.now().toString(),
            ...chatData,
            createdAt: new Date().toISOString(),
            lastMessage: 'Нет сообщений',
            lastMessageTime: new Date().toISOString(),
            unreadCount: 0
        };
        
        this.chats.set(newChat.id, newChat);
        this.messages.set(newChat.id, []);
        
        return newChat;
    }

    addMessage(chatId, messageData) {
        const chat = this.chats.get(chatId);
        if (!chat) return null;
        
        const newMessage = {
            id: Date.now().toString(),
            ...messageData,
            timestamp: new Date().toISOString(),
            seen: false,
            seenBy: []
        };
        
        chat.lastMessage = messageData.text;
        chat.lastMessageTime = newMessage.timestamp;
        
        if (!this.messages.has(chatId)) {
            this.messages.set(chatId, []);
        }
        
        this.messages.get(chatId).push(newMessage);
        
        // Обновляем unreadCount для всех участников кроме отправителя
        const sender = messageData.sender.replace('@', '');
        chat.members.forEach(member => {
            const memberUsername = member.replace('@', '');
            if (memberUsername !== sender) {
                // В реальном приложении здесь была бы логика для каждого участника
                // Сейчас просто увеличиваем общий счетчик
                chat.unreadCount++;
            }
        });
        
        return newMessage;
    }

    getMessages(chatId) {
        return this.messages.get(chatId) || [];
    }

    markMessageAsSeen(chatId, messageId, username) {
        const messages = this.messages.get(chatId);
        if (!messages) return null;
        
        const message = messages.find(m => m.id === messageId);
        if (message && !message.seenBy.includes(username)) {
            message.seenBy.push(username);
            
            // Если все участники (кроме отправителя) прочитали сообщение
            const chat = this.chats.get(chatId);
            const sender = message.sender.replace('@', '');
            const allMembers = chat.members.map(m => m.replace('@', '')).filter(m => m !== sender);
            
            if (message.seenBy.length >= allMembers.length) {
                message.seen = true;
            }
            
            return message;
        }
        
        return null;
    }

    getRandomColor() {
        const colors = [
            '#667eea', '#764ba2', '#f093fb', '#f5576c',
            '#4facfe', '#00f2fe', '#43e97b', '#38f9d7',
            '#fa709a', '#fee140'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
}

class NeoGramServer {
    constructor() {
        this.db = new Database();
        this.connectedUsers = new Map(); // username -> WebSocket
        
        this.initServer();
    }
    
    initServer() {
        const server = http.createServer((req, res) => {
            this.setCorsHeaders(res);
            
            // Обработка статических файлов
            if (req.url === '/' || req.url === '/index.html') {
                this.serveFile(res, 'index.html', 'text/html');
            } else if (req.url === '/app.js') {
                this.serveFile(res, 'app.js', 'application/javascript');
            } else if (req.url === '/style.css') {
                this.serveFile(res, 'style.css', 'text/css');
            } else if (req.method === 'OPTIONS') {
                res.writeHead(200);
                res.end();
            } else if (req.url === '/api/chats' && req.method === 'GET') {
                this.handleGetChats(req, res);
            } else if (req.url.startsWith('/api/messages/') && req.method === 'GET') {
                this.handleGetMessages(req, res);
            } else if (req.url === '/api/messages/send' && req.method === 'POST') {
                this.handleSendMessage(req, res);
            } else if (req.url === '/api/chats/create' && req.method === 'POST') {
                this.handleCreateChat(req, res);
            } else if (req.url === '/api/register' && req.method === 'POST') {
                this.handleRegister(req, res);
            } else if (req.url.startsWith('/api/user/search/') && req.method === 'GET') {
                this.handleSearchUsers(req, res);
            } else if (req.url.startsWith('/api/user/') && req.method === 'GET') {
                this.handleGetUser(req, res);
            } else if (req.url === '/api/users/online' && req.method === 'GET') {
                this.handleGetOnlineUsers(req, res);
            } else {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Not found' }));
            }
        });
        
        // WebSocket сервер
        this.wss = new WebSocket.Server({ server });
        this.setupWebSocket();
        
        const port = process.env.PORT || 3000;
        server.listen(port, () => {
            console.log(`Server running on port ${port}`);
            console.log(`Available users: ${Array.from(this.db.users.keys()).join(', ')}`);
        });
    }
    
    setCorsHeaders(res) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    }
    
    serveFile(res, filename, contentType) {
        const filePath = path.join(__dirname, filename);
        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end('Error loading file');
                return;
            }
            
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        });
    }
    
    setupWebSocket() {
        this.wss.on('connection', (ws) => {
            console.log('New WebSocket connection');
            
            ws.on('message', (data) => {
                try {
                    const message = JSON.parse(data);
                    this.handleWebSocketMessage(ws, message);
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            });
            
            ws.on('close', () => {
                this.handleDisconnect(ws);
            });
        });
    }
    
    handleWebSocketMessage(ws, message) {
        switch (message.type) {
            case 'auth':
                this.handleAuth(ws, message);
                break;
                
            case 'message':
                this.handleMessage(ws, message);
                break;
                
            case 'typing':
                this.handleTyping(ws, message);
                break;
                
            case 'message_seen':
                this.handleMessageSeen(ws, message);
                break;
        }
    }
    
    handleAuth(ws, message) {
        const { username } = message;
        
        if (username && this.db.getUserByUsername(username)) {
            // Удаляем старые соединения для этого пользователя
            for (const [user, socket] of this.connectedUsers.entries()) {
                if (socket === ws) {
                    this.connectedUsers.delete(user);
                    break;
                }
            }
            
            this.connectedUsers.set(username, ws);
            
            // Обновляем статус пользователя
            const user = this.db.getUserByUsername(username);
            user.status = 'online';
            user.lastSeen = new Date().toISOString();
            
            // Оповещаем всех о новом онлайн статусе
            this.broadcastStatus(username, 'online');
            
            ws.send(JSON.stringify({
                type: 'auth_success',
                username
            }));
            
            console.log(`User ${username} authenticated`);
        }
    }
    
    handleMessage(ws, message) {
        const { chatId, text, sender } = message;
        const user = this.db.getUserByUsername(sender);
        
        if (!user) {
            ws.send(JSON.stringify({
                type: 'error',
                message: 'User not found'
            }));
            return;
        }
        
        // Добавляем сообщение в базу данных
        const newMessage = this.db.addMessage(chatId, {
            text,
            sender: `@${sender}`
        });
        
        if (!newMessage) {
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Chat not found'
            }));
            return;
        }
        
        // Оповещаем всех участников чата
        this.broadcastToChat(chatId, {
            type: 'new_message',
            message: newMessage
        });
        
        // Отправляем подтверждение отправителю
        ws.send(JSON.stringify({
            type: 'message_sent',
            messageId: newMessage.id
        }));
    }
    
    handleTyping(ws, message) {
        const { chatId } = message;
        
        // Находим username по соединению
        let username = null;
        for (const [user, socket] of this.connectedUsers.entries()) {
            if (socket === ws) {
                username = user;
                break;
            }
        }
        
        if (username) {
            this.broadcastToChat(chatId, {
                type: 'user_typing',
                chatId,
                username
            }, username); // Не отправляем самому себе
        }
    }
    
    handleMessageSeen(ws, message) {
        const { chatId, messageId } = message;
        
        // Находим username по соединению
        let username = null;
        for (const [user, socket] of this.connectedUsers.entries()) {
            if (socket === ws) {
                username = user;
                break;
            }
        }
        
        if (username) {
            // Обновляем статус сообщения
            const updatedMessage = this.db.markMessageAsSeen(chatId, messageId, username);
            
            if (updatedMessage) {
                // Оповещаем отправителя
                const senderUsername = updatedMessage.sender.replace('@', '');
                const senderWs = this.connectedUsers.get(senderUsername);
                if (senderWs) {
                    senderWs.send(JSON.stringify({
                        type: 'message_seen',
                        chatId,
                        messageId,
                        seenBy: username,
                        seenAt: new Date().toISOString()
                    }));
                }
            }
        }
    }
    
    broadcastToChat(chatId, message, excludeUsername = null) {
        const chat = this.db.chats.get(chatId);
        if (!chat) return;
        
        chat.members.forEach(member => {
            const username = member.replace('@', '');
            if (username !== excludeUsername) {
                const ws = this.connectedUsers.get(username);
                if (ws && ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify(message));
                }
            }
        });
    }
    
    broadcastStatus(username, status) {
        const user = this.db.getUserByUsername(username);
        if (!user) return;
        
        user.status = status;
        user.lastSeen = new Date().toISOString();
        
        const statusMessage = {
            type: 'status_change',
            username,
            status,
            lastSeen: user.lastSeen
        };
        
        // Рассылаем всем подключенным пользователям
        for (const [user, socket] of this.connectedUsers.entries()) {
            if (user !== username && socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify(statusMessage));
            }
        }
    }
    
    handleDisconnect(ws) {
        // Находим username по соединению
        let username = null;
        for (const [user, socket] of this.connectedUsers.entries()) {
            if (socket === ws) {
                username = user;
                this.connectedUsers.delete(user);
                break;
            }
        }
        
        if (username) {
            console.log(`User ${username} disconnected`);
            this.broadcastStatus(username, 'offline');
        }
    }
    
    // HTTP обработчики
    
    handleGetChats(req, res) {
        try {
            const url = new URL(req.url, `http://${req.headers.host}`);
            const username = url.searchParams.get('username');
            
            if (!username) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Username is required' }));
                return;
            }
            
            const chats = this.db.getChatsForUser(username);
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: true,
                chats
            }));
        } catch (error) {
            console.error('Error getting chats:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'Server error' }));
        }
    }
    
    handleGetMessages(req, res) {
        try {
            const chatId = req.url.split('/')[3];
            const messages = this.db.getMessages(chatId);
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: true,
                messages
            }));
        } catch (error) {
            console.error('Error getting messages:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'Server error' }));
        }
    }
    
    handleSendMessage(req, res) {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            try {
                const { chatId, sender, text } = JSON.parse(body);
                
                if (!chatId || !sender || !text) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: 'Missing required fields' }));
                    return;
                }
                
                // Добавляем сообщение в базу данных
                const newMessage = this.db.addMessage(chatId, {
                    text,
                    sender: `@${sender}`
                });
                
                if (!newMessage) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: 'Chat not found' }));
                    return;
                }
                
                // Оповещаем через WebSocket
                this.broadcastToChat(chatId, {
                    type: 'new_message',
                    message: newMessage
                });
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: true,
                    messageId: newMessage.id
                }));
                
            } catch (error) {
                console.error('Error handling send message:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Server error' }));
            }
        });
    }
    
    handleCreateChat(req, res) {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            try {
                const { type, name, members, creator } = JSON.parse(body);
                
                if (!type || !members || !creator) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: 'Missing required fields' }));
                    return;
                }
                
                const chatName = name || members.map(m => m.replace('@', '')).join(', ');
                
                const newChat = this.db.createChat({
                    type,
                    name: chatName,
                    avatarColor: this.db.getRandomColor(),
                    members: [...members, `@${creator}`]
                });
                
                // Оповещаем всех участников через WebSocket
                newChat.members.forEach(member => {
                    const username = member.replace('@', '');
                    const ws = this.connectedUsers.get(username);
                    if (ws && ws.readyState === WebSocket.OPEN) {
                        ws.send(JSON.stringify({
                            type: 'chat_created',
                            chat: newChat
                        }));
                    }
                });
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: true,
                    chat: newChat
                }));
                
            } catch (error) {
                console.error('Error creating chat:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Server error' }));
            }
        });
    }
    
    handleRegister(req, res) {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            try {
                const { phone, firstName, lastName, username } = JSON.parse(body);
                
                if (!phone || !firstName || !username) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: 'Missing required fields' }));
                    return;
                }
                
                // Проверяем, существует ли уже пользователь
                if (this.db.getUserByUsername(username)) {
                    res.writeHead(409, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: 'Username already exists' }));
                    return;
                }
                
                // Создаем нового пользователя
                const user = this.db.createUser({
                    phone,
                    firstName,
                    lastName,
                    username: username.toLowerCase(),
                    displayName: lastName ? `${firstName} ${lastName}` : firstName
                });
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: true,
                    user
                }));
                
            } catch (error) {
                console.error('Error registering user:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Server error' }));
            }
        });
    }
    
    handleSearchUsers(req, res) {
        try {
            const query = req.url.split('/')[4];
            
            if (!query) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Search query is required' }));
                return;
            }
            
            const users = this.db.searchUsers(query);
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: true,
                users
            }));
        } catch (error) {
            console.error('Error searching users:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'Server error' }));
        }
    }
    
    handleGetUser(req, res) {
        try {
            const username = req.url.split('/')[3];
            
            if (!username) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Username is required' }));
                return;
            }
            
            const user = this.db.getUserByUsername(username);
            
            if (!user) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'User not found' }));
                return;
            }
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: true,
                user
            }));
        } catch (error) {
            console.error('Error getting user:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'Server error' }));
        }
    }
    
    handleGetOnlineUsers(req, res) {
        try {
            const onlineUsers = Array.from(this.connectedUsers.keys());
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: true,
                users: onlineUsers
            }));
        } catch (error) {
            console.error('Error getting online users:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'Server error' }));
        }
    }
}

// Запуск сервера
new NeoGramServer();