/* ========================================== */
/* === 1. ЛОГИКА СЛАЙДЕРА (АВТОНОМНАЯ) === */
/* ========================================== */
window.heroInterval = null;

function stopHeroSlider() {
    if (window.heroInterval) {
        clearInterval(window.heroInterval);
        window.heroInterval = null;
    }
}

function startHeroSlider() {
    // Останавливаем, чтобы не было дублей, если вдруг функцию вызовут дважды
    stopHeroSlider();

    const slides = document.querySelectorAll(".slide");
    if (slides.length === 0) return;

    let index = 0;

    // Инициализация (только один раз при старте)
    slides.forEach((s, i) => {
        s.classList.remove("active", "exit");
        if (i === 0) s.classList.add("active");
    });

    window.heroInterval = setInterval(() => {
        // Если слайдер удалили из HTML, останавливаем таймер
        if (!document.body.contains(slides[0])) {
            stopHeroSlider();
            return;
        }

        const currentSlide = slides[index];
        index = (index + 1) % slides.length;
        const nextSlide = slides[index];

        // Анимация смены (твоя Grid + CSS логика)
        currentSlide.classList.remove("active");
        currentSlide.classList.add("exit");

        nextSlide.classList.add("active");

        setTimeout(() => {
            currentSlide.classList.remove("exit");
        }, 500);

    }, 3000);
}

/* ========================================== */
/* === 2. ЗАГРУЗКА БЛОКА СЛАЙДЕРА === */
/* ========================================== */
// Этот блок загружается ОДИН РАЗ при старте сайта и больше не перезагружается
fetch('hero.html')
    .then(t => t.text())
    .then(html => {
        const placeholder = document.getElementById('hero-placeholder');
        if (placeholder) {
            placeholder.innerHTML = html;
            // Запускаем слайдер. Больше мы эту функцию трогать не будем!
            startHeroSlider(); 
        }
    })
    .catch(err => console.log("Hero slider not found/loaded", err));

/* ========================================== */
/* === 3. МЕНЮ И НАВИГАЦИЯ (НЕ ТРОГАЮТ СЛАЙДЕР) === */
/* ========================================== */
document.addEventListener("DOMContentLoaded", () => {
    const menu = document.querySelector(".app-menu");
    const backdrop = document.querySelector(".app-backdrop");
    const buttons = document.querySelectorAll(".app-btn");
    const contentContainer = document.getElementById("dynamic-content");

    if (!menu || !backdrop || !contentContainer) return;

    // --- Движение плашки фона ---
    function moveBackdrop(targetBtn) {
        const btnRect = targetBtn.getBoundingClientRect();
        const menuRect = menu.getBoundingClientRect();
        const x = btnRect.left - menuRect.left;
        const y = btnRect.top - menuRect.top;

        backdrop.style.width = `${btnRect.width}px`;
        backdrop.style.height = `${btnRect.height}px`;
        backdrop.style.transform = `translate(${x}px, ${y}px)`;
        backdrop.style.opacity = "1";
    }

    // --- Загрузка страниц ---
    async function loadPage(filename) {
        // МЫ УБРАЛИ ОТСЮДА stopHeroSlider()!

        contentContainer.style.opacity = "0.4";

        try {
            const response = await fetch(`pages/${filename}`);
            if (!response.ok) throw new Error("Файл не найден");
            const html = await response.text();

            contentContainer.innerHTML = html;
            contentContainer.style.opacity = "1";

            // МЫ УБРАЛИ ОТСЮДА startHeroSlider()!
            // Слайдер продолжает тикать сам по себе, если он есть на странице.

        } catch (err) {
            console.error("Ошибка:", err);
            contentContainer.innerHTML = "<h2>Ошибка загрузки</h2>";
            contentContainer.style.opacity = "1";
        }
    }

    // --- Обработка кликов ---
    buttons.forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            if (btn.classList.contains("active")) return;

            // МЫ УБРАЛИ ОТСЮДА stopHeroSlider()!

            buttons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            moveBackdrop(btn);

            const file = btn.getAttribute("data-file");
            if (file) loadPage(file);
        });
    });

    // --- Инициализация активной кнопки при старте ---
    const activeBtn = document.querySelector(".app-btn.active");
    if (activeBtn) {
        setTimeout(() => moveBackdrop(activeBtn), 150);
        const file = activeBtn.getAttribute("data-file");
        if (file) loadPage(file);
    }

    window.addEventListener("resize", () => {
        const currentActive = document.querySelector(".app-btn.active");
        if (currentActive) moveBackdrop(currentActive);
    });
});

fetch('cta.html')
    .then(t => t.text())
    .then(html => {
        const ctaPlaceholder = document.getElementById('cta-placeholder');
        if (ctaPlaceholder) {
            ctaPlaceholder.innerHTML = html;
        }
    })
    .catch(err => console.log("CTA block not found/loaded", err));

// 3. ЗАГРУЗКА FOOTER (ПОДВАЛ)
fetch('footer.html')
    .then(t => t.text())
    .then(html => {
        const footerPlaceholder = document.getElementById('footer-placeholder');
        if (footerPlaceholder) {
            footerPlaceholder.innerHTML = html;
        }
    })
    .catch(err => console.log("Footer block not found/loaded", err));

