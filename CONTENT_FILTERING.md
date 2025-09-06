# 🎯 Фільтрація контенту - DEV/AI фокус

## 🎯 Мета
Генерувати статті тільки про **development** та **AI**, виключаючи gaming контент.

## ✅ Включені теми

### **Development:**
- **Frameworks:** React, Next.js, Vue, Angular, Svelte, Nuxt, Vite, Bun, Deno
- **Languages:** TypeScript, JavaScript, Node.js, Python, Rust, Go, Java, C#, PHP
- **Tools:** Webpack, Rollup, esbuild, SWC, Tailwind, Bootstrap, Sass, Less
- **Testing:** Jest, Cypress, Playwright, Testing, Linting, Prettier
- **Infrastructure:** AWS, Azure, GCP, Docker, Kubernetes, Terraform, Ansible
- **Databases:** PostgreSQL, MySQL, Redis, MongoDB, Elasticsearch, Supabase, Prisma

### **AI/ML:**
- **AI Platforms:** OpenAI, Gemini, Claude, ChatGPT, Copilot
- **ML Libraries:** TensorFlow, PyTorch, Pandas, NumPy, Scikit-learn
- **Concepts:** Machine Learning, Deep Learning, Neural Networks, LLM, GPT
- **Data Science:** Data Science, Data Analysis, Data Engineering

### **Release Keywords:**
- Release, Update, Version, Changelog, Breaking, Migration, Deprecation

## ❌ Виключені теми

### **Gaming (повністю виключено):**
- Games: Silksong, Hollow Knight, Zelda, Mario, Pokemon, Fortnite, Minecraft
- Platforms: PlayStation, Xbox, Nintendo, Steam, Epic Games
- Gaming Terms: Gaming, Gamer, Esports, Twitch, Gameplay, Game Review, Game Trailer

## 🔧 Як працює фільтрація

### **1. На рівні джерел:**
```typescript
// Виключено з FastIngestService:
- The Verge (багато gaming)
- Engadget (багато gaming)

// Залишено тільки DEV/AI джерела:
- Ars Technica (tech focus)
- OpenAI Blog (AI focus)
- GitHub repos (dev focus)
```

### **2. На рівні контенту:**
```typescript
// Фільтрація в ingest процесі
const gamingKeywords = [
  'game', 'gaming', 'gamer', 'playstation', 'xbox', 'nintendo',
  'silksong', 'hollow knight', 'zelda', 'mario', 'pokemon',
  'esports', 'twitch', 'streaming games'
];

if (gamingKeywords.some(keyword => text.includes(keyword))) {
  continue; // Skip gaming content
}
```

### **3. На рівні ранжирування:**
```typescript
// В RankingService.calculateRelevanceScore()
const hasGamingContent = gamingKeywords.some(keyword => text.includes(keyword));
if (hasGamingContent) {
  return 0; // Completely exclude gaming content
}
```

## 📊 Результати

### **До фільтрації:**
- ❌ Gaming статті: "Silksong, smacking sticks and other new indie games"
- ❌ Змішані джерела з gaming контентом
- ❌ Низька релевантність для dev аудиторії

### **Після фільтрації:**
- ✅ Тільки DEV/AI статті
- ✅ Високоякісні джерела
- ✅ Релевантний контент для розробників
- ✅ Збільшений minScore: 0.3 → 0.4

## 🎯 Приклади прийнятних статей

✅ **React 18.3.0 Released with New Features**
✅ **OpenAI Launches GPT-4 Turbo with Vision**
✅ **TypeScript 5.3 Breaking Changes Guide**
✅ **Next.js 14 Performance Improvements**
✅ **Vue 3.4 Composition API Updates**

## 🚫 Приклади виключених статей

❌ **Silksong Release Date Announced**
❌ **Best Gaming Laptops 2024**
❌ **PlayStation 5 Pro Review**
❌ **Nintendo Switch 2 Rumors**
❌ **Fortnite Chapter 5 Updates**

---

**💡 Результат:** Тепер всі статті будуть релевантними для розробників та AI ентузіастів!
