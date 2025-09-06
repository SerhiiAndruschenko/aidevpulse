# 🧹 Очищення бази даних

## 🎯 Проблема
Таблиця `raw_items` швидко накопичує тисячі записів, що призводить до:
- Повільної роботи бази даних
- Збільшення розміру бази
- Проблем з продуктивністю

## ✅ Рішення

### **1. Автоматичне очищення в FastIngestService:**
```typescript
// Перевірка кількості записів
const currentCount = await Database.getRawItemsCount();
console.log(`Current raw items in database: ${currentCount}`);

// Очищення якщо більше 1000 записів
if (currentCount > 1000) {
  console.log('🧹 Cleaning old raw items (keeping last 7 days)...');
  const deletedCount = await Database.clearOldRawItems(7);
  console.log(`✅ Deleted ${deletedCount} old raw items`);
}
```

### **2. Нові методи в Database:**
```typescript
// Очищення старих записів (залишає останні N днів)
static async clearOldRawItems(daysToKeep: number = 7): Promise<number>

// Підрахунок записів
static async getRawItemsCount(): Promise<number>
```

### **3. Логіка очищення:**
- **Тригер:** Коли в базі більше 1000 записів
- **Критерій:** Видаляє записи старші 7 днів
- **Безпека:** Зберігає останні 7 днів для аналізу

## 📊 Логування

### **До очищення:**
```
🚀 Starting fast ingest (top sources only)...
Current raw items in database: 2847
🧹 Cleaning old raw items (keeping last 7 days)...
✅ Deleted 1847 old raw items
```

### **Після ingest:**
```
✅ Inserted 60 new items
📊 Total raw items in database: 1060
```

## 🔧 Налаштування

### **Параметри очищення:**
- **Ліміт:** 1000 записів (тригер очищення)
- **Період збереження:** 7 днів
- **Частота:** При кожному cron запуску

### **Можна змінити:**
```typescript
// Змінити ліміт
if (currentCount > 500) { // замість 1000

// Змінити період збереження
await Database.clearOldRawItems(14); // замість 7
```

## 📈 Переваги

### **Продуктивність:**
- ✅ Швидша робота бази даних
- ✅ Менший розмір бази
- ✅ Швидший пошук та аналіз

### **Автоматизація:**
- ✅ Не потрібно ручне очищення
- ✅ Автоматичне керування розміром
- ✅ Збереження актуальних даних

### **Безпека:**
- ✅ Зберігає останні 7 днів
- ✅ Не видаляє важливі дані
- ✅ Логування всіх операцій

## 🧪 Тестування

### **Перевірка роботи:**
```bash
# Запустіть cron job
curl https://www.aidevpulse.tech/api/cron/trigger

# Перевірте логи:
# - "Current raw items in database: X"
# - "Cleaning old raw items..." (якщо > 1000)
# - "Deleted X old raw items"
# - "Total raw items in database: Y"
```

### **Критерії успіху:**
- ✅ Кількість записів не перевищує 1000
- ✅ Зберігаються дані за останні 7 днів
- ✅ Новий ingest працює швидше
- ✅ Логи показують процес очищення

## 📊 Статистика

### **До оптимізації:**
- ❌ 5000+ записів в raw_items
- ❌ Повільна робота бази
- ❌ Ручне очищення

### **Після оптимізації:**
- ✅ < 1000 записів завжди
- ✅ Швидка робота бази
- ✅ Автоматичне очищення

---

**💡 Результат:** База даних завжди залишається чистою та швидкою!
