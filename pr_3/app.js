const express = require('express');

const app = express();
const port = 3000;

app.use(express.json());

let users = [
    { id: 1, name: 'Петр', age: 16 },
    { id: 2, name: 'Иван', age: 18 },
    { id: 3, name: 'Дарья', age: 20 }
];

app.get('/', (req, res) => {
    res.send('Users API. Перейти в /users чтобы увидеть пользователей');
});

app.get('/users', (req, res) => {
    res.json(users);
});

app.get('/users/:id', (req, res) => {
    const user = users.find(item => item.id == req.params.id);

    if (!user) {
        return res.status(404).json({ error: 'Пользователь не найден' });
    }

    res.json(user);
});

app.post('/users', (req, res) => {
    const { name, age } = req.body;

    if (!name || age === undefined) {
        return res.status(400).json({ error: 'Укажите имя и возраст' });
    }

    const newUser = {
        id: Date.now(),
        name,
        age: Number(age)
    };

    users.push(newUser);
    res.status(201).json(newUser);
});

app.put('/users/:id', (req, res) => {
    const user = users.find(item => item.id == req.params.id);

    if (!user) {
        return res.status(404).json({ error: 'Пользователь не найден' });
    }

    const { name, age } = req.body;

    if (name !== undefined) {
        user.name = name;
    }

    if (age !== undefined) {
        user.age = Number(age);
    }

    res.json(user);
});

app.patch('/users/:id', (req, res) => {
    const user = users.find(item => item.id == req.params.id);

    if (!user) {
        return res.status(404).json({ error: 'Пользователь не найден' });
    }

    const { name, age } = req.body;

    if (name !== undefined) {
        user.name = name;
    }

    if (age !== undefined) {
        user.age = Number(age);
    }

    res.json(user);
});

app.delete('/users/:id', (req, res) => {
    const userIndex = users.findIndex(item => item.id == req.params.id);

    if (userIndex === -1) {
        return res.status(404).json({ error: 'Пользователь не найден' });
    }

    users.splice(userIndex, 1);
    res.json({ message: 'Пользователь удален' });
});

app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});
