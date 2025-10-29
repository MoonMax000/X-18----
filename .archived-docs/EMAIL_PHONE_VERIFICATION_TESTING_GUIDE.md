# Email & Phone Verification Testing Guide

## 📧 Email Verification Testing (Resend.com)

### Подход 1: Resend Test Mode + API Verification

Resend предоставляет Test Mode для разработки, где письма не отправляются реально, но можно проверить через API.

#### Настройка Test Mode
```bash
# В .env для тестов
RESEND_API_KEY=re_test_xxxxxxxxxx  # Test ключ начинается с re_test_
RESEND_TEST_MODE=true
```

#### Проверка отправленных писем через Resend API
```typescript
// test-email-verification.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

async function checkSentEmails() {
  try {
    // Получаем список отправленных писем
    const { data } = await resend.emails.list();
    
    console.log('📧 Recent emails:', data);
    
    // Поиск письма верификации
    const verificationEmail = data.find(email => 
      email.subject?.includes('Verify') || 
      email.subject?.includes('Confirmation')
    );
    
    if (verificationEmail) {
      console.log('✅ Verification email found:', {
        to: verificationEmail.to,
        subject: verificationEmail.subject,
        created_at: verificationEmail.created_at,
        status: verificationEmail.status
      });
      
      return verificationEmail;
    }
    
    console.log('❌ No verification email found');
    return null;
  } catch (error) {
    console.error('Error checking emails:', error);
    return null;
  }
}
```

#### Автоматизированный Тест
```bash
#!/bin/bash
# test-email-registration.sh

echo "🧪 Testing Email Registration & Verification"

# 1. Регистрация пользователя
TIMESTAMP=$(date +%s)
TEST_EMAIL="test${TIMESTAMP}@test.com"

echo "📝 Registering with email: $TEST_EMAIL"

REGISTER_RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"testuser${TIMESTAMP}\",
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"TestPassword123!\",
    \"display_name\": \"Test User\"
  }")

HTTP_CODE=$(echo "$REGISTER_RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "201" ]; then
  echo "✅ Registration successful"
  
  # 2. Проверка через Resend API
  echo "📧 Checking Resend for verification email..."
  
  # Ждем 2 секунды для отправки
  sleep 2
  
  # Вызов Node.js скрипта для проверки Resend API
  node check-resend-emails.js "$TEST_EMAIL"
  
else
  echo "❌ Registration failed (HTTP $HTTP_CODE)"
fi
```

```javascript
// check-resend-emails.js
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);
const targetEmail = process.argv[2];

async function main() {
  try {
    const { data } = await resend.emails.list({ limit: 10 });
    
    const email = data.find(e => e.to?.includes(targetEmail));
    
    if (email) {
      console.log('✅ Email sent to:', email.to);
      console.log('📋 Subject:', email.subject);
      console.log('📅 Sent at:', email.created_at);
      console.log('✉️ Status:', email.last_event || 'delivered');
      process.exit(0);
    } else {
      console.log('❌ Email not found for:', targetEmail);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
```

---

### Подход 2: Temporary Email Service (для автоматизации)

Используем сервис временных email адресов, который предоставляет API для чтения писем.

#### Mailsac.com (Рекомендуется)
```bash
# Установка
npm install @mailsac/api

# Или использование через REST API
curl https://mailsac.com/api/addresses/test@mailsac.com/messages
```

