#!/bin/bash

# 🔧 Скрипт управления администраторами
# Быстрое управление ролями пользователей в Railway PostgreSQL

set -e

echo "🔐 Управление администраторами"
echo "================================"
echo ""

# Проверка Railway CLI
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI не установлен"
    echo "📦 Установите: brew install railway"
    exit 1
fi

# Меню
echo "Выберите действие:"
echo "1) Показать всех пользователей"
echo "2) Показать только администраторов"
echo "3) Назначить пользователя администратором"
echo "4) Удалить права администратора"
echo "5) Найти пользователя по email"
echo "6) Подключиться к базе данных (psql)"
echo ""
read -p "Введите номер (1-6): " choice

case $choice in
    1)
        echo ""
        echo "📊 Все пользователи:"
        echo ""
        railway run psql -c "SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC;"
        ;;
    
    2)
        echo ""
        echo "👑 Администраторы:"
        echo ""
        railway run psql -c "SELECT id, username, email, role, created_at FROM users WHERE role = 'admin';"
        ;;
    
    3)
        echo ""
        read -p "📧 Введите email пользователя: " user_email
        
        if [ -z "$user_email" ]; then
            echo "❌ Email не может быть пустым"
            exit 1
        fi
        
        echo ""
        echo "🔍 Проверяю пользователя..."
        railway run psql -c "SELECT id, username, email, role FROM users WHERE email = '$user_email';"
        
        echo ""
        read -p "❓ Назначить этого пользователя администратором? (y/n): " confirm
        
        if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
            railway run psql -c "UPDATE users SET role = 'admin' WHERE email = '$user_email';"
            echo ""
            echo "✅ Права администратора назначены!"
            echo ""
            echo "Проверка:"
            railway run psql -c "SELECT id, username, email, role FROM users WHERE email = '$user_email';"
        else
            echo "❌ Отменено"
        fi
        ;;
    
    4)
        echo ""
        read -p "📧 Введите email пользователя: " user_email
        
        if [ -z "$user_email" ]; then
            echo "❌ Email не может быть пустым"
            exit 1
        fi
        
        echo ""
        echo "🔍 Проверяю пользователя..."
        railway run psql -c "SELECT id, username, email, role FROM users WHERE email = '$user_email';"
        
        echo ""
        read -p "❓ Удалить права администратора? (y/n): " confirm
        
        if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
            railway run psql -c "UPDATE users SET role = 'user' WHERE email = '$user_email';"
            echo ""
            echo "✅ Права администратора удалены!"
            echo ""
            echo "Проверка:"
            railway run psql -c "SELECT id, username, email, role FROM users WHERE email = '$user_email';"
        else
            echo "❌ Отменено"
        fi
        ;;
    
    5)
        echo ""
        read -p "📧 Введите email пользователя: " user_email
        
        if [ -z "$user_email" ]; then
            echo "❌ Email не может быть пустым"
            exit 1
        fi
        
        echo ""
        echo "🔍 Информация о пользователе:"
        echo ""
        railway run psql -c "SELECT id, username, email, display_name, role, email_verified, phone_verified, created_at FROM users WHERE email = '$user_email';"
        ;;
    
    6)
        echo ""
        echo "🔌 Подключаюсь к базе данных..."
        echo "💡 Для выхода введите: \\q"
        echo ""
        railway run psql
        ;;
    
    *)
        echo "❌ Неверный выбор"
        exit 1
        ;;
esac

echo ""
echo "✨ Готово!"
