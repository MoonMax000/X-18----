#!/bin/bash

# Скрипт для очистки устаревшей документации
# Дата: 02.11.2025

echo "🧹 Очистка устаревшей документации..."
echo ""

# Счетчик удаленных файлов
count=0

# Функция для безопасного удаления
safe_delete() {
    if [ -f "$1" ]; then
        echo "  ❌ Удаляю: $1"
        rm "$1"
        ((count++))
    fi
}

echo "📋 Удаление отчетов о работе..."

# EMAIL VERIFICATION отчеты
safe_delete "EMAIL_VERIFICATION_FIX_REPORT.md"
safe_delete "EMAIL_VERIFICATION_FIX_IMPLEMENTATION.md"
safe_delete "EMAIL_VERIFICATION_COMPLETE.md"
safe_delete "EMAIL_VERIFICATION_DEPLOYMENT_STATUS.md"
safe_delete "EMAIL_VERIFICATION_FIXED_FINAL.md"
safe_delete "EMAIL_VERIFICATION_STATUS_REPORT_02_11_2025.md"
safe_delete "CURRENT_STATUS_01_11_2025.md"

# AWS/DEPLOYMENT отчеты
safe_delete "AWS_MIGRATION_COMPLETE_SUMMARY.md"
safe_delete "AWS_MIGRATION_FINAL_STATUS.md"
safe_delete "AWS_CUSTOM_DOMAINS_COMPLETE.md"
safe_delete "AWS_CUSTOM_DOMAINS_SETUP.md"
safe_delete "AWS_DOMAINS_FINAL_SETUP.md"
safe_delete "AWS_SES_MIGRATION_COMPLETE.md"
safe_delete "AWS_SES_DOMAIN_VERIFICATION.md"
safe_delete "AWS_SES_DNS_FIX.md"
safe_delete "AWS_SES_SANDBOX_MODE_SOLUTION.md"
safe_delete "DEPLOYMENT_STATUS_REPORT_01_11_2025.md"
safe_delete "DEPLOYMENT_REPORT_USERNAME_LIMITATION.md"
safe_delete "DEPLOYMENT_CHECK_REPORT.md"
safe_delete "DEPLOYMENT_COMPLETE_GUIDE.md"

# CORS/HTTP отчеты
safe_delete "CORS_ORIGIN_FIX_COMPLETE.md"
safe_delete "CORS_FIX_AND_SES_STATUS_REPORT.md"
safe_delete "CORS_FIX_VERIFICATION_REPORT.md"
safe_delete "MIXED_CONTENT_FIX_COMPLETE.md"
safe_delete "HTTPS_FIX_FINAL.md"

# Resend отчеты
safe_delete "RESEND_API_KEY_FIX_COMPLETE.md"
safe_delete "RESEND_API_KEY_UPDATE_COMPLETE.md"
safe_delete "RESEND_DOMAIN_VERIFICATION_GUIDE.md"
safe_delete "RESEND_EMAIL_SETUP_GUIDE.md"
safe_delete "RESEND_QUICK_START.md"

# DATABASE отчеты
safe_delete "DATABASE_MIGRATION_FIX_COMPLETE.md"

# PROFILE отчеты
safe_delete "PROFILE_AUTO_SAVE_IMPLEMENTATION.md"
safe_delete "PROFILE_SETTINGS_IMPROVEMENTS_REPORT.md"
safe_delete "PROFILE_ISSUES_COMPLETE_FIX.md"
safe_delete "PROFILE_OPTIMIZATION_IMPLEMENTED.md"
safe_delete "PROFILE_OPTIMIZATION_GUIDE.md"
safe_delete "PROFILE_SECURITY_ENHANCEMENTS_PROGRESS.md"
safe_delete "PROFILE_SETTINGS_AUDIT_AND_FIX_REPORT.md"
safe_delete "PROFILE_SETTINGS_BACKEND_READINESS.md"
safe_delete "PROFILE_SYNC_GUIDE.md"
safe_delete "PROFILE_CONNECTIONS_FLOW.md"
safe_delete "PROFILE_CONNECTIONS.md"

# USERNAME отчеты
safe_delete "USERNAME_CHANGE_LIMITATION_IMPLEMENTATION.md"

# AUTH отчеты
safe_delete "AUTH_401_FIX_REPORT.md"
safe_delete "AUTH_401_IMPROVEMENTS_REPORT.md"
safe_delete "AUTH_SECURITY_ENHANCEMENT_REPORT.md"
safe_delete "AUTH_TESTING_GUIDE.md"
safe_delete "PRODUCTION_AUTH_FIX_REPORT.md"