#### Автоматизированный тест с Mailsac
```typescript
// test-with-mailsac.ts
import axios from 'axios';

const MAILSAC_API_KEY = process.env.MAILSAC_API_KEY;
const BASE_URL = 'https://mailsac.com/api';

async function testEmailVerification() {
  // 1. Генерируем временный email
  const testEmail = `test${Date.now()}@mailsac.com`;
  
  console.log('📧 Using temp email:', testEmail);
  
  // 2. Регистрируемся
  const registerResponse = await axios.post('http://localhost:8080/api/auth/register', {
    username: `testuser${Date.now()}`,
    email: testEmail,
    password: 'TestPassword123!',
    display_name: 'Test User'
  });
  
  console.log('✅ Registration successful');
  
  // 3. Ждем письмо (retry logic)
  let attempts = 0;
  const maxAttempts = 10;
  
  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s
    
    try {
      // Проверяем inbox
      const response = await axios.get(
        `${BASE_URL}/addresses/${testEmail}/messages`,
        { headers: { 'Mailsac-Key': MAILSAC_API_KEY } }
      );
      
      const emails = response.data;
      
      if (emails.length > 0) {
        const verificationEmail = emails[0];
        console.log('✅ Verification email received!');
        console.log('Subject:', verificationEmail.subject);
        
        // 4. Извлекаем verification code/link
        const emailContent = await axios.get(
          `${BASE_URL}/text/${verificationEmail._id}`,
          { headers: { 'Mailsac-Key': MAILSAC_API_KEY } }
        );
        
        const text = emailContent.data;
        
        // Ищем код верификации (например, 6 цифр)
        const codeMatch = text.match(/\b\d{6}\b/);
        if (codeMatch) {
          console.log('🔑 Verification code:', codeMatch[0]);
          return codeMatch[0];
        }
        
        // Или ищем ссылку верификации
        const linkMatch = text.match(/https?:\/\/[^\s]+verify[^\s]*/i);
        if (linkMatch) {
          console.log('🔗 Verification link:', linkMatch[0]);
          return linkMatch[0];
        }
        
        return true;
      }
      
      console.log(`⏳ Attempt ${attempts + 1}/${maxAttempts} - No email yet...`);
      attempts++;
      
    } catch (error) {
      console.error('Error checking email:', error.message);
      attempts++;
    }
  }
  
  console.log('❌ Verification email not received after', maxAttempts, 'attempts');
  return null;
}

testEmailVerification().then(result => {
  if (result) {
    console.log('\n🎉 Email verification test PASSED');
    process.exit(0);
  } else {
    console.log('\n❌ Email verification test FAILED');
    process.exit(1);
  }
});
```

---

### Подход 3: Resend Webhooks (Real-time)

Создаем endpoint для получения уведомлений от Resend о отправленных письмах.

```typescript
// webhook-handler.ts
import express from 'express';

const app = express();
app.use(express.json());

const sentEmails: any[] = [];

app.post('/webhooks/resend', (req, res) => {
  const event = req.body;
  
  console.log('📧 Resend webhook event:', event.type);
  
  if (event.type === 'email.sent' || event.type === 'email.delivered') {
    sentEmails.push({
      to: event.data.to,
      subject: event.data.subject,
      timestamp: new Date(),
      event: event.type
    });
    
    console.log('✅ Email tracked:', event.data.to);
  }
  
  res.json({ received: true });
});

// API для проверки в тестах
app.get('/test/emails/:email', (req, res) => {
  const email = req.params.email;
  const found = sentEmails.filter(e => e.to.includes(email));
  res.json({ emails: found });
});

app.listen(3001, () => {
  console.log('🎧 Webhook listener running on :3001');
});
```

---

## 📱 Phone/SMS Verification Testing

### Подход 1: Mock SMS Provider (Development)

Для тестов используем mock провайдера, который не отправляет реальные SMS.