document.addEventListener("DOMContentLoaded", () => {

    // Функция загрузки контента
    function loadContent(filename) {
        const container = document.getElementById('dynamic-content');
        if (!container) return;

        // Эффект прозрачности при загрузке
        container.style.opacity = '0.4';

        // Определяем путь. Если мы просим 'cases.html', то ищем в pages/, если другое - тоже там.
        // Предполагаем, что все сменные файлы лежат в папке pages/
        const path = 'pages/' + filename;

        fetch(path)
            .then(response => {
                if (!response.ok) throw new Error('Ошибка сети или файл не найден');
                return response.text();
            })
            .then(html => {
                container.innerHTML = html;
                container.style.opacity = '1';
                // Прокручиваем страницу вверх
                window.scrollTo({ top: 0, behavior: 'smooth' });
            })
            .catch(error => {
                console.error('Ошибка:', error);
                container.innerHTML = '<p style="text-align:center; padding:40px;">Ошибка загрузки контента. Проверьте файлы.</p>';
                container.style.opacity = '1';
            });
    }

    // Слушаем клики на всем документе (делегирование событий)
    document.addEventListener('click', function(e) {
        // Ищем ближайший элемент с атрибутом data-case
        const trigger = e.target.closest('[data-case]');

        if (trigger) {
            e.preventDefault(); // Отменяем стандартный переход по ссылке
            const file = trigger.getAttribute('data-case');
            loadContent(file);
        }
    });

    // Загрузка начальной страницы (если нужно, раскомментируйте)
    // loadContent('cases.html'); 
});

/* --- ЛОГИКА АККОРДЕОНА (РАСКРЫТИЕ СПИСКОВ) --- */
document.addEventListener('click', function(e) {
    // Проверяем, был ли клик по заголовку аккордеона или внутри него
    const header = e.target.closest('.accordion-header');

    if (header) {
        // Находим родительский элемент (.accordion-item)
        const item = header.parentElement;

        // Переключаем класс active (открыть/закрыть)
        item.classList.toggle('active');

    }
});

/* ЛОГИКА ДЛЯ УСЛУГ (SERVICES) */
document.addEventListener("click", function(event) {
    // Ищем клик по карточке с атрибутом data-service
    const serviceCard = event.target.closest("[data-service]");

    if (serviceCard) {
        event.preventDefault(); // Запрещаем стандартный переход

        const filename = serviceCard.getAttribute("data-service");
        const container = document.getElementById("dynamic-content");

        if (!container) return;

        // Эффект загрузки
        container.style.opacity = "0.4";

        // Предполагаем, что файлы лежат в папке services/ или pages/ (поправь путь если нужно)
        // В примере ниже ищем в той же папке или pages/
        fetch("pages/" + filename) 
            .then(response => {
                if (!response.ok) throw new Error("Файл не найден");
                return response.text();
            })
            .then(html => {
                container.innerHTML = html;
                container.style.opacity = "1";
                // Скролл наверх
                window.scrollTo({ top: 0, behavior: "smooth" });
            })
            .catch(err => {
                console.error(err);
                container.innerHTML = "<p style='text-align:center; padding:40px;'>Ошибка загрузки услуги.</p>";
                container.style.opacity = "1";
            });
    }
});

document.addEventListener('click', function(e) {

    // 1. Логика Главного Аккордеона (Белая плашка)
    const header = e.target.closest('.pr-accordion-header');
    if (header) {
        // Находим родителя .pr-category и переключаем класс active
        header.parentElement.classList.toggle('active');
    }

    // 2. Логика кнопки вопроса (Описание услуги)
    const qBtn = e.target.closest('.pr-q-btn');
    if (qBtn) {
        // Находим родителя .pr-service-item и переключаем класс active
        const item = qBtn.closest('.pr-service-item');
        if (item) {
            item.classList.toggle('active');
        }
    }
});

document.addEventListener("DOMContentLoaded", () => {
    // Используем делегирование событий, так как кнопка "Ознакомиться с ценами"
    // появляется динамически (загружается через fetch), и прямой слушатель на нее не повесится
    document.addEventListener("click", (e) => {

        // 1. Проверяем, был ли клик по нашей кнопке внутри контента (или её иконке/тексту)
        const targetBtn = e.target.closest(".accordion-price-btn");

        if (targetBtn) {
            e.preventDefault(); // Предотвращаем стандартное поведение

            // 2. Получаем имя файла из кнопки (price.html)
            const file = targetBtn.getAttribute("data-file");

            if (file) {
                // 3. Ищем соответствующую кнопку в ГЛАВНОМ МЕНЮ
                // Ищем .app-btn внутри навигации, у которой такой же data-file
                const mainNavBtn = document.querySelector(`.app-nav .app-btn[data-file="${file}"]`);

                // 4. Если кнопка в меню найдена — программно кликаем по ней
                if (mainNavBtn) {
                    mainNavBtn.click();

                    // Опционально: скроллим страницу вверх, так как контент сменится
                    window.scrollTo({ top: 0, behavior: "smooth" });
                }
            }
        }
    });
});
