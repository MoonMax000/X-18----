#!/bin/bash

# Скрипт для тестирования сохранения медиа файлов

echo "=============================================="
echo "Тест сохранения медиа файлов"
echo "=============================================="

# Цвета для вывода
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Настройки
API_URL="${API_URL:-http://localhost:8080/api}"
STORAGE_PATH="${STORAGE_PATH:-./storage/media}"

# Проверка переменных окружения
echo -e "\n${YELLOW}1. Проверка конфигурации...${NC}"
echo "API URL: $API_URL"
echo "Storage Path: $STORAGE_PATH"

if [ -n "$RAILWAY_ENVIRONMENT" ]; then
    echo -e "${BLUE}Обнаружено окружение Railway${NC}"
    echo "RAILWAY_VOLUME_MOUNT_PATH: ${RAILWAY_VOLUME_MOUNT_PATH:-не установлена}"
    
    if [ -n "$RAILWAY_VOLUME_MOUNT_PATH" ]; then
        STORAGE_PATH="$RAILWAY_VOLUME_MOUNT_PATH/media"
        echo -e "${GREEN}✓ Используется Railway volume: $STORAGE_PATH${NC}"
    else
        echo -e "${YELLOW}⚠ RAILWAY_VOLUME_MOUNT_PATH не установлена${NC}"
    fi
fi

# Проверка доступности backend
echo -e "\n${YELLOW}2. Проверка доступности backend...${NC}"
if ! curl -s -f "$API_URL/health" > /dev/null 2>&1; then
    echo -e "${RED}✗ Backend недоступен на $API_URL${NC}"
    echo "Убедитесь, что backend запущен"
    exit 1
fi
echo -e "${GREEN}✓ Backend доступен${NC}"

# Получение токена (нужно быть авторизованным)
echo -e "\n${YELLOW}3. Авторизация...${NC}"
echo "Введите email пользователя:"
read -r USER_EMAIL
echo "Введите пароль:"
read -s -r USER_PASSWORD
echo

# Авторизация
AUTH_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$USER_EMAIL\",\"password\":\"$USER_PASSWORD\"}")

ACCESS_TOKEN=$(echo "$AUTH_RESPONSE" | jq -r '.access_token // empty')

if [ -z "$ACCESS_TOKEN" ]; then
    echo -e "${RED}✗ Ошибка авторизации${NC}"
    echo "$AUTH_RESPONSE" | jq '.'
    exit 1
fi

echo -e "${GREEN}✓ Авторизация успешна${NC}"

# Создание тестового изображения
echo -e "\n${YELLOW}4. Создание тестового изображения...${NC}"
TEST_IMAGE="/tmp/test_image_$(date +%s).png"

# Создаём простое изображение с помощью ImageMagick или используем существующее
if command -v convert >/dev/null 2>&1; then
    # Если есть ImageMagick, создаём изображение
    convert -size 400x300 xc:skyblue \
        -font Helvetica -pointsize 40 \
        -draw "gravity center fill black text 0,0 'Test Image $(date +%H:%M:%S)'" \
        "$TEST_IMAGE"
    echo -e "${GREEN}✓ Создано тестовое изображение с ImageMagick${NC}"
elif [ -f "/tmp/test_image.png" ]; then
    # Используем готовое изображение
    cp "/tmp/test_image.png" "$TEST_IMAGE"
    echo -e "${GREEN}✓ Использовано существующее тестовое изображение${NC}"
else
    # Создаём минимальное PNG изображение вручную
    printf '\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x01\x00\x00\x00\x007n\xf9$\x00\x00\x00\nIDATx\x9cc\xfa\x00\x00\x00\x01\x00\x01UU\x86\x18\x00\x00\x00\x00IEND\xaeB`\x82' > "$TEST_IMAGE"
    echo -e "${YELLOW}⚠ Создано минимальное PNG изображение${NC}"
fi

# Загрузка изображения
echo -e "\n${YELLOW}5. Загрузка изображения на сервер...${NC}"
UPLOAD_RESPONSE=$(curl -s -X POST "$API_URL/media/upload" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -F "file=@$TEST_IMAGE" \
    -F "alt_text=Test image for media storage")

# Проверка результата
MEDIA_ID=$(echo "$UPLOAD_RESPONSE" | jq -r '.id // empty')
MEDIA_URL=$(echo "$UPLOAD_RESPONSE" | jq -r '.url // empty')
MEDIA_STATUS=$(echo "$UPLOAD_RESPONSE" | jq -r '.status // empty')

