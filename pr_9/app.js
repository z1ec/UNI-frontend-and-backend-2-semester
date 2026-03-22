const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { nanoid } = require('nanoid');

const app = express();
const port = 3000;
const accessSecret = 'access_secret';
const refreshSecret = 'refresh_secret';

app.use(express.json());

let users = [];
let refreshTokens = new Set();

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

app.post('/api/auth/register', async (req, res) => {
    const { email, first_name, last_name, password } = req.body;

    if (!email || !first_name || !last_name || !password) {
        return res.status(400).json({ error: 'Заполните все поля пользователя' });
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

    res.json({
        accessToken,
        refreshToken
    });
});

app.post('/api/auth/refresh', (req, res) => {
    const refreshToken = req.headers['x-refresh-token'];

    if (!refreshToken) {
        return res.status(400).json({ error: 'Укажите refresh token в заголовке x-refresh-token' });
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

app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});
