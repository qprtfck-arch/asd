# StudyBridge — EdTech MVP

> Умная подготовка к ЕГЭ, олимпиадам и поступлению в топовые университеты

![StudyBridge](https://img.shields.io/badge/status-MVP-brightgreen) ![Tech](https://img.shields.io/badge/stack-React%20%2B%20Tailwind-6366f1)

## О проекте

**StudyBridge** — образовательная платформа, которая помогает школьникам переходить от бесплатных вебинаров к реальному результату: высоким баллам ЕГЭ, победам в олимпиадах и поступлению в топовые университеты.

Цель MVP — продемонстрировать продукт инвесторам и конвертировать бесплатных пользователей в платных через доверие, персонализацию и наглядную демонстрацию ценности.

## Демо

Откройте `index.html` в браузере или запустите локальный сервер:

```bash
python3 -m http.server 3000
# → http://localhost:3000
```

## Функциональность

### Лендинг
| Секция | Описание |
|--------|----------|
| **Hero** | Анимированный заголовок, live-mockup студенческого дашборда, стрик-система |
| **Почему бесплатного недостаточно** | 4 карточки с болями пользователей и статистикой |
| **Smart Learning Path** | 6 ключевых фич + интерактивный мини-дашборд с роадмапом |
| **Social Proof** | Отзывы, метрики поступлений, карточки "до/после" с баллами ЕГЭ |
| **Freemium Flow** | Визуальный timeline: Вебинар → Диагностика → Пробная неделя → Premium |
| **Pricing** | 3 тарифа: Free / Pro (₽2 990/мес) / Mentor+ (₽5 990/мес) |
| **Final CTA** | Конверсионная секция с формой получения персонального плана |

### Интерактивные страницы
- **Student Dashboard** — прогресс по темам, трекер задач, рейтинг, карточка ментора
- **Mentor Booking** — каталог менторов с рейтингом, выбор и бронирование сессии
- **Payment** — выбор тарифа, форма оплаты
- **Login / Signup** — авторизация с вкладками и OAuth (Google, VK)
- **Onboarding Quiz** — 5-шаговый опрос с генерацией персонального плана

## Стек

- **React 18** (CDN, no build step)
- **Tailwind CSS** (CDN с кастомной конфигурацией)
- **Babel Standalone** (JSX в браузере)
- Чистая компонентная архитектура, zero dependencies

## Запуск

```bash
# Клонировать репозиторий
git clone https://github.com/qprtfck-arch/asd.git
cd asd

# Запустить сервер
python3 -m http.server 3000

# Открыть в браузере
open http://localhost:3000
```

Или просто открой `index.html` двойным кликом — React + Tailwind загрузятся с CDN.

## Структура компонентов

```
App
├── Navbar              — sticky nav, dark mode toggle, mobile menu
├── Hero                — hero section с animated dashboard mockup
├── WhyFree             — 4 problem cards
├── SmartPath           — features grid + mini dashboard
├── SocialProof         — stats, reviews, before/after cards
├── FreemiumFlow        — visual timeline (freemium → premium)
├── Pricing             — 3-tier pricing cards
├── FinalCTA            — conversion section
├── Footer
├── Modal               — login/signup + onboarding quiz
├── DashboardPage       — student dashboard (separate page)
├── MentorPage          — mentor catalogue & booking
└── PaymentPage         — payment form
```

## Дизайн

- Светлый интерфейс с синими/фиолетовыми акцентами (`#4f46e5` → `#7e22ce`)
- **Dark mode** — переключатель в навбаре
- Mobile-first, полностью адаптивный
- Hover-анимации, floating blob backgrounds, glassmorphism
- Вдохновлён Notion + Duolingo + Coursera

## Лицензия

MIT
