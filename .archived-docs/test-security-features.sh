#!/bin/bash

# Скрипт для тестирования функций безопасности
# Тестирует: 2FA, управление сессиями, смену пароля, восстановление пароля

echo "================================================="
echo "ТЕСТИРОВАНИЕ ФУНКЦИЙ БЕЗОПАСНОСТИ"
echo "================================================="
echo ""

# Цвета для вывода
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# API URL
API_URL="http://localhost:8080/api"

# Тестовые данные
TEST_EMAIL="test_security_$(date +%s)@example.com"
TEST_USERNAME="security_test_$(date +%s)"
TEST_PASSWORD="SecurePass123!"
NEW_PASSWORD="NewSecurePass456!"

echo "🔐 1. Регистрация тестового пользователя"
echo "==========================================="
REGISTER_RESPONSE=$(curl -s -X POST $API_URL/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"$TEST_USERNAME\",
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\"
  }")

ACCESS_TOKEN=$(echo $REGISTER_RESPONSE | jq -r '.access_token')
USER_ID=$(echo $REGISTER_RESPONSE | jq -r '.user.id')

if [ "$ACCESS_TOKEN" != "null" ]; then
  echo -e "${GREEN}✓ Регистрация успешна${NC}"
  echo "  Email: $TEST_EMAIL"
  echo "  Username: $TEST_USERNAME"
  echo "  User ID: $USER_ID"
else
  echo -e "${RED}✗ Ошибка регистрации${NC}"
  echo "$REGISTER_RESPONSE"
  exit 1
fi

echo ""
echo "🔒 2. Тестирование настроек 2FA"
echo "==========================================="

# Получение текущих настроек 2FA
echo "Получение настроек 2FA..."
SETTINGS_RESPONSE=$(curl -s -X GET $API_URL/auth/2fa/settings \
  -H "Authorization: Bearer $ACCESS_TOKEN")

IS_2FA_ENABLED=$(echo $SETTINGS_RESPONSE | jq -r '.is_2fa_enabled')
echo "  2FA включено: $IS_2FA_ENABLED"

# Включение 2FA
echo ""
echo "Включение 2FA (email метод)..."
ENABLE_2FA_RESPONSE=$(curl -s -X POST $API_URL/auth/2fa/enable \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"method\": \"email\",
    \"password\": \"$TEST_PASSWORD\"
  }")

DEBUG_CODE=$(echo $ENABLE_2FA_RESPONSE | jq -r '.debug_code')

if [ "$DEBUG_CODE" != "null" ]; then
  echo -e "${GREEN}✓ Код верификации отправлен${NC}"
  echo "  Debug код: $DEBUG_CODE"
  
  # Подтверждение 2FA
  echo ""
  echo "Подтверждение 2FA..."
  CONFIRM_2FA_RESPONSE=$(curl -s -X POST $API_URL/auth/2fa/confirm \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"code\": \"$DEBUG_CODE\",
      \"method\": \"email\"
    }")
  
  MESSAGE=$(echo $CONFIRM_2FA_RESPONSE | jq -r '.message')
  if [ "$MESSAGE" == "2FA enabled successfully" ]; then
    echo -e "${GREEN}✓ 2FA успешно включено${NC}"
  else
    echo -e "${RED}✗ Ошибка подтверждения 2FA${NC}"
    echo "$CONFIRM_2FA_RESPONSE"
  fi
else
  echo -e "${YELLOW}⚠ Не удалось включить 2FA (возможно, email не верифицирован)${NC}"
  echo "$ENABLE_2FA_RESPONSE"
fi

echo ""
echo "📱 3. Тестирование управления сессиями"
echo "==========================================="

# Получение списка сессий
echo "Получение активных сессий..."
SESSIONS_RESPONSE=$(curl -s -X GET $API_URL/auth/sessions \
  -H "Authorization: Bearer $ACCESS_TOKEN")

SESSIONS_COUNT=$(echo $SESSIONS_RESPONSE | jq '.sessions | length')
echo "  Активных сессий: $SESSIONS_COUNT"

