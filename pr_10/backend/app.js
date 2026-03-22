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
    { id: nanoid(6), title: 'Ноутбук Start', category: 'Ноутбуки', description: 'Универсальная модель для повседневных задач', price: 56990 },
    { id: nanoid(6), title: 'Смартфон Lite', category: 'Смартфоны', description: 'Смартфон для звонков, фото и приложений', price: 21990 }
];

function generateAccessToken(user) {
    return jwt.sign(
        {
            sub: user.id,
            email: user.email
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
            email: user.email
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

app.post('/api/auth/register', async (req, res) => {
    const { email, first_name, last_name, password } = req.body;

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
        password: await bcrypt.hash(password, 10)
    };

    users.push(user);

    res.status(201).json({
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name
    });
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Укажите email и пароль' });
    }

    const user = users.find(item => item.email === email);

    if (!user) {
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

        if (!user) {
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
        last_name: user.last_name
    });
});

app.get('/api/products', authMiddleware, (req, res) => {
    res.json(products);
});

app.post('/api/products', authMiddleware, (req, res) => {
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

app.get('/api/products/:id', authMiddleware, (req, res) => {
    const product = products.find(item => item.id === req.params.id);

    if (!product) {
        return res.status(404).json({ error: 'Товар не найден' });
    }

    res.json(product);
});

app.put('/api/products/:id', authMiddleware, (req, res) => {
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

app.delete('/api/products/:id', authMiddleware, (req, res) => {
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