```typescript
// sms-service.ts
interface SMSProvider {
  sendSMS(to: string, message: string): Promise<boolean>;
}

class MockSMSProvider implements SMSProvider {
  private sentMessages: Map<string, string[]> = new Map();
  
  async sendSMS(to: string, message: string): Promise<boolean> {
    console.log(`📱 [MOCK SMS] To: ${to}`);
    console.log(`📝 [MOCK SMS] Message: ${message}`);
    
    if (!this.sentMessages.has(to)) {
      this.sentMessages.set(to, []);
    }
    
    this.sentMessages.get(to)!.push(message);
    
    // Сохраняем в файл для тестов
    const fs = require('fs');
    fs.writeFileSync(
      '.test-sms-messages.json',
      JSON.stringify(Array.from(this.sentMessages.entries()), null, 2)
    );
    
    return true;
  }
  
  getMessagesByPhone(phone: string): string[] {
    return this.sentMessages.get(phone) || [];
  }
  
  getLastCode(phone: string): string | null {
    const messages = this.getMessagesByPhone(phone);
    if (messages.length === 0) return null;
    
    const lastMessage = messages[messages.length - 1];
    const codeMatch = lastMessage.match(/\b\d{6}\b/);
    return codeMatch ? codeMatch[0] : null;
  }
}

// Export singleton
export const smsProvider = new MockSMSProvider();
```

#### Тест с Mock SMS
```bash
#!/bin/bash
# test-phone-registration.sh

echo "📱 Testing Phone Registration & SMS Verification"

TIMESTAMP=$(date +%s)
TEST_PHONE="+1555${TIMESTAMP: -7}"  # Fake US number

echo "📝 Registering with phone: $TEST_PHONE"

# 1. Регистрация
curl -s -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"phoneuser${TIMESTAMP}\",
    \"email\": \"${TEST_PHONE}@phone.temp\",
    \"password\": \"TestPassword123!\",
    \"phone\": \"$TEST_PHONE\"
  }"

echo ""
echo "⏳ Checking for SMS..."
sleep 1

# 2. Проверяем mock SMS файл
if [ -f ".test-sms-messages.json" ]; then
  echo "📱 Mock SMS messages:"
  cat .test-sms-messages.json | jq ".[] | select(.[0] == \"$TEST_PHONE\")"
  
  # Извлекаем код
  CODE=$(cat .test-sms-messages.json | jq -r ".[] | select(.[0] == \"$TEST_PHONE\") | .[1][-1]" | grep -o '\b[0-9]\{6\}\b')
  
  if [ -n "$CODE" ]; then
    echo "✅ SMS Code received: $CODE"
  else
    echo "❌ No SMS code found"
  fi
else
  echo "❌ No SMS messages file found"
fi
```

---

### Подход 2: Twilio Test Credentials

Twilio предоставляет test credentials для тестирования без отправки реальных SMS.

```typescript
// twilio-test-service.ts
import twilio from 'twilio';

// Test credentials (не отправляют реальные SMS)
const TEST_ACCOUNT_SID = 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';  // Test SID
const TEST_AUTH_TOKEN = 'your_test_auth_token';

const client = twilio(TEST_ACCOUNT_SID, TEST_AUTH_TOKEN);

async function sendTestSMS(to: string, code: string) {
  try {
    // В test mode SMS не отправляется, но возвращает success
    const message = await client.messages.create({
      body: `Your verification code is: ${code}`,
      from: '+15005550006',  // Twilio magic number для тестов
      to: to
    });
    
    console.log('✅ Test SMS sent:', message.sid);
    console.log('📱 To:', to);
    console.log('🔑 Code:', code);
    
    return { success: true, sid: message.sid, code };
  } catch (error) {
    console.error('❌ SMS error:', error);
    return { success: false, error };
  }
}

// Twilio Magic Numbers для тестирования:
// +15005550001 - invalid (ошибка)
// +15005550006 - valid (успех без отправки)
```

---

### Подход 3: Temporary Phone Numbers Service

Используем сервис временных номеров с API для чтения SMS.