# SESSION отчеты
safe_delete "SESSION_SUMMARY_2025_11_01.md"
safe_delete "SESSION_EXPORT_02_11_2025.md"
safe_delete "SESSION_TRACKING_COMPLETE_REPORT.md"
safe_delete "SESSION_TRACKING_FIX_GUIDE.md"

# PRODUCTION отчеты
safe_delete "PRODUCTION_FIXES_REPORT.md"
safe_delete "PRODUCTION_ISSUES_FIX_REPORT.md"
safe_delete "PRODUCTION_ISSUES_FIXED_REPORT.md"
safe_delete "PRODUCTION_READY_REPORT.md"

# TESTING отчеты
safe_delete "TESTING_REPORT_TEMPORARY_URLS.md"

# FINAL отчеты
safe_delete "FINAL_STATUS_ALL_WORKING.md"
safe_delete "ALL_FIXES_COMPLETE_REPORT.md"

# NOTIFICATIONS отчеты
safe_delete "NOTIFICATIONS_DEBUG_LOGGING_ADDED.md"
safe_delete "NOTIFICATIONS_FIX_FINAL_REPORT.md"
safe_delete "NOTIFICATIONS_ROOT_CAUSE_FOUND.md"
safe_delete "NOTIFICATIONS_STATUS_REPORT.md"

# FOLLOW отчеты
safe_delete "FOLLOW_NOTIFICATIONS_FINAL_FIX.md"
safe_delete "FOLLOW_STATE_SYNC_FIX.md"

# HOVER отчеты
safe_delete "HOVER_CARDS_DEBUG_REPORT.md"

# WEBSOCKET/HTTPONLY отчеты
safe_delete "HTTPONLY_COOKIES_WEBSOCKET_FINAL_REPORT.md"
safe_delete "HTTPONLY_COOKIES_WEBSOCKET_IMPLEMENTATION_REPORT.md"
safe_delete "HTTPONLY_COOKIES_WEBSOCKET_VERIFICATION_REPORT.md"
safe_delete "HTTPONLY_WEBSOCKET_PRODUCTION_DEPLOYMENT.md"
safe_delete "WEBSOCKET_HTTPONLY_COOKIES_COMPLETE.md"

# INFINITE RELOAD отчеты
safe_delete "INFINITE_RELOAD_FIX_REPORT.md"

# AVATAR отчеты
safe_delete "AVATAR_AND_MEDIA_STORAGE_FIX_REPORT.md"
safe_delete "AVATAR_CONSISTENCY_FIX.md"
safe_delete "AVATAR_HOVER_STRUCTURE.md"
safe_delete "AVATAR_SYNC_OPTIMIZATION.md"

# ASPECT RATIO отчеты
safe_delete "ASPECT_RATIO_PRESETS_FIX.md"

# OPTIMIZATION отчеты
safe_delete "OPTIMIZATION_GUIDE.md"
safe_delete "OPTIMIZATION_IMPLEMENTATION_REPORT.md"

# UI отчеты
safe_delete "UI_IMPROVEMENTS_DEPLOYMENT_COMPLETE.md"
safe_delete "UI_IMPROVEMENTS_DEPLOYMENT_REPORT.md"

# ADMIN отчеты
safe_delete "ADMIN_AND_TOTP_DIAGNOSTIC_COMPLETE.md"
safe_delete "ADMIN_ENHANCEMENTS_COMPLETE.md"
safe_delete "ADMIN_PANEL_SETUP_SIMPLE.md"

# TOTP отчеты
safe_delete "TOTP_2FA_BACKEND_IMPLEMENTATION_REPORT.md"
safe_delete "TOTP_2FA_COMPLETE_IMPLEMENTATION_REPORT.md"
safe_delete "TOTP_DEPLOYMENT_GUIDE.md"
safe_delete "TOTP_DEPLOYMENT_STATUS_FINAL.md"
safe_delete "TOTP_FRONTEND_IMPLEMENTATION_COMPLETE.md"
safe_delete "TOTP_PROTECTED_OPERATIONS_COMPLETE.md"
safe_delete "TOTP_PROTECTED_OPERATIONS_IMPLEMENTATION_REPORT.md"

# WIDGETS отчеты
safe_delete "WIDGETS_AND_ADMIN_SYSTEM_IMPLEMENTATION.md"

# PHASE отчеты
safe_delete "PHASE_2_API_INTEGRATIONS_COMPLETE.md"

# MONETIZATION отчеты
safe_delete "MONETIZATION_SYSTEM.md"
safe_delete "MONETIZATION_VERIFICATION_GUIDE.md"

# COMMENT отчеты
safe_delete "COMMENT_ISSUE_DIAGNOSTIC_GUIDE.md"

