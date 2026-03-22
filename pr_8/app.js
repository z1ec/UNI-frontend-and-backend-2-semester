const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { nanoid } = require('nanoid');

const app = express();
const port = 3000;
const jwtSecret = 'access_secret';

app.use(express.json());

let users = [];
let products = [
    { id: nanoid(6), title: 'Смартфон X', category: 'Электроника', description: 'Смартфон с AMOLED экраном', price: 45990 },
    { id: nanoid(6), title: 'Клавиатура Slim', category: 'Аксессуары', description: 'Тонкая клавиатура для дома', price: 2990 }
];

function authMiddleware(req, res, next) {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
        return res.status(401).json({ error: 'Требуется токен авторизации' });
    }

    try {
        req.user = jwt.verify(token, jwtSecret);
        next();
    } catch (error) {
        res.status(401).json({ error: 'Недействительный токен' });
    }
}

app.post('/api/auth/register', async (req, res) => {
    const { email, first_name, last_name, password } = req.body;

    if (!email || !first_name || !last_name || !password) {
        return res.status(400).json({ error: 'Заполните все поля пользователя' });
    }

    if (users.some(user => user.email === email)) {
        return res.status(409).json({ error: 'Пользователь уже существует' });
    }

    const newUser = {
        id: nanoid(6),
        email,
        first_name,
        last_name,
        password: await bcrypt.hash(password, 10)
    };

    users.push(newUser);

    res.status(201).json({
        id: newUser.id,
        email: newUser.email,
        first_name: newUser.first_name,
        last_name: newUser.last_name
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

    const accessToken = jwt.sign(
        {
            sub: user.id,
            email: user.email
        },
        jwtSecret,
        {
            expiresIn: '15m'
        }
    );

    res.json({ accessToken });
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

app.post('/api/products', (req, res) => {
    const { title, category, description, price } = req.body;

    if (!title || !category || !description || price === undefined) {
        return res.status(400).json({ error: 'Заполните поля товара' });
    }

    const newProduct = {
        id: nanoid(6),
        title,
        category,
        description,
        price: Number(price)
    };

    products.push(newProduct);
    res.status(201).json(newProduct);
});

app.get('/api/products', (req, res) => {
    res.json(products);
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

    product.title = title;
    product.category = category;
    product.description = description;
    product.price = Number(price);

    res.json(product);
});

app.delete('/api/products/:id', authMiddleware, (req, res) => {
    const productIndex = products.findIndex(item => item.id === req.params.id);

    if (productIndex === -1) {
        return res.status(404).json({ error: 'Товар не найден' });
    }

    products.splice(productIndex, 1);
    res.json({ message: 'Товар удален' });
});

app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});
