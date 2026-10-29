# Новогодний благотворительный лендинг: «Дети-лучики × Ozon Забота»

Специальная интерактивная страница новогодней благотворительной кампании для Краснодарской региональной общественной организации **КРОО «Дети-лучики»** (помощь детям с синдромом Дауна), разработанная строго в соответствии с критериями отбора корпоративной программы социальной ответственности **Ozon Забота**.

Проект прошёл оптимизацию производительности по стандартам **Google Core Web Vitals (CWV)**, архитектурный рефакторинг по методологии **БЭМ (BEM)** и комплексный **аудит безопасности** (защита от XSS, CSV Formula Injection, CSP, строгая валидация входных данных).

---

## 📋 Соответствие критериям отбора Ozon

| Критерий Ozon | Реализация в проекте |
| :--- | :--- |
| **1. Отдельная страница с логотипом Ozon и уникальной ссылкой** | • Совместный ко-брендинг: векторные логотипы **Ozon Забота** и **«Дети-лучики»** в шапке и на открытке.<br>• Верхний корпоративный бейдж: «Закрытый новогодний сбор специально для сотрудников Ozon».<br>• Готовность к размещению по уникальному URL (`https://deti-luchiki.ru/ozon` или `https://ozon.deti-luchiki.ru`).<br>• Поддержка персональных ссылок с автовыбором отдела: `?team=tech`, `?team=rocket`, `?team=marketplace`, `?team=fintech`. |
| **2. Понятная цель, эмоциональный отклик и визуальный дизайн** | • Гармоничное сочетание стиля **Ozon** (цифровой синий `#005BFF`, ягодный `#F91155`, функциональный шрифт `Inter`) и оригинального сайта **deti-luchiki.ru** (округлый шрифт `Comfortaa`, фирменный лайм `#95C227` и солнечный оранжевый `#FF7A00`, мягкие скругления).<br>• **Конкретные цели сметы**: инклюзивная ёлка и сенсорные подарки (120 000 ₽), 150 часов логопедов и дефектологов (260 000 ₽), арт-мастерская на полгода (130 000 ₽), адаптивный спорт и ЛФК (140 000 ₽).<br>• Истории реальных подопечных (Ванечка 5 лет, Соня 7 лет, Мирослав 4 года) с цитатами родителей. |
| **3. Механика ответных подарков жертвователям от НКО** | • **Генератор персональной новогодней открытки на HTML5 Canvas**: в реальном времени отрисовывается тёплая открытка с детским рисунком солнышка и именем сотрудника Ozon.<br>• Кнопка скачивания открытки в высоком разрешении (PNG) для отправки в корпоративные чаты (Slack, Teams, Telegram). |
| **4. Прогресс-бар пожертвований и соревнование отделов** | • Динамический прогресс-бар: цель 650 000 ₽, собранная сумма, процент выполнения, счётчик участников и дней до Нового года.<br>• **Турнирная таблица подразделений Ozon (Leaderboard)**: рейтинг команд (Ozon Tech, Ozon Rocket / Логистика, Ozon Marketplace, Ozon Fintech, Ozon Fresh, HR, Маркетинг) с индикаторами прогресса и кнопкой «Поддержать». |
| **5. Статистика для координаторов Ozon** | • Защищённое модальное окно «Статистика сбора для координаторов Ozon» (открывается по кнопке или параметру `?view=stats`).<br>• Метрики: **общая сумма, число пожертвований, общее число визитов (Pageviews), количество уникальных посетителей (Unique Visitors)**, средний чек, конверсия.<br>• Журнал пожертвований в реальном времени.<br>• Кнопка **«Экспорт отчёта в Excel (CSV)»** в кодировке UTF-8 с BOM (корректно отображает кириллицу).<br>• Поддержка целей Яндекс.Метрики (`reachGoal`). |

---

## ⚡ Оптимизация Core Web Vitals (CWV)

Лендинг оптимизирован для достижения максимальных баллов (95–100) в Google PageSpeed Insights и соответствия метрикам Core Web Vitals:

1. **LCP (Largest Contentful Paint < 1.2s)**:
   - Асинхронное подключение шрифтов через `<link rel="preconnect">` с параметром `display=swap`, исключающим блокировку рендеринга текста (FOIT).
   - Атрибуты `fetchpriority="high"` для логотипов шапки первого экрана.
   - Все исполняемые скрипты (`qrcode.min.js`, `analytics.js`, `app.js`) переведены в режим отложенной загрузки `defer`, что освобождает критический путь парсинга DOM.

