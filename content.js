(function () {
    'use strict';

    function fix() {
        // 1. Стили для текстовых сообщений
        document.querySelectorAll('.text-sm.px-1.text-right').forEach(text => {
            if (text.dataset.fixed) return;
            text.dataset.fixed = "1";

            text.classList.remove('text-right');

            const styles = {
                'text-align': 'left',
                'background': 'var(--bubble-operator-bg, hsl(var(--primary)))',
                'color': 'var(--bubble-operator-text, hsl(var(--primary-foreground)))',
                'padding': '8px 12px',
                'border-radius': '16px',
                'margin-bottom': '8px',
                'display': 'block',
                'white-space': 'pre-wrap'
            };

            for (const [prop, value] of Object.entries(styles)) {
                text.style.setProperty(prop, value, 'important');
            }
        });

        // 2. Обработка вложений (изображения и файлы)
        document.querySelectorAll('.justify-end .max-w-\\[70\\%\\]').forEach(container => {
            const textBlock = container.querySelector('.text-sm.px-1[data-fixed]');
            if (!textBlock) return;

            const parent = textBlock.parentNode;
            if (!parent) return;

            // Ищем любое вложение (с картинкой или кнопкой)
            let attachment = null;
            for (const child of parent.children) {
                if (child === textBlock) continue;
                if (child.querySelector('img') || child.querySelector('button')) {
                    attachment = child;
                    break;
                }
            }

            if (!attachment) return;

            // Добавляем стили для вложения
            if (!attachment.dataset.attachmentFixed) {
                attachment.dataset.attachmentFixed = "1";
                attachment.style.setProperty('border', '2px solid var(--border, #e5e7eb)', 'important');
                attachment.style.setProperty('border-radius', '12px', 'important');
                attachment.style.setProperty('box-shadow', '0 2px 8px rgba(0,0,0,0.1)', 'important');
                attachment.style.setProperty('background', 'white', 'important');
                attachment.style.setProperty('padding', '4px', 'important');
                attachment.style.setProperty('display', 'inline-block', 'important');

                const img = attachment.querySelector('img');
                if (img) {
                    img.style.setProperty('border-radius', '8px', 'important');
                    img.style.setProperty('display', 'block', 'important');
                    img.style.setProperty('max-width', '100%', 'important');
                }
            }

            // Перемещаем вложение ПОСЛЕ текста
            if (textBlock.nextElementSibling !== attachment) {
                parent.insertBefore(attachment, textBlock.nextSibling);
            }
        });
    }

    // Запускаем скрипт
    fix();

    // Наблюдаем за новыми сообщениями
    new MutationObserver(fix).observe(document.body, {
        childList: true,
        subtree: true
    });
})();