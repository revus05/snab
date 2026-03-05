Этот план представляет собой детальный список шагов для создания приложения на основе указанного стека. Приложение предназначено для склада по торговле тканями, техническими тканями и войлоком. Мы используем современный стек с последними версиями зависимостей. Архитектура следует Feature-Sliced Design (FSD), где код организуется по фичам (например, entities, features, widgets, pages, app).
План разделен на этапы: от инициализации проекта до тестирования и деплоя. Каждый шаг описан максимально подробно, включая команды, файлы и конфигурации. Предполагаем использование базы данных (например, Prisma с PostgreSQL для простоты; если нужно изменить, скорректируйте). Для хранения данных (пользователи, заказы, продукты, заявки) потребуется БД. Все переменные окружения (env) будут вынесены в .env файл.
Этап 1: Инициализация проекта и настройка окружения

Установить Bun как runtime: Запустить curl -fsSL https://bun.sh/install | bash (если не установлен). Проверить версию: bun --version.
Создать новый Next.js проект: bun create next-app@latest warehouse-app --app --typescript --tailwind --eslint. Выбрать App Router.
Перейти в директорию проекта: cd warehouse-app.
Обновить зависимости до последних версий: bun update.
Установить дополнительные зависимости:
Shadcn UI: bun add shadcn-ui@latest.
Lucide-icons: bun add lucide-react@latest.
Next-themes: bun add next-themes@latest.
JWT для аутентификации: bun add jsonwebtoken@latest и bun add @types/jsonwebtoken --dev.
Cloudinary для загрузки изображений: bun add cloudinary@latest и bun add next-cloudinary@latest (для интеграции с Next.js).
Grammy.js для Telegram бота: bun add grammy@latest.
Prisma для БД: bun add prisma@latest и bun add @prisma/client@latest. Инициализировать: bunx prisma init.
Другие: bun add bcryptjs@latest (для хэширования паролей), bun add axios@latest (для API вызовов если нужно), bun add zod@latest (для валидации форм).

Настроить Tailwind CSS v4: В tailwind.config.js добавить конфигурацию для Shadcn UI и Lucide. Убедиться, что content включает все пути к компонентам.
Создать .env файл: Добавить переменные:
DATABASE_URL=postgres://user:pass@localhost:5432/warehouse (для Prisma).
JWT_SECRET=your-secret-key (для JWT).
CLOUDINARY_CLOUD_NAME=your-cloud-name.
CLOUDINARY_API_KEY=your-api-key.
CLOUDINARY_API_SECRET=your-api-secret.
TELEGRAM_BOT_TOKEN=your-bot-token.
TELEGRAM_CHAT_ID=your-chat-id.

Настроить Feature-Sliced Design: Создать директории в src/:
app/ (глобальные настройки).
entities/ (модели данных: user, product, order, request).
features/ (фичи: auth, profile, orders, products, notifications).
widgets/ (компоненты: cards, forms).
pages/ (страницы: home, products, profile).
shared/ (общие: ui, lib, api).

Настроить теминг: В app/layout.tsx обернуть в ThemeProvider из next-themes. Добавить переключатель тем в хедер или сайдбар.
Настроить responsive навигацию: Создать компонент Sidebar для десктопа (aside) и BottomNav для мобильного (использовать media queries в Tailwind). Использовать Shadcn для меню.

Этап 2: Настройка базы данных и моделей

Настроить Prisma: В prisma/schema.prisma определить модели:
User: id, email (unique), firstName, lastName, password (hashed), role (enum: USER, ADMIN), avatarUrl (optional).
Product: id, name, description, images (array of strings), stock (number).
Order: id, userId, createdAt, products (relation: many-to-many или array с quantities).
RestockRequest: id, productId, quantity, createdAt, status (enum: PENDING, APPROVED, REJECTED).

Сгенерировать миграции: bunx prisma migrate dev --name init.
Создать seed скрипт: В prisma/seed.ts добавить тестовые данные для пользователей, продуктов, заказов. Запустить: bunx prisma db seed.
Реализовать API routes для CRUD: В app/api/ создать роуты (используя Next API Routes):
/api/users: GET (получить пользователей для админа), POST (регистрация).
/api/auth: POST (логин, возвращает JWT).
/api/products: GET (список), POST (создать, только админ), PUT (обновить).
/api/orders: GET (список для пользователя).
/api/restock: POST (создать заявку), GET (список для админа).

В каждом API route: Проверить аутентификацию с JWT (использовать middleware). Для админ-действий проверить role.

Этап 3: Реализация аутентификации и профиля

Создать фичи для auth в features/auth/:
Формы регистрации и логина: Использовать Shadcn UI формы с Zod валидацией. Поля: email, password, firstName, lastName (для регистрации).
API для регистрации: Хэшировать пароль с bcryptjs, сохранить в БД, сгенерировать JWT.
API для логина: Проверить credentials, сгенерировать JWT.
Хранить JWT в cookies (использовать cookies() из Next.js).

Защитить роуты: Создать middleware в middleware.ts для проверки JWT на защищенных страницах.
Страница профиля (pages/profile/page.tsx): Форма для обновления имени/фамилии, загрузка аватара на Cloudinary (использовать CldUploadWidget из next-cloudinary). Сохранить avatarUrl в БД.
Добавить роль ADMIN: В регистрации по умолчанию USER; админ создается вручную в seed.

Этап 4: Реализация главной страницы (заказы)

Создать страницу / (app/page.tsx): Fetch заказов из API (используя fetch или axios в Server Components).
Отобразить список заказов: Использовать Shadcn Card для каждой. Внутри: название продукта(ов), количество(я), дата. Если несколько продуктов - список внутри карты.
Клик на продукт в заказе: Переход на /orders/[orderId]/products/[productId] (динамический роут).
На странице продукта в заказе: Показать детали продукта, требуемое количество. Кнопка "Создать заявку на пополнение": Форма с quantity, POST в /api/restock.

Этап 5: Реализация страницы продуктов

Создать страницу /products (app/products/page.tsx): Fetch списка продуктов.
Для админа: Форма создания продукта (Shadcn UI): поля name, description, stock. Загрузка изображений: Несколько CldUploadWidget, сохранять URLs в array.
Интеграция Cloudinary: В API route для создания продукта использовать cloudinary SDK для загрузки (multipart/form-data).
Отобразить продукты: Карточки с именем, описанием, изображениями (использовать CldImage), stock.

Этап 6: Реализация уведомлений и Telegram бота

Колокольчик в хедере: Компонент NotificationsBell в widgets/header/. Fetch заявок на пополнение (только для админа). Использовать Shadcn DropdownMenu для показа списка.
При создании заявки: В API /api/restock после сохранения в БД, инициализировать Grammy бот:
Импортировать const { Bot } = require('grammy');.
const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN);.
await bot.api.sendMessage(process.env.TELEGRAM_CHAT_ID, 'Новая заявка: продукт ${product.name}, количество ${quantity}');.

Обработать ошибки: Если бот не отправит, логировать, но не прерывать создание заявки.

Этап 7: Навигация и теминг

Sidebar: В widgets/sidebar/ создать компонент с ссылками на страницы (Home, Products, Profile). Видим на десктопе (> md в Tailwind).
BottomNav: В widgets/bottom-nav/ создать меню с иконками (Lucide) для мобильного (< md).
В layout.tsx: Добавить провайдер для тем, переключатель (Shadcn Toggle).
Убедиться, что все страницы responsive: Использовать Tailwind classes (flex, grid).