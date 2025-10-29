#!/bin/bash

echo "🧹 Очистка проекта от ненужной документации..."

# Создаем папку для архивации (на случай если что-то понадобится)
mkdir -p .archived-docs

# Файлы GoToSocial (больше не используется)
echo "📁 Архивируем документацию GoToSocial..."
mv GOTOSOCIAL_*.md .archived-docs/ 2>/dev/null

# Старые отчеты о фиксах
echo "📁 Архивируем старые отчеты о фиксах..."
mv *_FIX_REPORT.md .archived-docs/ 2>/dev/null
mv *_FIX_COMPLETE.md .archived-docs/ 2>/dev/null
mv *_FIXED*.md .archived-docs/ 2>/dev/null
mv FINAL_FIX_REPORT.md .archived-docs/ 2>/dev/null

# Промежуточные отчеты
echo "📁 Архивируем промежуточные отчеты..."
mv *_COMPLETE.md .archived-docs/ 2>/dev/null
mv *_SUMMARY.md .archived-docs/ 2>/dev/null
mv *_STATUS.md .archived-docs/ 2>/dev/null

# Старые инструкции по настройке
echo "📁 Архивируем старые инструкции..."
mv ФИНАЛЬНЫЕ_3_КОМАНДЫ.md .archived-docs/ 2>/dev/null
mv КАК_ПОЛУЧИТЬ_*.md .archived-docs/ 2>/dev/null
mv РЕШЕНИЕ_ПРОБЛЕМЫ_*.md .archived-docs/ 2>/dev/null
mv КАКОЙ_ПРОЕКТ_*.md .archived-docs/ 2>/dev/null
mv КАК_УДАЛИТЬ_*.md .archived-docs/ 2>/dev/null
mv ПОРТЫ_НЕ_НУЖНЫ*.md .archived-docs/ 2>/dev/null
mv ИСПРАВЛЕНИЕ_*.md .archived-docs/ 2>/dev/null
mv УДАЛЕНИЕ_*.md .archived-docs/ 2>/dev/null
mv ПОЧЕМУ_*.md .archived-docs/ 2>/dev/null

# Тестовые отчеты
echo "📁 Архивируем тестовые отчеты..."
mv *_TEST_*.md .archived-docs/ 2>/dev/null
mv DEBUG_*.md .archived-docs/ 2>/dev/null
mv CODE_BLOCKS_*.md .archived-docs/ 2>/dev/null

# Старые файлы интеграции
echo "📁 Архивируем старые файлы интеграции..."
mv *_INTEGRATION*.md .archived-docs/ 2>/dev/null
mv BACKEND_ARCHITECTURE_ANALYSIS.md .archived-docs/ 2>/dev/null
mv LOCAL_STACK_STARTED.md .archived-docs/ 2>/dev/null

# Тестовые скрипты
echo "📁 Архивируем тестовые скрипты..."
mv test-*.sh .archived-docs/ 2>/dev/null
mv debug-*.sh .archived-docs/ 2>/dev/null
mv check-*.sh .archived-docs/ 2>/dev/null
mv clean-*.sh .archived-docs/ 2>/dev/null
mv clear-*.sh .archived-docs/ 2>/dev/null
mv seed-*.sh .archived-docs/ 2>/dev/null

# Старые скрипты настройки
echo "📁 Архивируем старые скрипты настройки..."
mv apply-*.sh .archived-docs/ 2>/dev/null
mv setup-*.sh .archived-docs/ 2>/dev/null
mv fix-*.sh .archived-docs/ 2>/dev/null
mv get-*.sh .archived-docs/ 2>/dev/null
mv manage-*.sh .archived-docs/ 2>/dev/null

# Устаревшие документы
echo "📁 Архивируем устаревшие документы..."
mv RESEND_*.md .archived-docs/ 2>/dev/null
mv GMAIL_*.md .archived-docs/ 2>/dev/null
mv OAUTH_*.md .archived-docs/ 2>/dev/null
mv EMAIL_*.md .archived-docs/ 2>/dev/null
mv AWS_*.md .archived-docs/ 2>/dev/null
mv READY_FOR_TESTING.md .archived-docs/ 2>/dev/null

# Файлы ngrok (не используется в production)
echo "📁 Архивируем файлы ngrok..."
mv START_WITH_NGROK*.sh .archived-docs/ 2>/dev/null
mv NGROK_*.md .archived-docs/ 2>/dev/null

# Старые конфигурационные документы
echo "📁 Архивируем старые конфигурационные документы..."
mv ИТОГОВОЕ_*.md .archived-docs/ 2>/dev/null
mv ОДИН_ПРОЕКТ_*.md .archived-docs/ 2>/dev/null
mv FIRSTVDS_*.md .archived-docs/ 2>/dev/null
mv ХРАНИЛИЩЕ_*.md .archived-docs/ 2>/dev/null

# HTML тесты
echo "📁 Архивируем тестовые HTML файлы..."
mv *.html .archived-docs/ 2>/dev/null

# Старые планы и анализы
echo "📁 Архивируем старые планы..."
mv *_PLAN.md .archived-docs/ 2>/dev/null
mv *_ANALYSIS.md .archived-docs/ 2>/dev/null
mv ENVIRONMENT_EXPLANATION.md .archived-docs/ 2>/dev/null

# Специфичные старые файлы
echo "📁 Архивируем специфичные старые файлы..."
mv setup-admin.sql .archived-docs/ 2>/dev/null
mv FOR_AI_REFERENCE.md .archived-docs/ 2>/dev/null
mv CONTINUE_FROM_HERE.md .archived-docs/ 2>/dev/null
mv TODO_*.md .archived-docs/ 2>/dev/null
mv PHASE_*.md .archived-docs/ 2>/dev/null
mv HOVER_CARD_*.md .archived-docs/ 2>/dev/null
mv QUICK_ACTION_CARD.md .archived-docs/ 2>/dev/null
mv MARKETPLACE_TAB_DISABLED.md .archived-docs/ 2>/dev/null
mv FILTERS_*.md .archived-docs/ 2>/dev/null
mv FEEDTEST_*.md .archived-docs/ 2>/dev/null
mv IMPLEMENTATION_SUMMARY.md .archived-docs/ 2>/dev/null
mv REFACTORING_SUMMARY.md .archived-docs/ 2>/dev/null
mv SESSION_CONTINUATION_SUMMARY.md .archived-docs/ 2>/dev/null
mv SETUP_VS_CODE_WITH_AI.md .archived-docs/ 2>/dev/null
mv STRIPE_*.md .archived-docs/ 2>/dev/null
mv GET_STRIPE_CLIENT_ID.md .archived-docs/ 2>/dev/null

echo ""
echo "✅ Очистка завершена!"
echo ""
echo "📊 Статистика:"
echo "  - Архивировано файлов: $(ls -la .archived-docs/*.md 2>/dev/null | wc -l)"
echo "  - Архивировано скриптов: $(ls -la .archived-docs/*.sh 2>/dev/null | wc -l)"
echo ""
echo "💡 Совет: Архивированные файлы находятся в папке .archived-docs/"
echo "         Вы можете удалить эту папку позже командой: rm -rf .archived-docs"
echo ""
echo "📌 Оставлены важные файлы:"
echo "  - README и основная документация проекта"
echo "  - Конфигурационные файлы (.env, vite.config, netlify.toml и т.д.)"
echo "  - Актуальные инструкции по развертыванию"
echo "  - Файлы миграций базы данных"
echo "  - Основные скрипты запуска (START_*, STOP_*)"
