#!/bin/bash

# Комплексный тест системы уведомлений
# Проверяет: создание уведомлений, отображение actor данных, mark all as read

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 КОМПЛЕКСНЫЙ ТЕСТ СИСТЕМЫ УВЕДОМЛЕНИЙ"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Цвета для вывода
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Конфигурация
API_URL="http://localhost:8080"
USER1_EMAIL="crypto_trader_pro@mail.com"
USER1_PASSWORD="TestPass123!@#"
USER2_EMAIL="forex_master_fx@mail.com"
USER2_PASSWORD="TestPass123!@#"

# Функция для красивого вывода
print_step() {
    echo ""
    echo -e "${BLUE}▶${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Проверка доступности API
print_step "Проверка доступности Custom Backend API..."
if curl -s -f "$API_URL/health" > /dev/null 2>&1; then
    print_success "Custom Backend API доступен"
else
    print_error "Custom Backend API недоступен на $API_URL"
    echo "Запустите backend командой: ./START_CUSTOM_BACKEND_STACK.sh"
    exit 1
fi

# Шаг 1: Вход пользователей
print_step "Шаг 1: Вход двух тестовых пользователей"

echo "Вход пользователя 1 ($USER1_EMAIL)..."
USER1_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$USER1_EMAIL\",\"password\":\"$USER1_PASSWORD\"}")

USER1_TOKEN=$(echo "$USER1_RESPONSE" | jq -r '.access_token // .token // empty')
USER1_ID=$(echo "$USER1_RESPONSE" | jq -r '.user.id // empty')

if [ -z "$USER1_TOKEN" ] || [ "$USER1_TOKEN" == "null" ]; then
    print_error "Не удалось войти как User1"
    echo "Response: $USER1_RESPONSE"
    exit 1
fi
print_success "User1 вошёл (ID: $USER1_ID)"

echo "Вход пользователя 2 ($USER2_EMAIL)..."
USER2_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$USER2_EMAIL\",\"password\":\"$USER2_PASSWORD\"}")

USER2_TOKEN=$(echo "$USER2_RESPONSE" | jq -r '.access_token // .token // empty')
USER2_ID=$(echo "$USER2_RESPONSE" | jq -r '.user.id // empty')

if [ -z "$USER2_TOKEN" ] || [ "$USER2_TOKEN" == "null" ]; then
    print_error "Не удалось войти как User2"
    echo "Response: $USER2_RESPONSE"
    exit 1
fi
print_success "User2 вошёл (ID: $USER2_ID)"

# Получаем username пользователей для операций
USER1_USERNAME=$(echo "$USER1_RESPONSE" | jq -r '.user.username // empty')
USER2_USERNAME=$(echo "$USER2_RESPONSE" | jq -r '.user.username // empty')

print_success "Пользователи: $USER1_USERNAME (будет подписываться) и $USER2_USERNAME (получит уведомления)"

# Шаг 2: User1 подписывается на User2 (создаст follow notification)
print_step "Шаг 2: User1 подписывается на User2"

FOLLOW_RESPONSE=$(curl -s -X POST "$API_URL/api/users/$USER2_ID/follow" \
  -H "Authorization: Bearer $USER1_TOKEN" \
  -H "Content-Type: application/json")

if echo "$FOLLOW_RESPONSE" | jq -e '.error' > /dev/null 2>&1; then
    print_warning "Follow может быть уже существует: $(echo $FOLLOW_RESPONSE | jq -r '.error')"
else
    print_success "User1 подписался на User2"
fi

# Ждём, чтобы уведомление было создано
sleep 1

# Шаг 3: User1 создаёт пост
print_step "Шаг 3: User1 создаёт пост"

POST_RESPONSE=$(curl -s -X POST "$API_URL/api/posts" \
  -H "Authorization: Bearer $USER1_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"content\":\"Тестовый пост для проверки уведомлений $(date +%s)\"}")

POST_ID=$(echo "$POST_RESPONSE" | jq -r '.id // empty')

if [ -z "$POST_ID" ] || [ "$POST_ID" == "null" ]; then
    print_error "Не удалось создать пост"
    echo "Response: $POST_RESPONSE"
    exit 1
fi
print_success "Пост создан (ID: $POST_ID)"

sleep 1

# Шаг 4: User2 лайкает пост User1 (создаст like notification для User1)
print_step "Шаг 4: User2 лайкает пост User1"

LIKE_RESPONSE=$(curl -s -X POST "$API_URL/api/posts/$POST_ID/like" \
  -H "Authorization: Bearer $USER2_TOKEN" \
  -H "Content-Type: application/json")

if echo "$LIKE_RESPONSE" | jq -e '.error' > /dev/null 2>&1; then
    print_warning "Like ошибка: $(echo $LIKE_RESPONSE | jq -r '.error')"
