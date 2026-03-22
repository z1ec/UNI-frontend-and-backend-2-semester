const express = require('express');
const cors = require('cors');
const { nanoid } = require('nanoid');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const port = 3000;

app.use(cors({
    origin: 'http://localhost:3001',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type']
}));
app.use(express.json());

let products = [
    { id: nanoid(6), title: 'Ноутбук Air 13', category: 'Ноутбуки', description: 'Легкий ноутбук для учебы и работы', price: 64990, stock: 6 },
    { id: nanoid(6), title: 'Ноутбук Pro 16', category: 'Ноутбуки', description: 'Производительная модель для сложных задач', price: 124990, stock: 4 },
    { id: nanoid(6), title: 'Смартфон Nova', category: 'Смартфоны', description: 'Смартфон с ярким дисплеем и хорошей камерой', price: 39990, stock: 8 },
    { id: nanoid(6), title: 'Планшет Note', category: 'Планшеты', description: 'Планшет для заметок, фильмов и учебы', price: 28990, stock: 7 },
    { id: nanoid(6), title: 'Монитор View 24', category: 'Мониторы', description: 'Монитор с IPS матрицей и тонкими рамками', price: 15990, stock: 9 },
    { id: nanoid(6), title: 'Игровая мышь Flash', category: 'Аксессуары', description: 'Мышь с точным сенсором и подсветкой', price: 3490, stock: 15 },
    { id: nanoid(6), title: 'Клавиатура Soft', category: 'Аксессуары', description: 'Тихая клавиатура для офиса и дома', price: 4190, stock: 11 },
    { id: nanoid(6), title: 'Наушники Wave', category: 'Аудио', description: 'Беспроводные наушники с глубоким звуком', price: 7990, stock: 13 },
    { id: nanoid(6), title: 'Колонка Beat', category: 'Аудио', description: 'Портативная колонка для прогулок и поездок', price: 5990, stock: 10 },
    { id: nanoid(6), title: 'Веб-камера Stream', category: 'Аксессуары', description: 'Камера для звонков и онлайн-занятий', price: 4590, stock: 5 }
];

function findProductOr404(id, res) {
    const product = products.find(item => item.id === id);

    if (!product) {
        res.status(404).json({ error: 'Товар не найден' });
        return null;
    }

    return product;
}

const swaggerSpec = swaggerJsdoc({
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API интернет-магазина',
            version: '1.0.0',
            description: 'CRUD API для управления товарами'
        },
        servers: [
            {
                url: `http://localhost:${port}`
            }
        ]
    },
    apis: ['./app.js']
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - title
 *         - category
 *         - description
 *         - price
 *         - stock
 *       properties:
 *         id:
 *           type: string
 *         title:
 *           type: string
 *         category:
 *           type: string
 *         description:
 *           type: string
 *         price:
 *           type: number
 *         stock:
 *           type: integer
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Получить список товаров
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Список товаров
 */
app.get('/api/products', (req, res) => {
    res.json(products);
});

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Получить товар по id
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Товар найден
 *       404:
 *         description: Товар не найден
 */
app.get('/api/products/:id', (req, res) => {
    const product = findProductOr404(req.params.id, res);

    if (!product) {
        return;
    }

    res.json(product);
});

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Создать товар
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: Товар создан
 */
app.post('/api/products', (req, res) => {
    const { title, category, description, price, stock } = req.body;

    if (!title || !category || !description || price === undefined || stock === undefined) {
        return res.status(400).json({ error: 'Заполните все поля товара' });
    }

    const product = {
        id: nanoid(6),
        title: title.trim(),
        category: category.trim(),
        description: description.trim(),
        price: Number(price),
        stock: Number(stock)
    };

    products.push(product);
    res.status(201).json(product);
});

/**
 * @swagger
 * /api/products/{id}:
 *   patch:
 *     summary: Обновить товар
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Товар обновлен
 *       404:
 *         description: Товар не найден
 */
app.patch('/api/products/:id', (req, res) => {
    const product = findProductOr404(req.params.id, res);

    if (!product) {
        return;
    }

    const { title, category, description, price, stock } = req.body;

    if (title !== undefined) {
        product.title = title.trim();
    }

    if (category !== undefined) {
        product.category = category.trim();
    }

    if (description !== undefined) {
        product.description = description.trim();
    }

    if (price !== undefined) {
        product.price = Number(price);
    }

    if (stock !== undefined) {
        product.stock = Number(stock);
    }

    res.json(product);
});

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Удалить товар
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Товар удален
 *       404:
 *         description: Товар не найден
 */
app.delete('/api/products/:id', (req, res) => {
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