if [ "$SESSIONS_COUNT" -gt 0 ]; then
  echo -e "${GREEN}✓ Сессии получены${NC}"
  
  # Вывод информации о сессиях
  echo $SESSIONS_RESPONSE | jq -r '.sessions[] | "  - \(.device_info // "Unknown device") | IP: \(.ip_address) | Создана: \(.created_at)"'
  
  # Получение ID первой сессии для теста удаления
  FIRST_SESSION_ID=$(echo $SESSIONS_RESPONSE | jq -r '.sessions[0].id')
  
  if [ "$FIRST_SESSION_ID" != "null" ] && [ "$SESSIONS_COUNT" -gt 1 ]; then
    echo ""
    echo "Отзыв сессии $FIRST_SESSION_ID..."
    REVOKE_RESPONSE=$(curl -s -X DELETE $API_URL/auth/sessions/$FIRST_SESSION_ID \
      -H "Authorization: Bearer $ACCESS_TOKEN")
    
    MESSAGE=$(echo $REVOKE_RESPONSE | jq -r '.message')
    if [ "$MESSAGE" == "Session revoked successfully" ]; then
      echo -e "${GREEN}✓ Сессия успешно отозвана${NC}"
    else
      echo -e "${RED}✗ Ошибка отзыва сессии${NC}"
      echo "$REVOKE_RESPONSE"
    fi
  fi
else
  echo -e "${RED}✗ Нет активных сессий${NC}"
fi

echo ""
echo "🔑 4. Тестирование восстановления пароля"
echo "==========================================="

echo "Запрос на восстановление пароля..."
RESET_REQUEST_RESPONSE=$(curl -s -X POST $API_URL/auth/password/reset \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\"
  }")

DEBUG_RESET_CODE=$(echo $RESET_REQUEST_RESPONSE | jq -r '.debug_code')

if [ "$DEBUG_RESET_CODE" != "null" ]; then
  echo -e "${GREEN}✓ Код восстановления отправлен${NC}"
  echo "  Debug код: $DEBUG_RESET_CODE"
  
  # Сброс пароля с кодом
  echo ""
  echo "Сброс пароля с кодом..."
  RESET_CONFIRM_RESPONSE=$(curl -s -X POST $API_URL/auth/password/reset/confirm \
    -H "Content-Type: application/json" \
    -d "{
      \"email\": \"$TEST_EMAIL\",
      \"code\": \"$DEBUG_RESET_CODE\",
      \"new_password\": \"$NEW_PASSWORD\"
    }")
  
  MESSAGE=$(echo $RESET_CONFIRM_RESPONSE | jq -r '.message')
  if [ "$MESSAGE" == "Password reset successfully" ]; then
    echo -e "${GREEN}✓ Пароль успешно изменен${NC}"
    
    # Попытка входа с новым паролем
    echo ""
    echo "Проверка входа с новым паролем..."
    LOGIN_RESPONSE=$(curl -s -X POST $API_URL/auth/login \
      -H "Content-Type: application/json" \
      -d "{
        \"email\": \"$TEST_EMAIL\",
        \"password\": \"$NEW_PASSWORD\"
      }")
    
    NEW_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.access_token')
    REQUIRES_2FA=$(echo $LOGIN_RESPONSE | jq -r '.requires_2fa')
    
    if [ "$NEW_TOKEN" != "null" ] || [ "$REQUIRES_2FA" == "true" ]; then
      echo -e "${GREEN}✓ Вход с новым паролем успешен${NC}"
      
      if [ "$REQUIRES_2FA" == "true" ]; then
        echo "  Требуется 2FA верификация"
      fi
    else
      echo -e "${RED}✗ Ошибка входа с новым паролем${NC}"
      echo "$LOGIN_RESPONSE"
    fi
  else
    echo -e "${RED}✗ Ошибка сброса пароля${NC}"
    echo "$RESET_CONFIRM_RESPONSE"
  fi
else
  echo -e "${RED}✗ Не удалось получить код восстановления${NC}"
  echo "$RESET_REQUEST_RESPONSE"
fi

echo ""
echo "🔐 5. Тестирование входа с 2FA"
echo "==========================================="

