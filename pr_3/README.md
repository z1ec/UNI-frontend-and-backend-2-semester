# Практическая работа 3

В папке собран пример API пользователей для тестирования JSON и Postman.

## Содержимое

- `app.js` — сервер на Express c CRUD для пользователей
- `examples.json` — примеры структуры JSON
- `users-api.postman_collection.json` — коллекция Postman для локального API и внешних API

## Запуск

```bash
npm install
npm start
```

После запуска сервер доступен по адресу `http://localhost:3000`.

## Маршруты

- `GET /users`
- `GET /users/:id`
- `POST /users`
- `PUT /users/:id`
- `PATCH /users/:id`
- `DELETE /users/:id`