if [ -z "$MEDIA_ID" ]; then
    echo -e "${RED}✗ Ошибка при загрузке файла${NC}"
    echo "$UPLOAD_RESPONSE" | jq '.'
    rm -f "$TEST_IMAGE"
    exit 1
fi

echo -e "${GREEN}✓ Файл успешно загружен${NC}"
echo "Media ID: $MEDIA_ID"
echo "Media URL: $MEDIA_URL"
echo "Status: $MEDIA_STATUS"

# Извлекаем имя файла из URL
FILENAME=$(basename "$MEDIA_URL")
EXPECTED_PATH="$STORAGE_PATH/$FILENAME"

# Проверка существования файла
echo -e "\n${YELLOW}6. Проверка сохранения файла...${NC}"
echo "Ожидаемый путь: $EXPECTED_PATH"

# Для Railway проверяем через API
if [ -n "$RAILWAY_ENVIRONMENT" ]; then
    echo -e "${BLUE}Проверка через API (Railway environment)...${NC}"
    
    # Пытаемся получить информацию о медиа
    MEDIA_INFO=$(curl -s -H "Authorization: Bearer $ACCESS_TOKEN" \
        "$API_URL/media/$MEDIA_ID")
    
    if echo "$MEDIA_INFO" | jq -e '.id' >/dev/null 2>&1; then
        echo -e "${GREEN}✓ Медиа запись найдена в базе данных${NC}"
        
        # Пытаемся загрузить файл по URL
        HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$MEDIA_URL")
        if [ "$HTTP_CODE" -eq 200 ]; then
            echo -e "${GREEN}✓ Файл доступен по URL${NC}"
        else
            echo -e "${RED}✗ Файл недоступен по URL (HTTP $HTTP_CODE)${NC}"
        fi
    else
        echo -e "${RED}✗ Медиа запись не найдена${NC}"
    fi
else
    # Для локального окружения проверяем файловую систему
    echo -e "${BLUE}Проверка файловой системы (локальное окружение)...${NC}"
    
    if [ -f "$EXPECTED_PATH" ]; then
        echo -e "${GREEN}✓ Файл найден на диске${NC}"
        FILE_SIZE=$(stat -f%z "$EXPECTED_PATH" 2>/dev/null || stat -c%s "$EXPECTED_PATH" 2>/dev/null)
        echo "Размер файла: $FILE_SIZE байт"
    else
        echo -e "${RED}✗ Файл не найден на диске${NC}"
        
        # Проверяем альтернативные пути
        echo -e "\n${YELLOW}Проверка альтернативных путей...${NC}"
        for ALT_PATH in "./storage/media" "/app/storage/media" "/tmp/storage/media"; do
            ALT_FILE="$ALT_PATH/$FILENAME"
            if [ -f "$ALT_FILE" ]; then
                echo -e "${YELLOW}Файл найден в: $ALT_FILE${NC}"
            fi
        done
    fi
fi

# Проверка логов (если backend выводит их)
echo -e "\n${YELLOW}7. Проверка логов backend...${NC}"
echo "Проверьте консоль backend для сообщений вида:"
echo "- 'Media storage initialized at: ...'"
echo "- 'Saving file to: ...'"
echo "- 'File saved successfully to: ...'"
echo "- 'Media saved successfully: ID=...'"

# Очистка
echo -e "\n${YELLOW}8. Очистка тестовых данных...${NC}"
rm -f "$TEST_IMAGE"

# Опционально: удаление загруженного медиа
echo -e "\nУдалить загруженный файл? (y/n)"
read -r DELETE_CONFIRM

if [ "$DELETE_CONFIRM" = "y" ]; then
    DELETE_RESPONSE=$(curl -s -X DELETE "$API_URL/media/$MEDIA_ID" \
        -H "Authorization: Bearer $ACCESS_TOKEN")
    
    if echo "$DELETE_RESPONSE" | jq -e '.message' >/dev/null 2>&1; then
        echo -e "${GREEN}✓ Файл удалён${NC}"
    else
        echo -e "${RED}✗ Ошибка при удалении файла${NC}"
        echo "$DELETE_RESPONSE" | jq '.'
    fi
fi

echo -e "\n${GREEN}=============================================="
echo -e "Тестирование завершено!"
echo -e "==============================================${NC}"

echo -e "\n${YELLOW}Рекомендации для Railway:${NC}"
echo "1. Убедитесь, что volume примонтирован в Railway"
echo "2. Установите переменную STORAGE_PATH=/app/storage"
echo "3. Проверьте логи приложения в Railway Dashboard"
echo "4. Убедитесь, что BASE_URL указывает на ваш Railway домен"
