(function () {
    'use strict';

    // === Вспомогательная функция для применения стилей переноса ===
    function applyWrapStyles(el) {
        if (el.dataset.wrapFixed) return;
        el.dataset.wrapFixed = "1";
        el.style.setProperty('word-break', 'break-all', 'important');
        el.style.setProperty('overflow-wrap', 'break-word', 'important');
        el.style.setProperty('white-space', 'normal', 'important');
        el.style.setProperty('display', 'inline-block', 'important');
        el.style.setProperty('max-width', '100%', 'important');
    }

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

    // === 4. Перенос длинных текстов ===
    function fixWrapping() {
        document.querySelectorAll('.break-all:not([data-wrap-fixed])').forEach(applyWrapStyles);
        document.querySelectorAll('.flex-1.min-w-0 p.text-sm:not([data-wrap-fixed])').forEach(applyWrapStyles);
        document.querySelectorAll('.p-4 .text-sm, .space-y-2 .text-sm, .group .text-sm').forEach(el => {
            if (el.scrollWidth > el.clientWidth) {
                applyWrapStyles(el);
            }
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

    // === 6. Добавление кнопки для открытия ссылки ===
    function addLinkButtons() {
        const containers = document.querySelectorAll(`
            .flex-1.min-w-0,
            .group.flex.items-start.gap-3 .flex-1.min-w-0,
            .flex.items-start.gap-3 .flex-1.min-w-0,
            .space-y-1 .flex-1.min-w-0
        `);
        containers.forEach(container => {
            // Если уже есть кнопка external-link, пропускаем
            if (container.querySelector('.lucide-external-link')) return;
            const textElement = container.querySelector('p, span:not(.sr-only)');
            if (!textElement) return;
            const text = textElement.textContent.trim();
            if (!text) return;

            // Проверяем, является ли текст URL
            const isUrl = text.startsWith('http://') || text.startsWith('https://');
            if (!isUrl) return;

            let parent = container.closest('.group.flex.items-start.gap-3, .flex.items-start.gap-3, .flex');
            if (!parent) {
                const possibleParent = container.closest('.space-y-1')?.querySelector('div:has(> .flex-1.min-w-0)');
                if (possibleParent) parent = possibleParent;
            }
            if (!parent || parent.querySelector('.lucide-external-link')) return;

            const linkButton = document.createElement('button');
            linkButton.className = 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground h-6 w-6 shrink-0 self-start';
            if (parent.matches('.flex.items-start.gap-1')) {
                linkButton.classList.add('mt-1');
            }
            linkButton.setAttribute('title', 'Открыть ссылку');
            linkButton.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-external-link h-3.5 w-3.5">
                    <path d="M15 3h6v6"></path>
                    <path d="M10 14 21 3"></path>
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                </svg>
            `;
            linkButton.addEventListener('click', function(e) {
                e.stopPropagation();
                window.open(text, '_blank');
            });

            const iconContainer = parent.querySelector('.flex.items-center.gap-1, .flex.items-start.gap-1, .flex.items-start.gap-3');
            if (iconContainer) {
                iconContainer.appendChild(linkButton);
            } else {
                const lastIcon = parent.querySelector('.lucide-pencil, .lucide-ellipsis-vertical, .lucide-search');
                if (lastIcon) {
                    lastIcon.parentNode.insertBefore(linkButton, lastIcon);
                } else {
                    parent.appendChild(linkButton);
                }
            }
            parent.dataset.linkAdded = "1";
        });
    }

    // === Основная функция ===
    function fix() {
        fixMessages();
        fixAttachments();
        enableMultiMenu();
        fixWrapping();
        fixRadioButtons();
        addLinkButtons(); // изменённая функция
    }

    // Запуск
    fix();

    // Наблюдение за новыми элементами
    new MutationObserver(fix).observe(document.body, {
        childList: true,
        subtree: true
    });
})();