# CONTENT отчеты
safe_delete "CONTENT_PROCESSING_SYSTEM_OVERVIEW.md"

# CROP отчеты
safe_delete "CROP_PROCESS_EXPLANATION.md"

# POST отчеты
safe_delete "POST_CREATION_FILES_MAP.md"

# SECURITY отчеты
safe_delete "SECURITY_ARCHITECTURE_EXPLAINED.md"
safe_delete "SECURITY_IMPROVEMENTS_ASSESSMENT.md"

# README отчеты
safe_delete "README_IMPROVEMENTS.md"

# NEWS отчеты
safe_delete "NEWS_SYSTEM_DEPLOYMENT_GUIDE.md"

# Устаревшие SETUP гайды
safe_delete "SETUP_CHECKLIST.md"
safe_delete "QUICK_ADMIN_SETUP.md"
safe_delete "QUICK_START_BACKEND.md"

# Устаревшие RAILWAY гайды
safe_delete "RAILWAY_ГОТОВ.md"
safe_delete "RAILWAY_ДЕПЛОЙ_CUSTOM_BACKEND.md"
safe_delete "RAILWAY_ПРОБЛЕМА_РЕШЕНИЕ.md"
safe_delete "RAILWAY_CHECKLIST.md"
safe_delete "RAILWAY_DB_ADMIN_SETUP.md"
safe_delete "RAILWAY_DEPLOY.md"
safe_delete "RAILWAY_FIX_VARIABLES.md"
safe_delete "RAILWAY_MIGRATION_009_MANUAL.md"

# Устаревшие REDIS гайды
safe_delete "REDIS_RAILWAY_FIX.md"

# Устаревшие DATABASE гайды
safe_delete "PSQL_COMMANDS_GUIDE.md"
safe_delete "TABLEPLUS_MIGRATION_GUIDE.md"

# Устаревшие архитектурные файлы (дублируют PROJECT.md)
safe_delete "ARCHITECTURE.md"
safe_delete "ARCHITECTURE_AND_FIXES_REPORT.md"
safe_delete "ARCHITECTURE_REVIEW_AND_CICD.md"
safe_delete "PROJECT_ARCHITECTURE_EXPLAINED.md"
safe_delete "DETAILED_TECHNICAL_ARCHITECTURE.md"

# Устаревшие SPECIFICATION (есть в PROJECT.md)
safe_delete "SPECIFICATION.md"

# Устаревшие PROJECT гайды
safe_delete "PROJECT_CONTEXT.md"
safe_delete "PROJECT_TRANSFER_GUIDE.md"

# Устаревшие тестовые файлы
safe_delete "TEST_RESEND_NOW.md"
safe_delete "MANUAL_TESTING_GUIDE.md"

# Локальное тестирование (есть в DEVELOPMENT.md)
safe_delete "ЛОКАЛЬНОЕ_ТЕСТИРОВАНИЕ.md"

# Как протестировать/деплоить (есть в DEPLOYMENT.md)
safe_delete "КАК_ПРОТЕСТИРОВАТЬ_СЕЙЧАС.md"
safe_delete "КАК_ДЕПЛОИТЬ.md"

# Правильные URL (есть в PROJECT.md)
safe_delete "ПРАВИЛЬНЫЕ_PRODUCTION_URL.md"

# Disable old deployments (не актуально)
safe_delete "DISABLE_OLD_DEPLOYMENTS.md"
safe_delete "DNS_MIGRATION_REQUIRED.md"

# Quick reference (есть в PROJECT.md и DEPLOYMENT.md)
safe_delete "QUICK_REFERENCE.md"

# Github actions setup (есть в DEPLOYMENT.md)
safe_delete "GITHUB_ACTIONS_SETUP.md"

# Domain setup (есть в DEPLOYMENT.md)
safe_delete "DOMAIN_CONFIGURATION_MANUAL.md"
safe_delete "DOMAIN_SETUP_GUIDE.md"

# Deployment guide (оставляем только DEPLOYMENT.md)
safe_delete "DEPLOYMENT_GUIDE.md"

# Agents (не нужен)
safe_delete "AGENTS.md"

echo ""
echo "✅ Удалено файлов: $count"
echo ""
echo "📚 Сохранены живые документы:"
echo "  ✓ PROJECT.md"
echo "  ✓ DEVELOPMENT.md"
echo "  ✓ FEATURES.md"
echo "  ✓ CHANGELOG.md"
echo "  ✓ DEPLOYMENT.md"
echo ""
echo "📋 Сохранены правила:"
echo "  ✓ .continue/rules/documentation.md"
echo "  ✓ .continue/rules/deployment.md"
echo ""
echo "🎉 Готово! Документация очищена."