if [ "$IS_2FA_ENABLED" == "false" ]; then
  # Сначала включим 2FA если оно было выключено
  echo "Включение 2FA для теста входа..."
  
  # Используем новый токен если пароль был изменен
  if [ "$NEW_TOKEN" != "null" ]; then
    ACCESS_TOKEN=$NEW_TOKEN
  fi
  
  # Включение 2FA
  ENABLE_2FA_RESPONSE=$(curl -s -X POST $API_URL/auth/2fa/enable \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"method\": \"email\",
      \"password\": \"$NEW_PASSWORD\"
    }")
  
  DEBUG_CODE=$(echo $ENABLE_2FA_RESPONSE | jq -r '.debug_code')
  
  if [ "$DEBUG_CODE" != "null" ]; then
    # Подтверждение 2FA
    curl -s -X POST $API_URL/auth/2fa/confirm \
      -H "Authorization: Bearer $ACCESS_TOKEN" \
      -H "Content-Type: application/json" \
      -d "{
        \"code\": \"$DEBUG_CODE\",
        \"method\": \"email\"
      }" > /dev/null
  fi
fi

echo "Попытка входа (должна требовать 2FA)..."
LOGIN_2FA_RESPONSE=$(curl -s -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$NEW_PASSWORD\"
  }")

REQUIRES_2FA=$(echo $LOGIN_2FA_RESPONSE | jq -r '.requires_2fa')
VERIFICATION_METHOD=$(echo $LOGIN_2FA_RESPONSE | jq -r '.verification_method')
DEBUG_2FA_CODE=$(echo $LOGIN_2FA_RESPONSE | jq -r '.debug_code')

if [ "$REQUIRES_2FA" == "true" ]; then
  echo -e "${GREEN}✓ 2FA требуется для входа${NC}"
  echo "  Метод: $VERIFICATION_METHOD"
  echo "  Debug код: $DEBUG_2FA_CODE"
  
  # Проверка 2FA кода
  echo ""
  echo "Верификация 2FA кода..."
  VERIFY_2FA_RESPONSE=$(curl -s -X POST $API_URL/auth/login/2fa \
    -H "Content-Type: application/json" \
    -d "{
      \"email\": \"$TEST_EMAIL\",
      \"code\": \"$DEBUG_2FA_CODE\"
    }")
  
  FINAL_TOKEN=$(echo $VERIFY_2FA_RESPONSE | jq -r '.access_token')
  
  if [ "$FINAL_TOKEN" != "null" ]; then
    echo -e "${GREEN}✓ Вход с 2FA успешен${NC}"
    echo "  Получен токен доступа"
  else
    echo -e "${RED}✗ Ошибка верификации 2FA${NC}"
    echo "$VERIFY_2FA_RESPONSE"
  fi
else
  echo -e "${YELLOW}⚠ 2FA не требуется (возможно не настроено)${NC}"
fi

echo ""
echo "🗑️ 6. Тестирование удаления аккаунта"
echo "==========================================="

echo "Запрос на удаление аккаунта..."
DELETE_RESPONSE=$(curl -s -X POST $API_URL/auth/delete-account \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"password\": \"$NEW_PASSWORD\",
    \"reason\": \"Тестирование функции удаления\"
  }")

MESSAGE=$(echo $DELETE_RESPONSE | jq -r '.message')
DELETION_DATE=$(echo $DELETE_RESPONSE | jq -r '.deletion_date')

if [ "$MESSAGE" != "null" ] && [[ "$MESSAGE" == *"marked for deletion"* ]]; then
  echo -e "${GREEN}✓ Аккаунт помечен для удаления${NC}"
  echo "  Дата удаления: $DELETION_DATE"
  echo "  Есть 30 дней для восстановления"
else
  echo -e "${RED}✗ Ошибка запроса удаления${NC}"
  echo "$DELETE_RESPONSE"
fi

echo ""
echo "================================================="
echo "РЕЗУЛЬТАТЫ ТЕСТИРОВАНИЯ"
echo "================================================="

# Подсчет результатов
echo ""
echo "Протестированные функции:"
echo "  ✓ Регистрация и аутентификация"
echo "  ✓ Управление настройками 2FA"
echo "  ✓ Управление сессиями"
echo "  ✓ Восстановление пароля"
echo "  ✓ Вход с 2FA"
echo "  ✓ Удаление аккаунта"

echo ""
echo -e "${GREEN}Тестирование функций безопасности завершено!${NC}"
echo ""
echo "Примечания:"
echo "  - В продакшене коды верификации будут отправляться по email/SMS"
echo "  - Debug коды доступны только в режиме разработки"
echo "  - Удаленный аккаунт можно восстановить в течение 30 дней"