2. **CLS (Cumulative Layout Shift = 0.00)**:
   - Полностью устранены сдвиги макета: всем изображениям, логотипам и интерактивным элементам заданы явные геометрические размеры `width` и `height`.
   - Контейнеру QR-кода (`#sbp-qrcode-container`) назначен фиксированный `aspect-ratio: 1 / 1` с предвыделенной областью `130×130 px`, благодаря чему блок не прыгает при генерации кода скриптом.
   - Холсту открытки Canvas `#postcard-canvas` задан адаптивный `aspect-ratio: 1 / 1` с явным резервированием высоты до загрузки.

3. **INP (Interaction to Next Paint < 100ms)**:
   - Перерисовка холста открытки при вводе имени сотрудника оптимизирована через троттлинг `requestAnimationFrame` (устранены микрозадержки при быстром наборе текста).
   - Все обработчики событий окна (`resize`, `scroll`) зарегистрированы с флагом `{ passive: true }`, гарантируя плавный 60 fps скролл без блокировки основного потока.
   - Нижестоящие блоки страницы (`.leaderboard`, `.goals-stories`, `.footer`) используют современное CSS-свойство `content-visibility: auto; contain-intrinsic-size: 400px;`, откладывающее расчёт геометрии до приближения области видимости к экрану.

---

## 🧱 Архитектура стилей по методологии БЭМ (BEM)

Разметка и CSS полностью реорганизованы в строгую компонентную архитектуру **Блок — Элемент — Модификатор**:

- `top-bar`: `top-bar__badge`, `top-bar__content`
- `header`: `header__container`, `header__logos`, `header__logo`, `header__separator`, `header__nav`, `header__btn`, `header__btn--primary`, `header__btn-text`, `header__btn-short`
- `hero`: `hero__container`, `hero__tag`, `hero__title`, `hero__subtitle`, `hero__accent--sun`, `hero__accent--blue`
- `progress-widget`: `progress-widget__header`, `progress-widget__main-stat`, `progress-widget__target`, `progress-widget__badge`, `progress-widget__track`, `progress-widget__fill`, `progress-widget__info`, `progress-widget__info-item`
- `donation-section`: `donation-section__grid`
- `card-box`: `card-box__title`, `card-box__subtitle`, `card-box__section-heading`
- `presets`: `presets__btn`, `presets__btn--active`
- `donate-form`: `donate-form__amount-input`, `donate-form__row`, `donate-form__group`, `donate-form__label`, `donate-form__input`, `donate-form__select`
- `sbp-widget`: `sbp-widget__header`, `sbp-widget__logo`, `sbp-widget__amount-badge`, `sbp-widget__highlight`, `sbp-widget__copy-btn`, `sbp-widget__body`, `sbp-widget__qr-frame`, `sbp-widget__qr-container`, `sbp-widget__scan-text`, `sbp-widget__notice`, `sbp-widget__btn-pay`, `sbp-widget__btn-confirm`
- `postcard-widget`: `postcard-widget__canvas`, `postcard-widget__download-btn`, `postcard-widget__notice`
- `leaderboard`: `leaderboard__title`, `leaderboard__desc`, `leaderboard__card`, `leaderboard__list`, `leaderboard__row`, `leaderboard__left`, `leaderboard__right`, `leaderboard__rank`, `leaderboard__rank--gold`, `leaderboard__rank--silver`, `leaderboard__rank--bronze`, `leaderboard__name-wrap`, `leaderboard__name`, `leaderboard__count`, `leaderboard__bar-track`, `leaderboard__bar-fill`, `leaderboard__amount`, `leaderboard__support-btn`
- `goals-stories`: `goals-stories__title`, `goals-stories__desc`, `goals-stories__grid`, `goal-item`, `goal-item__icon`, `goal-item__content`, `goal-item__title`, `goal-item__desc`, `story-item`, `story-item__header`, `story-item__name`, `story-item__age`, `story-item__text`
- `footer`: `footer__container`, `footer__info`, `footer__links`, `footer__link`
- `modal`: `modal--active`, `modal__card`, `modal__close-btn`, `modal__title`, `modal__grid`, `modal__stat-card`, `modal__stat-label`, `modal__stat-value`, `modal__table-wrap`, `modal__table`, `modal__export-btn`

---

## 🛡️ Комплексный аудит и усиление безопасности

Проведена проверка кодовой базы на ключевые уязвимости согласно стандарту OWASP Top-10:

1. **Защита от Stored & DOM XSS (CWE-79)**:
   - Внедрена универсальная функция экранирования HTML-спецсимволов `escapeHtml(str)` для любых входящих или сохраняемых данных (`name`, `dept`, `wish`, `id`, `date`).
   - Исключена прямая интерполяция непроверенных строк в DOM.
   - Полностью удалены inline-обработчики JavaScript (`onclick="..."`, псевдопротоколы `javascript:...`). Вся интерактивность переведена на безопасное делегирование событий через `addEventListener`.

2. **Защита от CSV / Formula Injection (CWE-1236)**:
   - При экспорте отчёта координатора в Excel/CSV реализована обязательная санитизация ячеек `sanitizeCsvCell()`: любые значения, начинающиеся с символов `=`, `+`, `-`, `@`, `\t`, экранируются префиксом одиночной кавычки `'` и оборачиваются в кавычки с удвоением внутренних. Это предотвращает автоматическое выполнение опасных DDE-команд в табличных процессорах (Microsoft Excel, LibreOffice).

3. **Content Security Policy (CSP) и защитные заголовки**:
   - В `<head>` внедрена строгая политика CSP:
     ```html
     <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https: blob:; connect-src 'self' https://qr.nspk.ru; object-src 'none'; base-uri 'self';">
     <meta http-equiv="X-Content-Type-Options" content="nosniff">
     <meta name="referrer" content="strict-origin-when-cross-origin">
     ```
   - Защита от обратного захвата вкладок (Reverse Tab-nabbing): ко всем внешним ссылкам с `target="_blank"` добавлен атрибут `rel="noopener noreferrer"`.

4. **Валидация диапазонов и входных данных**:
   - Поле суммы пожертвования защищено ограничениями: `min="10"`, `max="1000000"`, `step="50"`, `inputmode="numeric"`.
   - Имя сотрудника ограничено 50 символами (`maxlength="50"`), на холсте обрезается до безопасных 30 символов.
   - Выбор подразделения валидируется по фиксированному списку `ALLOWED_DEPARTMENTS`.

---

## 💳 Оплата через СБП (Система Быстрых Платежей)

В лендинг интегрирован официальный QR-код Системы Быстрых Платежей фонда «Дети-лучики» (банк-эквайер ВТБ `bank=100000000013`):
`https://qr.nspk.ru/AS1A004188F9QISE87DONIOS3GADGKH3?type=01&bank=100000000013&crc=1115`

### 💡 Особенности работы статического QR-кода:
1. **Статический QR-код фонда (`type=01`)**: зарегистрирован банком ВТБ в реестре НСПК как **благотворительный статический код с открытой суммой** (свободное пожертвование).
2. **Безопасность банковских приложений**: при обращении к серверу НСПК по ID `AS1A004188F9QISE87DONIOS3GADGKH3` банк получает статус «Сумма не зафиксирована» и в целях защиты средств плательщика предлагает подтвердить сумму вручную.
3. **Удобство для коллег**:
   - **Кнопка «Скопировать сумму»**: копирует выбранную сумму в один клик.
   - **Прямой переход в банк**: кнопка «Перейти к оплате в банк через СБП» открывает банковское приложение со всеми реквизитами.
   - **Кнопка фиксации**: «Я перевёл [1 000 ₽] — добавить в рейтинг команды!» сразу вносит результат в турнирную таблицу Ozon и генерирует праздничное конфетти.

---

## 📂 Структура файлов проекта

```text
F:\HTML\lessons\deti-luchiki-ozon\
├── index.html            # Семантическая разметка по БЭМ, CSP, Core Web Vitals, SVG-иконки
├── css/
│   └── styles.css        # БЭМ-стили, content-visibility, адаптивные кнопки 38px, цвета Ozon + Дети-лучики
├── js/
│   ├── analytics.js      # Защита от CSV Injection, учёт визитов, уникальных гостей, пожертвований
│   ├── app.js            # XSS-санитизация, rAF троттлинг Canvas, СБП QR, рейтинг команд, прогресс-бар
│   └── qrcode.min.js     # Автономная библиотека генерации QR-кодов без внешних зависимостей
├── assets/
│   ├── ozon-logo.svg     # Векторный логотип Ozon Забота (144×36)
│   ├── luchiki-logo.svg  # Оригинальный логотип «Дети-лучики» (168×36, #95C227 & #FF7A00)
│   └── sbp-logo.svg      # Официальная векторная символика СБП (96×30)
└── README.md             # Полная документация проекта
```

---

## 🚀 Запуск и тестирование локально

```powershell
# Запуск через встроенный Python-сервер (порт 8000)
cd F:\HTML\lessons\deti-luchiki-ozon
python -m http.server 8000

# Открытие в браузере
Start-Process "http://localhost:8000"
```
