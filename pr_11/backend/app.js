const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { nanoid } = require('nanoid');

const app = express();
const port = 3000;
const accessSecret = 'access_secret';
const refreshSecret = 'refresh_secret';

app.use(cors({
    origin: 'http://localhost:3001',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-refresh-token']
}));
app.use(express.json());

let users = [];
let refreshTokens = new Set();
let products = [
    { id: nanoid(6), title: 'Ноутбук Office', category: 'Ноутбуки', description: 'Ноутбук для учебы и офиса', price: 51990 },
    { id: nanoid(6), title: 'Наушники Studio', category: 'Аудио', description: 'Полноразмерные наушники для музыки', price: 8990 }
];

function generateAccessToken(user) {
    return jwt.sign(
        {
            sub: user.id,
            email: user.email,
            role: user.role
        },
        accessSecret,
        {
            expiresIn: '15m'
        }
    );
}

function generateRefreshToken(user) {
    return jwt.sign(
        {
            sub: user.id,
            email: user.email,
            role: user.role
        },
        refreshSecret,
        {
            expiresIn: '7d'
        }
    );
}

function authMiddleware(req, res, next) {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
        return res.status(401).json({ error: 'Требуется авторизация' });
    }

    try {
        req.user = jwt.verify(token, accessSecret);
        next();
    } catch (error) {
        res.status(401).json({ error: 'Токен недействителен' });
    }
}

function roleMiddleware(allowedRoles) {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Недостаточно прав' });
        }

        next();
    };
}

app.post('/api/auth/register', async (req, res) => {
    const { email, first_name, last_name, password, role } = req.body;

    if (!email || !first_name || !last_name || !password) {
        return res.status(400).json({ error: 'Заполните все поля' });
    }

    if (users.some(user => user.email === email)) {
        return res.status(409).json({ error: 'Пользователь уже существует' });
    }

    const user = {
        id: nanoid(6),
        email,
        first_name,
        last_name,
        password: await bcrypt.hash(password, 10),
        role: role || 'user',
        blocked: false
    };

    users.push(user);

    res.status(201).json({
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role
    });
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Укажите email и пароль' });
    }

    const user = users.find(item => item.email === email);

    if (!user || user.blocked) {
        return res.status(401).json({ error: 'Неверные учетные данные' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
        return res.status(401).json({ error: 'Неверные учетные данные' });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    refreshTokens.add(refreshToken);

    res.json({ accessToken, refreshToken });
});

app.post('/api/auth/refresh', (req, res) => {
    const refreshToken = req.headers['x-refresh-token'];

    if (!refreshToken) {
        return res.status(400).json({ error: 'Не передан refresh token' });
    }

    if (!refreshTokens.has(refreshToken)) {
        return res.status(401).json({ error: 'Недействительный refresh token' });
    }

    try {
        const payload = jwt.verify(refreshToken, refreshSecret);
        const user = users.find(item => item.id === payload.sub);

        if (!user || user.blocked) {
            return res.status(401).json({ error: 'Пользователь не найден' });
        }

        refreshTokens.delete(refreshToken);

        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);

        refreshTokens.add(newRefreshToken);

        res.json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        });
    } catch (error) {
        res.status(401).json({ error: 'Refresh token истек или недействителен' });
    }
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
    const user = users.find(item => item.id === req.user.sub);

    if (!user) {
        return res.status(404).json({ error: 'Пользователь не найден' });
    }

    res.json({
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role
    });
});

app.get('/api/users', authMiddleware, roleMiddleware(['admin']), (req, res) => {
    res.json(users.map(user => ({
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        blocked: user.blocked
    })));
});

app.get('/api/users/:id', authMiddleware, roleMiddleware(['admin']), (req, res) => {
    const user = users.find(item => item.id === req.params.id);

    if (!user) {
        return res.status(404).json({ error: 'Пользователь не найден' });
    }

    res.json({
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        blocked: user.blocked
    });
});

app.put('/api/users/:id', authMiddleware, roleMiddleware(['admin']), (req, res) => {
    const user = users.find(item => item.id === req.params.id);

    if (!user) {
        return res.status(404).json({ error: 'Пользователь не найден' });
    }

    const { first_name, last_name, role } = req.body;

    if (first_name) {
        user.first_name = first_name;
    }

    if (last_name) {
        user.last_name = last_name;
    }

    if (role) {
        user.role = role;
    }

    res.json({
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        blocked: user.blocked
    });
});

app.delete('/api/users/:id', authMiddleware, roleMiddleware(['admin']), (req, res) => {
    const user = users.find(item => item.id === req.params.id);

    if (!user) {
        return res.status(404).json({ error: 'Пользователь не найден' });
    }

    user.blocked = true;
    res.json({ message: 'Пользователь заблокирован' });
});

app.post('/api/products', authMiddleware, roleMiddleware(['seller', 'admin']), (req, res) => {
    const { title, category, description, price } = req.body;

    if (!title || !category || !description || price === undefined) {
        return res.status(400).json({ error: 'Заполните поля товара' });
    }

    const product = {
        id: nanoid(6),
        title: title.trim(),
        category: category.trim(),
        description: description.trim(),
        price: Number(price)
    };

    products.push(product);
    res.status(201).json(product);
});

app.get('/api/products', authMiddleware, roleMiddleware(['user', 'seller', 'admin']), (req, res) => {
    res.json(products);
});

app.get('/api/products/:id', authMiddleware, roleMiddleware(['user', 'seller', 'admin']), (req, res) => {
    const product = products.find(item => item.id === req.params.id);

    if (!product) {
        return res.status(404).json({ error: 'Товар не найден' });
    }

    res.json(product);
});

app.put('/api/products/:id', authMiddleware, roleMiddleware(['seller', 'admin']), (req, res) => {
    const product = products.find(item => item.id === req.params.id);

    if (!product) {
        return res.status(404).json({ error: 'Товар не найден' });
    }

    const { title, category, description, price } = req.body;

    if (!title || !category || !description || price === undefined) {
        return res.status(400).json({ error: 'Заполните поля товара' });
    }

    product.title = title.trim();
    product.category = category.trim();
    product.description = description.trim();
    product.price = Number(price);

    res.json(product);
});

app.delete('/api/products/:id', authMiddleware, roleMiddleware(['admin']), (req, res) => {
    const exists = products.some(item => item.id === req.params.id);

    if (!exists) {
        return res.status(404).json({ error: 'Товар не найден' });
    }

    products = products.filter(item => item.id !== req.params.id);
    res.json({ message: 'Товар удален' });
});

app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});