else
    print_success "User2 лайкнул пост User1"
fi

sleep 1

# Шаг 5: User2 делает retweet поста User1
print_step "Шаг 5: User2 делает retweet поста User1"

RETWEET_RESPONSE=$(curl -s -X POST "$API_URL/api/posts/$POST_ID/retweet" \
  -H "Authorization: Bearer $USER2_TOKEN" \
  -H "Content-Type: application/json")

if echo "$RETWEET_RESPONSE" | jq -e '.error' > /dev/null 2>&1; then
    print_warning "Retweet ошибка: $(echo $RETWEET_RESPONSE | jq -r '.error')"
else
    print_success "User2 сделал retweet поста User1"
fi

sleep 1

# Шаг 6: User2 комментирует пост User1
print_step "Шаг 6: User2 отвечает на пост User1"

REPLY_RESPONSE=$(curl -s -X POST "$API_URL/api/posts" \
  -H "Authorization: Bearer $USER2_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"content\":\"Отличный пост!\",\"parent_id\":\"$POST_ID\"}")

REPLY_ID=$(echo "$REPLY_RESPONSE" | jq -r '.id // empty')

if [ -z "$REPLY_ID" ] || [ "$REPLY_ID" == "null" ]; then
    print_warning "Не удалось создать reply"
else
    print_success "User2 ответил на пост User1"
fi

sleep 2

# Шаг 7: Проверка уведомлений User1 (должен получить: like, retweet, reply от User2)
print_step "Шаг 7: Проверка уведомлений User1"

NOTIFICATIONS_RESPONSE=$(curl -s -X GET "$API_URL/api/notifications" \
  -H "Authorization: Bearer $USER1_TOKEN")

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 ОТВЕТ API /api/notifications:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "$NOTIFICATIONS_RESPONSE" | jq '.'
echo ""

# Проверяем структуру ответа
NOTIF_COUNT=$(echo "$NOTIFICATIONS_RESPONSE" | jq '.notifications | length // 0')

if [ "$NOTIF_COUNT" -eq 0 ]; then
    print_warning "У User1 нет уведомлений! Возможно, они не создались."
    echo "Проверяем unread_count:"
    UNREAD=$(echo "$NOTIFICATIONS_RESPONSE" | jq '.unread_count // 0')
    echo "Unread count: $UNREAD"
else
    print_success "User1 имеет $NOTIF_COUNT уведомлений"
    
    # Проверяем наличие поля actor в уведомлениях
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🔍 ПРОВЕРКА ПОЛЕЙ ACTOR В УВЕДОМЛЕНИЯХ:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    for i in $(seq 0 $((NOTIF_COUNT - 1))); do
        NOTIF=$(echo "$NOTIFICATIONS_RESPONSE" | jq ".notifications[$i]")
        NOTIF_TYPE=$(echo "$NOTIF" | jq -r '.type')
        HAS_ACTOR=$(echo "$NOTIF" | jq 'has("actor")')
        
        if [ "$HAS_ACTOR" == "true" ]; then
            ACTOR_ID=$(echo "$NOTIF" | jq -r '.actor.id // "null"')
            ACTOR_USERNAME=$(echo "$NOTIF" | jq -r '.actor.username // "null"')
            ACTOR_DISPLAY=$(echo "$NOTIF" | jq -r '.actor.display_name // "null"')
            ACTOR_AVATAR=$(echo "$NOTIF" | jq -r '.actor.avatar_url // "null"')
            
            echo ""
            echo "Уведомление #$((i+1)) - Тип: $NOTIF_TYPE"
            
            if [ "$ACTOR_ID" != "null" ]; then
                print_success "  ✓ actor.id: $ACTOR_ID"
            else
                print_error "  ✗ actor.id отсутствует!"
            fi
            
            if [ "$ACTOR_USERNAME" != "null" ]; then
                print_success "  ✓ actor.username: $ACTOR_USERNAME"
            else
                print_error "  ✗ actor.username отсутствует!"
            fi
            
            if [ "$ACTOR_DISPLAY" != "null" ]; then
                print_success "  ✓ actor.display_name: $ACTOR_DISPLAY"
            else
                print_warning "  ⚠ actor.display_name отсутствует (может быть пустым)"
            fi
            
            if [ "$ACTOR_AVATAR" != "null" ] && [ "$ACTOR_AVATAR" != "" ]; then
                print_success "  ✓ actor.avatar_url: $ACTOR_AVATAR"
            else
                print_warning "  ⚠ actor.avatar_url отсутствует или пустой"
            fi
        else
            print_error "Уведомление #$((i+1)) (Тип: $NOTIF_TYPE) НЕ содержит поле 'actor'!"
            echo "Полное уведомление:"
            echo "$NOTIF" | jq '.'
        fi
    done
fi