#### SMS-Activate.org / Receive-SMS-Online.com
```typescript
// temp-phone-service.ts
import axios from 'axios';

const SMS_SERVICE_API_KEY = process.env.SMS_SERVICE_API_KEY;

async function getTempPhoneNumber(): Promise<string> {
  // Получаем временный номер
  const response = await axios.get(
    'https://api.sms-activate.org/stubs/handler_api.php',
    {
      params: {
        api_key: SMS_SERVICE_API_KEY,
        action: 'getNumber',
        service: 'go',  // your service code
        country: 1      // USA
      }
    }
  );
  
  // Формат ответа: ACCESS_NUMBER:ID:PHONE_NUMBER
  const [status, id, phone] = response.data.split(':');
  
  if (status === 'ACCESS_NUMBER') {
    console.log('📱 Got temp phone:', phone);
    return phone;
  }
  
  throw new Error('Failed to get temp phone number');
}

async function waitForSMS(activationId: string): Promise<string> {
  let attempts = 0;
  const maxAttempts = 20;
  
  while (attempts < maxAttempts) {
    const response = await axios.get(
      'https://api.sms-activate.org/stubs/handler_api.php',
      {
        params: {
          api_key: SMS_SERVICE_API_KEY,
          action: 'getStatus',
          id: activationId
        }
      }
    );
    
    // STATUS_OK:CODE
    if (response.data.startsWith('STATUS_OK')) {
      const code = response.data.split(':')[1];
      console.log('✅ SMS received, code:', code);
      return code;
    }
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    attempts++;
  }
  
  throw new Error('SMS not received');
}
```

---

## 🧪 Рекомендуемая Стратегия Тестирования

### Development/CI:
```
✅ Email: Mock provider + файловая проверка
✅ Phone: Mock provider + файловая проверка
⚡ Быстро, надежно, без внешних зависимостей
```

### Staging:
```
✅ Email: Resend Test Mode + API verification
✅ Phone: Twilio Test Credentials
⚡ Реальные провайдеры, но без real отправки
```

### Manual/E2E Testing:
```
✅ Email: Temporary email (mailsac.com)
✅ Phone: Temporary phone (sms-activate.org)
⚡ Полный real-world тест
```

---

## 📋 Готовый Тестовый Скрипт

```bash
#!/bin/bash
# test-complete-registration.sh

echo "🧪 Complete Registration Testing Suite"
echo "======================================"

# Test 1: Email Registration
echo ""
echo "📧 [TEST 1] Email Registration"
TIMESTAMP=$(date +%s)
TEST_EMAIL="test${TIMESTAMP}@mailsac.com"

echo "Registering with: $TEST_EMAIL"

curl -s -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"emailuser${TIMESTAMP}\",
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"TestPassword123!\",
    \"display_name\": \"Email User\"
  }" | jq .

echo "⏳ Waiting for email (10 seconds)..."
sleep 10

# Check mailsac
echo "Checking mailsac inbox..."
curl -s "https://mailsac.com/api/addresses/$TEST_EMAIL/messages" | jq '.[0].subject'

# Test 2: Phone Registration (Mock)
echo ""
echo "📱 [TEST 2] Phone Registration (Mock)"
TEST_PHONE="+1555${TIMESTAMP: -7}"

echo "Registering with: $TEST_PHONE"

curl -s -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"phoneuser${TIMESTAMP}\",
    \"email\": \"${TEST_PHONE}@phone.temp\",
    \"password\": \"TestPassword123!\",
    \"phone\": \"$TEST_PHONE\"
  }" | jq .

echo "📱 Checking mock SMS messages..."
if [ -f ".test-sms-messages.json" ]; then
  cat .test-sms-messages.json | jq ".[] | select(.[0] == \"$TEST_PHONE\")"
else
  echo "⚠️  Mock SMS file not found (SMS provider may not be configured)"
fi

echo ""
echo "✅ Testing complete!"
```

---

## 🎯 Итого

### Email Testing:
1. **Development:** Mock + файл проверка ✅
2. **Staging:** Resend API + webhooks ✅
3. **E2E:** Temporary email service (mailsac) ✅

### Phone Testing:
1. **Development:** Mock SMS provider + файл ✅
2. **Staging:** Twilio test credentials ✅
3. **E2E:** Temporary phone service ✅

**Все подходы документированы с примерами кода!** 🚀
