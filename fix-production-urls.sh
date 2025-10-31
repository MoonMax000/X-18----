#!/bin/bash

# Скрипт для замены всех старых Netlify URL на правильный production домен

echo "🔄 Замена production URLs на social.tyriantrade.com..."

# Основные URL для замены
OLD_URLS=(
  "x-18.netlify.app"
  "sunny-froyo-f47377.netlify.app"
  "wonderful-einstein-123abc.netlify.app"
  "x-18-production.netlify.app"
)

NEW_URL="social.tyriantrade.com"

# Счетчик замен
TOTAL_REPLACED=0

# Замена в .md файлах
for old_url in "${OLD_URLS[@]}"; do
  echo "📝 Замена $old_url → $NEW_URL"
  
  # Найти все .md файлы и заменить
  count=$(find . -name "*.md" -type f -exec grep -l "$old_url" {} \; | wc -l | tr -d ' ')
  
  if [ "$count" -gt 0 ]; then
    echo "   Найдено файлов: $count"
    find . -name "*.md" -type f -exec sed -i '' "s|$old_url|$NEW_URL|g" {} \;
    TOTAL_REPLACED=$((TOTAL_REPLACED + count))
  fi
done

# Замена в конфигурационных файлах
CONFIG_FILES=(
  "client/.env.production"
  ".env"
  "netlify.toml"
)

for config_file in "${CONFIG_FILES[@]}"; do
  if [ -f "$config_file" ]; then
    echo "⚙️  Обработка $config_file"
    for old_url in "${OLD_URLS[@]}"; do
      sed -i '' "s|$old_url|$NEW_URL|g" "$config_file" 2>/dev/null || true
    done
  fi
done

echo ""
echo "✅ Замена завершена!"
echo "📊 Обработано файлов: $TOTAL_REPLACED"
echo ""
echo "🔍 Проверка оставшихся упоминаний netlify.app (кроме примеров):"
echo ""

# Показать оставшиеся упоминания (исключая шаблоны)
grep -r "netlify\.app" --include="*.md" . | \
  grep -v "your-app.netlify.app" | \
  grep -v "your-site.netlify.app" | \
  grep -v "random-name.netlify.app" | \
  grep -v "ваш-проект.netlify.app" | \
  grep -v "ваш-сайт.netlify.app" | \
  grep -v "amazing-einstein-abc123.netlify.app" | \
  head -10

echo ""
echo "✨ Готово! Production домен: https://$NEW_URL"