# Шаг 8: Проверка unread count
print_step "Шаг 8: Проверка счётчика непрочитанных"

UNREAD_RESPONSE=$(curl -s -X GET "$API_URL/api/notifications/unread-count" \
  -H "Authorization: Bearer $USER1_TOKEN")

UNREAD_COUNT=$(echo "$UNREAD_RESPONSE" | jq -r '.unread_count // 0')
print_success "Непрочитанных уведомлений: $UNREAD_COUNT"

# Шаг 9: Тест "Mark All As Read"
print_step "Шаг 9: Тест функции 'Mark All As Read'"

MARK_ALL_RESPONSE=$(curl -s -X PUT "$API_URL/api/notifications/mark-all-read" \
  -H "Authorization: Bearer $USER1_TOKEN" \
  -H "Content-Type: application/json")

echo "Ответ Mark All As Read:"
echo "$MARK_ALL_RESPONSE" | jq '.'

sleep 1

# Проверяем, что все уведомления помечены как прочитанные
AFTER_MARK_RESPONSE=$(curl -s -X GET "$API_URL/api/notifications" \
  -H "Authorization: Bearer $USER1_TOKEN")

AFTER_UNREAD=$(echo "$AFTER_MARK_RESPONSE" | jq '[.notifications[] | select(.is_read == false)] | length')

if [ "$AFTER_UNREAD" -eq 0 ]; then
    print_success "Все уведомления помечены как прочитанные!"
else
    print_error "Осталось $AFTER_UNREAD непрочитанных уведомлений"
fi

# Шаг 10: Проверка уведомлений User2 (должен получить follow от User1)
print_step "Шаг 10: Проверка уведомлений User2"

USER2_NOTIFICATIONS=$(curl -s -X GET "$API_URL/api/notifications" \
  -H "Authorization: Bearer $USER2_TOKEN")

USER2_NOTIF_COUNT=$(echo "$USER2_NOTIFICATIONS" | jq '.notifications | length // 0')

if [ "$USER2_NOTIF_COUNT" -gt 0 ]; then
    print_success "User2 имеет $USER2_NOTIF_COUNT уведомлений"
    
    # Проверяем наличие follow уведомления
    FOLLOW_NOTIF=$(echo "$USER2_NOTIFICATIONS" | jq '[.notifications[] | select(.type == "follow")] | length')
    
    if [ "$FOLLOW_NOTIF" -gt 0 ]; then
        print_success "User2 получил follow уведомление от User1"
        
        # Проверяем actor в follow уведомлении
        FOLLOW_ACTOR=$(echo "$USER2_NOTIFICATIONS" | jq '[.notifications[] | select(.type == "follow")][0].actor')
        
        if [ "$FOLLOW_ACTOR" != "null" ]; then
            print_success "Follow уведомление содержит actor данные:"
            echo "$FOLLOW_ACTOR" | jq '.'
        else
            print_error "Follow уведомление НЕ содержит actor!"
        fi
    fi
else
    print_warning "User2 не имеет уведомлений"
fi

# Итоговая сводка
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 ИТОГОВАЯ СВОДКА"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "User1 уведомления: $NOTIF_COUNT"
echo "User2 уведомления: $USER2_NOTIF_COUNT"
echo "Функция Mark All As Read: $([ "$AFTER_UNREAD" -eq 0 ] && echo '✓ Работает' || echo '✗ Не работает')"
echo ""

# Проверка критических проблем
CRITICAL_ISSUES=0

if [ "$NOTIF_COUNT" -eq 0 ]; then
    print_error "КРИТИЧНО: User1 не получает уведомления!"
    CRITICAL_ISSUES=$((CRITICAL_ISSUES + 1))
fi

# Проверяем, что хотя бы одно уведомление имеет actor
HAS_ANY_ACTOR=$(echo "$NOTIFICATIONS_RESPONSE" | jq '[.notifications[] | select(has("actor"))] | length')

if [ "$HAS_ANY_ACTOR" -eq 0 ] && [ "$NOTIF_COUNT" -gt 0 ]; then
    print_error "КРИТИЧНО: Ни одно уведомление не содержит поле 'actor'!"
    CRITICAL_ISSUES=$((CRITICAL_ISSUES + 1))
fi

if [ "$AFTER_UNREAD" -gt 0 ]; then
    print_error "КРИТИЧНО: Mark All As Read не работает!"
    CRITICAL_ISSUES=$((CRITICAL_ISSUES + 1))
fi

echo ""
if [ "$CRITICAL_ISSUES" -eq 0 ]; then
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}✓ ВСЕ ТЕСТЫ ПРОЙДЕНЫ УСПЕШНО!${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    exit 0
else
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}✗ ОБНАРУЖЕНО $CRITICAL_ISSUES КРИТИЧЕСКИХ ПРОБЛЕМ${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    exit 1
fi
