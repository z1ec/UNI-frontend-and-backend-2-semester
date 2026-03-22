const express = require('express');
const bcrypt = require('bcrypt');
const { nanoid } = require('nanoid');

const app = express();
const port = 3000;

app.use(express.json());

let users = [];
let products = [
    { id: nanoid(6), title: 'Ноутбук Pro 14', category: 'Электроника', description: 'Компактный ноутбук для учебы и работы', price: 84990 },
    { id: nanoid(6), title: 'Игровая мышь', category: 'Аксессуары', description: 'Мышь с настраиваемой подсветкой', price: 3490 }
];

app.post('/api/auth/register', async (req, res) => {
    const { email, first_name, last_name, password } = req.body;

    if (!email || !first_name || !last_name || !password) {
        return res.status(400).json({ error: 'Заполните все поля пользователя' });
    }

    const userExists = users.some(user => user.email === email);

    if (userExists) {
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
        return res.status(404).json({ error: 'Пользователь не найден' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
        return res.status(401).json({ error: 'Неверный пароль' });
    }

    res.json({ login: true });
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

app.get('/api/products/:id', (req, res) => {
    const product = products.find(item => item.id === req.params.id);

    if (!product) {
        return res.status(404).json({ error: 'Товар не найден' });
    }

    res.json(product);
});

app.put('/api/products/:id', (req, res) => {
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

app.delete('/api/products/:id', (req, res) => {
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
