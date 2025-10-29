#!/bin/bash

# Цвета для вывода
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

API_URL="https://api.tyriantrade.com"

echo -e "${BLUE}🧪 Тестирование загрузки медиа на Railway${NC}\n"

# 1. Регистрация тестового пользователя
echo -e "${BLUE}1. Регистрация тестового пользователя...${NC}"
SIGNUP_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test_upload_'$(date +%s)'",
    "email": "test_upload_'$(date +%s)'@test.com",
    "password": "Test123456!",
    "full_name": "Test Upload User"
  }')

TOKEN=$(echo $SIGNUP_RESPONSE | jq -r '.token' 2>/dev/null)

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
  echo -e "${RED}❌ Ошибка регистрации${NC}"
  echo $SIGNUP_RESPONSE | jq '.' 2>/dev/null || echo $SIGNUP_RESPONSE
  exit 1
fi

echo -e "${GREEN}✓ Пользователь создан${NC}"
echo "Token: ${TOKEN:0:20}..."

# 2. Создать тестовое изображение
echo -e "\n${BLUE}2. Создание тестового изображения...${NC}"

# Проверяем наличие ImageMagick
if command -v convert &> /dev/null; then
  convert -size 800x600 xc:blue \
    -pointsize 72 -fill white \
    -gravity center -annotate +0+0 "Railway Test" \
    test_image.jpg
  echo -e "${GREEN}✓ Изображение создано: test_image.jpg${NC}"
else
  echo -e "${YELLOW}⚠ ImageMagick не установлен${NC}"
  echo -e "${YELLOW}Создаем простое изображение...${NC}"
  # Создаем простой JPG через printf (1x1 пиксель)
  printf '\xFF\xD8\xFF\xE0\x00\x10\x4A\x46\x49\x46\x00\x01\x01\x01\x00\x48\x00\x48\x00\x00\xFF\xDB\x00\x43\x00\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\x09\x09\x08\x0A\x0C\x14\x0D\x0C\x0B\x0B\x0C\x19\x12\x13\x0F\x14\x1D\x1A\x1F\x1E\x1D\x1A\x1C\x1C\x20\x24\x2E\x27\x20\x22\x2C\x23\x1C\x1C\x28\x37\x29\x2C\x30\x31\x34\x34\x34\x1F\x27\x39\x3D\x38\x32\x3C\x2E\x33\x34\x32\xFF\xC0\x00\x0B\x08\x00\x01\x00\x01\x01\x01\x11\x00\xFF\xC4\x00\x14\x00\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\xFF\xDA\x00\x08\x01\x01\x00\x00\x3F\x00\xD2\xFF\xD9' > test_image.jpg
  echo -e "${GREEN}✓ Простое изображение создано${NC}"
fi

if [ ! -f "test_image.jpg" ]; then
  echo -e "${RED}❌ Не удалось создать изображение${NC}"
  exit 1
fi

# 3. Загрузить файл
echo -e "\n${BLUE}3. Загрузка файла на Railway...${NC}"
UPLOAD_RESPONSE=$(curl -s -X POST "$API_URL/api/media/upload" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test_image.jpg" \
  -F "alt_text=Railway Volume Test")

echo $UPLOAD_RESPONSE | jq '.' 2>/dev/null || echo $UPLOAD_RESPONSE

MEDIA_URL=$(echo $UPLOAD_RESPONSE | jq -r '.url' 2>/dev/null)

if [ -z "$MEDIA_URL" ] || [ "$MEDIA_URL" = "null" ]; then
  echo -e "${RED}❌ Ошибка загрузки${NC}"
  rm -f test_image.jpg
  exit 1
fi

echo -e "${GREEN}✓ Файл загружен!${NC}"
echo "URL: $MEDIA_URL"

# 4. Проверить что файл доступен
echo -e "\n${BLUE}4. Проверка доступности файла...${NC}"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$MEDIA_URL")

if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✓ Файл доступен! (HTTP $HTTP_CODE)${NC}"
else
  echo -e "${RED}❌ Файл недоступен (HTTP $HTTP_CODE)${NC}"
  rm -f test_image.jpg
  exit 1
fi

# 5. Скачать файл для проверки
echo -e "\n${BLUE}5. Скачивание файла для проверки...${NC}"
curl -s "$MEDIA_URL" -o downloaded_image.jpg

if [ -f "downloaded_image.jpg" ]; then
  SIZE=$(ls -lh downloaded_image.jpg | awk '{print $5}')
  echo -e "${GREEN}✓ Файл скачан: downloaded_image.jpg ($SIZE)${NC}"
else
  echo -e "${RED}❌ Не удалось скачать файл${NC}"
  rm -f test_image.jpg
  exit 1
fi

# Очистка
rm -f test_image.jpg downloaded_image.jpg

echo -e "\n${GREEN}✅ Тест завершен успешно!${NC}"
echo -e "${BLUE}Railway Volume работает корректно${NC}"
