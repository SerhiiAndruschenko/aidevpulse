# 🔧 Cron Jobs Troubleshooting Guide

Якщо cron задачі в Vercel не працюють або статті не генеруються автоматично, виконайте наступні кроки для діагностики:

## 🚀 Швидка діагностика

### 1. Запустіть діагностичний скрипт

```bash
npm run diagnose:cron
```

Цей скрипт перевірить:
- ✅ Змінні середовища
- ✅ Підключення до бази даних
- ✅ Наявність таблиць
- ✅ Активні джерела даних
- ✅ Останні дані та статті
- ✅ Підключення до AI сервісу

### 2. Протестуйте cron endpoints

```bash
npm run test:cron
```

## 🔍 Детальна діагностика

### Перевірка змінних середовища

Переконайтеся, що в Vercel налаштовані всі необхідні змінні:

**Обов'язкові:**
- `DATABASE_URL` - URL підключення до PostgreSQL
- `GEMINI_API_KEY` - API ключ Google Gemini

**Опціональні:**
- `CRON_SECRET` - секретний ключ для захисту cron endpoints
- `SITE_URL` - URL вашого сайту
- `IMAGE_API_KEY` - для генерації зображень

### Перевірка бази даних

1. **Створіть таблиці:**
```bash
npm run db:migrate
```

2. **Додайте джерела даних:**
```bash
npm run db:seed
```

3. **Перевірте активні джерела:**
```sql
SELECT name, kind, url, active FROM sources WHERE active = true;
```

### Перевірка cron конфігурації

У файлі `vercel.json` має бути:

```json
{
  "crons": [
    {
      "path": "/api/cron/content-pipeline",
      "schedule": "0 6 * * *"
    },
    {
      "path": "/api/cron/quality-check", 
      "schedule": "0 8 * * *"
    }
  ]
}
```

## 🐛 Типові проблеми та рішення

### Проблема: "No active sources found"

**Рішення:**
1. Запустіть `npm run db:seed`
2. Перевірте, що джерела активні:
```sql
UPDATE sources SET active = true;
```

### Проблема: "Database connection failed"

**Рішення:**
1. Перевірте `DATABASE_URL` в Vercel
2. Переконайтеся, що база даних доступна
3. Перевірте SSL налаштування для production

### Проблема: "Gemini AI connection failed"

**Рішення:**
1. Перевірте `GEMINI_API_KEY` в Vercel
2. Переконайтеся, що API ключ валідний
3. Перевірте квоти та ліміти API

### Проблема: "No articles generated"

**Рішення:**
1. Перевірте, чи є нові дані в `items_raw`
2. Запустіть ручний тест:
```bash
curl -X POST https://your-domain.vercel.app/api/cron/content-pipeline
```

### Проблема: "Unauthorized" при тестуванні

**Рішення:**
1. Встановіть `CRON_SECRET` в Vercel
2. Використовуйте правильний заголовок:
```bash
curl -X POST https://your-domain.vercel.app/api/cron/content-pipeline \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## 🧪 Ручне тестування

### Тест 1: Перевірка підключення до бази

```bash
# Локально
npm run diagnose:cron

# На Vercel
curl https://your-domain.vercel.app/api/cron/content-pipeline
```

### Тест 2: Ручний запуск content pipeline

```bash
curl -X POST https://your-domain.vercel.app/api/cron/content-pipeline \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### Тест 3: Перевірка логів Vercel

1. Відкрийте Vercel Dashboard
2. Перейдіть до Functions
3. Перегляньте логи cron jobs

## 📊 Моніторинг

### Перевірка статусу cron jobs

1. **Vercel Dashboard** → Functions → Cron Jobs
2. Перегляньте останні виконання
3. Перевірте логи на помилки

### Перевірка даних

```sql
-- Останні статті
SELECT title, published_at, review_status 
FROM articles 
ORDER BY published_at DESC 
LIMIT 5;

-- Останні дані
SELECT title, created_at 
FROM items_raw 
ORDER BY created_at DESC 
LIMIT 10;

-- Активні джерела
SELECT name, kind, active 
FROM sources 
WHERE active = true;
```

## 🚨 Екстрені заходи

Якщо нічого не допомагає:

1. **Перезапустіть deployment:**
   - Vercel Dashboard → Deployments → Redeploy

2. **Очистіть кеш:**
   - Vercel Dashboard → Settings → Environment Variables → Save (без змін)

3. **Перевірте статус Vercel:**
   - https://vercel-status.com/

4. **Зверніться до підтримки:**
   - Vercel Support
   - GitHub Issues

## 📝 Логи для аналізу

Зберігайте логи з:
- Vercel Functions
- Database queries
- AI API responses
- Cron job executions

Це допоможе швидше знайти причину проблеми.

---

**💡 Порада:** Завжди тестуйте зміни локально перед деплоєм на Vercel!
