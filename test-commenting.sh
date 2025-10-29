#!/bin/bash

echo "=== Тест комментирования поста ==="
echo

# Цвета для вывода
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# URL API
API_URL="${VITE_API_URL:-http://localhost:8080}/api"

# Логин первого пользователя (создаст пост)
echo -e "${BLUE}1. Логинимся как первый пользователь...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user1@example.com",
    "password": "password123"
  }')

TOKEN1=$(echo $LOGIN_RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
USER1_ID=$(echo $LOGIN_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)
USER1_NAME=$(echo $LOGIN_RESPONSE | grep -o '"username":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN1" ]; then
  echo -e "${RED}Ошибка: Не удалось авторизоваться как user1${NC}"
  echo "Ответ сервера: $LOGIN_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✓ Авторизован как: $USER1_NAME (ID: $USER1_ID)${NC}"
echo

# Создаем пост от первого пользователя
echo -e "${BLUE}2. Создаем тестовый пост...${NC}"
POST_RESPONSE=$(curl -s -X POST "$API_URL/posts/" \
  -H "Authorization: Bearer $TOKEN1" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Это тестовый пост для проверки комментариев. Время: '"$(date)"'"
  }')

POST_ID=$(echo $POST_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ -z "$POST_ID" ]; then
  echo -e "${RED}Ошибка: Не удалось создать пост${NC}"
  echo "Ответ сервера: $POST_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✓ Создан пост ID: $POST_ID${NC}"
echo

# Логин второго пользователя (попробует прокомментировать)
echo -e "${BLUE}3. Логинимся как второй пользователь...${NC}"
LOGIN_RESPONSE2=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user2@example.com",
    "password": "password123"
  }')

TOKEN2=$(echo $LOGIN_RESPONSE2 | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
USER2_NAME=$(echo $LOGIN_RESPONSE2 | grep -o '"username":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN2" ]; then
  echo -e "${RED}Ошибка: Не удалось авторизоваться как user2${NC}"
  echo "Ответ сервера: $LOGIN_RESPONSE2"
  exit 1
fi

echo -e "${GREEN}✓ Авторизован как: $USER2_NAME${NC}"
echo

# Пробуем создать комментарий от второго пользователя
echo -e "${BLUE}4. Пробуем прокомментировать пост от другого пользователя...${NC}"
COMMENT_RESPONSE=$(curl -s -X POST "$API_URL/posts/" \
  -H "Authorization: Bearer $TOKEN2" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Это тестовый комментарий от другого пользователя!",
    "reply_to_id": "'"$POST_ID"'"
  }')

COMMENT_ID=$(echo $COMMENT_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ -z "$COMMENT_ID" ]; then
  echo -e "${RED}❌ ОШИБКА: Не удалось создать комментарий!${NC}"
  echo "Ответ сервера: $COMMENT_RESPONSE"
  echo
  echo -e "${RED}ПРОБЛЕМА ПОДТВЕРЖДЕНА: Пользователи не могут комментировать чужие посты!${NC}"
else
  echo -e "${GREEN}✓ Комментарий успешно создан! ID: $COMMENT_ID${NC}"
  echo
  
  # Проверяем, что комментарий НЕ отображается как пост в ленте
  echo -e "${BLUE}5. Проверяем, что комментарий не появился в ленте...${NC}"
  TIMELINE_RESPONSE=$(curl -s "$API_URL/timeline/explore?limit=10" \
    -H "Authorization: Bearer $TOKEN2")
  
  if echo "$TIMELINE_RESPONSE" | grep -q "$COMMENT_ID"; then
    echo -e "${RED}❌ ОШИБКА: Комментарий появился в общей ленте!${NC}"
  else
    echo -e "${GREEN}✓ Комментарий НЕ отображается в ленте (правильно)${NC}"
  fi
  
  # Проверяем, что комментарий есть в списке ответов на пост
  echo
  echo -e "${BLUE}6. Проверяем, что комментарий есть в ответах на пост...${NC}"
  REPLIES_RESPONSE=$(curl -s "$API_URL/posts/$POST_ID/replies" \
    -H "Authorization: Bearer $TOKEN2")
  
  if echo "$REPLIES_RESPONSE" | grep -q "$COMMENT_ID"; then
    echo -e "${GREEN}✓ Комментарий найден в списке ответов${NC}"
    echo
    echo -e "${GREEN}ВСЁ РАБОТАЕТ ПРАВИЛЬНО!${NC}"
    echo -e "- Пользователи МОГУТ комментировать чужие посты"
    echo -e "- Комментарии НЕ отображаются в лентах"
    echo -e "- Комментарии правильно привязаны к постам"
  else
    echo -e "${RED}❌ ОШИБКА: Комментарий не найден в ответах${NC}"
  fi
fi

echo
echo "=== Тест завершен ==="
