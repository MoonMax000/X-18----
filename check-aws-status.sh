#!/bin/bash

# Скрипт автоматической проверки статуса AWS сервисов
# Проверяет каждые 2 минуты: AWS SES, SSL certificates, DNS records

echo "🔄 Запуск автоматической проверки статуса AWS..."
echo "⏰ Проверка выполняется каждые 2 минуты"
echo "❌ Нажмите Ctrl+C чтобы остановить"
echo ""

while true; do
    TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
    echo "=================================================="
    echo "⏰ Проверка в $TIMESTAMP"
    echo "=================================================="
    
    # 1. Проверка AWS SES Domain
    echo ""
    echo "📧 1. AWS SES Domain Status:"
    SES_STATUS=$(aws sesv2 get-email-identity \
        --email-identity tyriantrade.com \
        --region us-east-1 \
        --query 'DkimAttributes.Status' \
        --output text 2>/dev/null)
    
    if [ "$SES_STATUS" == "SUCCESS" ]; then
        echo "   ✅ tyriantrade.com: $SES_STATUS"
        echo "   🎉 Email домен верифицирован!"
    elif [ "$SES_STATUS" == "PENDING" ]; then
        echo "   ⏳ tyriantrade.com: $SES_STATUS (ожидает DNS)"
    else
        echo "   ❌ tyriantrade.com: Ошибка проверки"
    fi
    
    # 2. Проверка SSL Certificate для social.tyriantrade.com
    echo ""
    echo "🔒 2. SSL Certificate - social.tyriantrade.com:"
    SOCIAL_CERT=$(aws acm describe-certificate \
        --certificate-arn arn:aws:acm:us-east-1:506675684508:certificate/4d88fc34-cefa-4174-9fc3-9f01dd9507cd \
        --region us-east-1 \
        --query 'Certificate.Status' \
        --output text 2>/dev/null)
    
    if [ "$SOCIAL_CERT" == "ISSUED" ]; then
        echo "   ✅ social: $SOCIAL_CERT"
        echo "   🎉 SSL сертификат выдан!"
    elif [ "$SOCIAL_CERT" == "PENDING_VALIDATION" ]; then
        echo "   ⏳ social: $SOCIAL_CERT (ожидает DNS)"
    else
        echo "   ❌ social: Ошибка проверки"
    fi
    
    # 3. Проверка SSL Certificate для api.tyriantrade.com
    echo ""
    echo "🔒 3. SSL Certificate - api.tyriantrade.com:"
    API_CERT=$(aws acm describe-certificate \
        --certificate-arn arn:aws:acm:us-east-1:506675684508:certificate/3e33a794-b1ef-4fe1-bd56-f735380a36d8 \
        --region us-east-1 \
        --query 'Certificate.Status' \
        --output text 2>/dev/null)
    
    if [ "$API_CERT" == "ISSUED" ]; then
        echo "   ✅ api: $API_CERT"
        echo "   🎉 SSL сертификат выдан!"
    elif [ "$API_CERT" == "PENDING_VALIDATION" ]; then
        echo "   ⏳ api: $API_CERT (ожидает DNS)"
    else
        echo "   ❌ api: Ошибка проверки"
    fi
    
    # 4. Проверка DNS записей
    echo ""
    echo "🌐 4. DNS Records:"
    
    # DKIM 1
    DKIM1=$(dig ketwfkhhfnyefrl3peogwicbdskes3c3._domainkey.tyriantrade.com CNAME +short 2>/dev/null | head -1)
    if [ -n "$DKIM1" ]; then
        echo "   ✅ DKIM 1: работает"
    else
        echo "   ❌ DKIM 1: не найдена"
    fi
    
    # DKIM 2
    DKIM2=$(dig i6ng2p3c4slbbbqjotub3ogxnvhtijtn._domainkey.tyriantrade.com CNAME +short 2>/dev/null | head -1)
    if [ -n "$DKIM2" ]; then
        echo "   ✅ DKIM 2: работает"
    else
        echo "   ❌ DKIM 2: не найдена"
    fi
    
    # DKIM 3
    DKIM3=$(dig ke2vamrd42qlsazjjlod2neows46uyso._domainkey.tyriantrade.com CNAME +short 2>/dev/null | head -1)
    if [ -n "$DKIM3" ]; then
        echo "   ✅ DKIM 3: работает"
    else
        echo "   ❌ DKIM 3: не найдена"
    fi
    
    # Social domain
    SOCIAL_DNS=$(dig social.tyriantrade.com CNAME +short 2>/dev/null | head -1)
    if [ -n "$SOCIAL_DNS" ]; then
        echo "   ✅ social.tyriantrade.com: работает"
    else
        echo "   ⏳ social.tyriantrade.com: не найдена"
    fi
    
    # API domain
    API_DNS=$(dig api.tyriantrade.com CNAME +short 2>/dev/null | head -1)
    if [ -n "$API_DNS" ]; then
        echo "   ✅ api.tyriantrade.com: работает"
    else
        echo "   ⏳ api.tyriantrade.com: не найдена"
    fi
    
    # 5. Итоговый статус
    echo ""
    echo "📊 Итоговый статус:"
    
    ALL_READY=true
    
    if [ "$SES_STATUS" != "SUCCESS" ]; then
        echo "   ⏳ AWS SES: ожидает верификации"
        ALL_READY=false
    fi
    
    if [ "$SOCIAL_CERT" != "ISSUED" ]; then
        echo "   ⏳ SSL social: ожидает верификации"
        ALL_READY=false
    fi
    
    if [ "$API_CERT" != "ISSUED" ]; then
        echo "   ⏳ SSL api: ожидает верификации"
        ALL_READY=false
    fi
    
    if [ -z "$SOCIAL_DNS" ] || [ -z "$API_DNS" ]; then
        echo "   ⏳ DNS domains: ожидают добавления"
        ALL_READY=false
    fi
    
    if [ "$ALL_READY" = true ]; then
        echo ""
        echo "🎉🎉🎉 ВСЁ ГОТОВО! 🎉🎉🎉"
        echo "   ✅ AWS SES верифицирован"
        echo "   ✅ SSL сертификаты выданы"
        echo "   ✅ DNS записи работают"
        echo ""
        echo "Можно завершать настройку CloudFront и ALB!"
        echo ""
        # Не выходим, продолжаем мониторить
    fi
    
    echo ""
    echo "⏰ Следующая проверка через 2 минуты..."
    echo "❌ Ctrl+C чтобы остановить"
    echo ""
    
    sleep 120  # 2 минуты
done
