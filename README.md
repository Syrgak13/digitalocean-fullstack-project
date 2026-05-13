# DigitalOcean Full-Stack Lab

Готовый шаблон для лабораторной работы:
- Frontend: React + Vite
- Backend: Node.js + Express
- Database: PostgreSQL
- Reverse proxy: Nginx
- Deploy: Docker Compose + GitHub Actions

## Структура проекта

```text
.
├── backend
├── frontend
├── nginx.conf
├── docker-compose.yml
└── .github/workflows/deploy.yml
```

## Что делает приложение

- `GET /api/health` — проверка, что backend и PostgreSQL работают
- `GET /api/notes` — список записей из PostgreSQL
- `POST /api/notes` — добавление новой записи
- Frontend отображает список записей и позволяет добавлять новые

## Запуск локально

```bash
docker compose up --build
```

Открой:

```text
http://localhost
```

## Развёртывание на DigitalOcean

### 1. Подготовь сервер
- Создай Droplet с Ubuntu
- Подключись по SSH
- Установи Docker и Docker Compose

### 2. Залей проект в GitHub
- Создай репозиторий
- Залей туда этот проект

### 3. На сервере
```bash
git clone https://github.com/USERNAME/REPO.git
cd REPO
docker compose up -d --build
```

### 4. Проверка
- `http://YOUR_SERVER_IP` — открывает frontend
- `http://YOUR_SERVER_IP/api/health` — отвечает backend

## Что сдавать преподавателю
- URL репозитория
- IP адрес сервера
- Скрин `docker ps`
- Скрин успешного GitHub Actions deploy
