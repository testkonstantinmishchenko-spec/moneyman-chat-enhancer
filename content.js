(function () {
    'use strict';

    // === 1. Стилизация сообщений ===
    function fixMessages() {
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
    }

    // === 2. Обработка вложений (изображения и файлы) ===
    function fixAttachments() {
        document.querySelectorAll('.justify-end .max-w-\\[70\\%\\]').forEach(container => {
            const textBlock = container.querySelector('.text-sm.px-1[data-fixed]');
            if (!textBlock) return;

            const parent = textBlock.parentNode;
            if (!parent) return;

            let attachment = null;
            for (const child of parent.children) {
                if (child === textBlock) continue;
                if (child.querySelector('img') || child.querySelector('button')) {
                    attachment = child;
                    break;
                }
            }
            if (!attachment) return;

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

            if (textBlock.nextElementSibling !== attachment) {
                parent.insertBefore(attachment, textBlock.nextSibling);
            }
        });
    }

    // === 3. Мульти-меню (одновременное открытие нескольких панелей) ===
    function enableMultiMenu() {
        document.addEventListener('click', function(e) {
            const button = e.target.closest('button[data-state]');
            if (!button) return;

            const openButtons = [];
            document.querySelectorAll('button[data-state="open"]').forEach(b => {
                if (b !== button) {
                    openButtons.push(b);
                }
            });

            setTimeout(() => {
                openButtons.forEach(b => {
                    if (b.getAttribute('data-state') === 'closed') {
                        b.setAttribute('data-state', 'open');
                        if (b.hasAttribute('aria-expanded')) {
                            b.setAttribute('aria-expanded', 'true');
                        }
                    }
                });
            }, 0);
        }, true);
    }

    // === 4. Перенос длинных ID ===
    function fixWrapping() {
        document.querySelectorAll('.break-all.text-left.font-mono.text-xs').forEach(el => {
            if (el.dataset.wrapFixed) return;
            el.dataset.wrapFixed = "1";
            el.style.setProperty('word-break', 'break-all', 'important');
            el.style.setProperty('overflow-wrap', 'break-word', 'important');
            el.style.setProperty('white-space', 'normal', 'important');
            el.style.setProperty('display', 'inline-block', 'important');
            el.style.setProperty('max-width', '100%', 'important');
        });
    }

    // === 5. Фиксация выбора радиокнопок ===
    function fixRadioButtons() {
        document.querySelectorAll('[role="group"]').forEach(group => {
            let key = group.dataset.radioKey;
            if (!key) {
                const label = group.closest('.flex, .space-y-2')?.querySelector('h4, .text-xs.font-medium');
                key = label ? label.textContent.trim() : 'radio-group-' + Array.from(document.querySelectorAll('[role="group"]')).indexOf(group);
                group.dataset.radioKey = key;
            }

            const buttons = group.querySelectorAll('button[role="radio"]');
            if (buttons.length === 0) return;

            function saveSelected(selectedButton) {
                const value = selectedButton.textContent.trim();
                localStorage.setItem('radio-selection-' + key, value);
            }

            function restoreSelection() {
                const saved = localStorage.getItem('radio-selection-' + key);
                if (!saved) return;
                buttons.forEach(btn => {
                    if (btn.textContent.trim() === saved) {
                        if (btn.getAttribute('data-state') !== 'on') {
                            btn.click();
                        }
                    }
                });
            }

            buttons.forEach(btn => {
                if (btn.dataset.radioFixed) return;
                btn.dataset.radioFixed = "1";
                btn.addEventListener('click', function() {
                    setTimeout(() => {
                        if (this.getAttribute('data-state') === 'on') {
                            saveSelected(this);
                        }
                    }, 0);
                });
            });

            if (!group.dataset.restored) {
                group.dataset.restored = "1";
                restoreSelection();
            }
        });
    }

    // === Основная функция ===
    function fix() {
        fixMessages();
        fixAttachments();
        enableMultiMenu();
        fixWrapping();
        fixRadioButtons();
    }

    // Запуск
    fix();

    // Наблюдение за новыми элементами
    new MutationObserver(fix).observe(document.body, {
        childList: true,
        subtree: true
    });
})();