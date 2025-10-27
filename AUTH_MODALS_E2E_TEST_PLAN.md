# Auth Modals - Comprehensive E2E Testing Plan

**Цель:** Полное тестирование модальных окон регистрации и авторизации со всеми валидациями, edge cases и сценариями восстановления пароля.

---

## 📋 Тестовое Покрытие

### ✅ SignUpModal (Регистрация)

#### 1. **Переключение Email/Phone Tabs**
- [ ] Переключение с Email на Phone
- [ ] Переключение с Phone на Email
- [ ] Очистка ошибок при переключении
- [ ] Сохранение введенных данных при переключении

#### 2. **Email Validation**
```typescript
Test Cases:
✓ Пустое поле - нет ошибки
✓ Неверный формат: "test" → "Please enter a valid email address"
✓ Неверный формат: "test@" → "Please enter a valid email address"
✓ Неверный формат: "test@domain" → "Please enter a valid email address"
✓ Правильный формат: "test@domain.com" → нет ошибки
✓ Существующий email: "example@gmail.com" → "This email is already registered"
✓ Ошибка исчезает при исправлении
```

#### 3. **Phone Validation**
```typescript
Test Cases:
✓ Пустое поле - нет ошибки
✓ Без + в начале: "1234567890" → "Phone number must start with +"
✓ Слишком короткий: "+123" → "Phone number is too short"
✓ Правильный формат: "+1234567890" → нет ошибки
✓ Существующий номер: "89743531212" → "This phone number is already in use"
✓ Максимум 16 символов (автоограничение)
```

#### 4. **Password Requirements (4 критерия)**
```typescript
Требования:
1. ✓ At least 12 characters
2. ✓ Uppercase and lowercase
3. ✓ A number
4. ✓ A special character

Test Cases:
✓ Пустой пароль - все requirements серые (neutral)
✓ "short" → только length красный
✓ "verylongpassword" → length ✓, остальные ✗
✓ "VeryLongPassword" → length ✓, case ✓, остальные ✗
✓ "VeryLongPassword123" → length ✓, case ✓, number ✓, special ✗
✓ "VeryLongPassword123!" → ВСЕ ✓ (зеленые галочки)
✓ Визуальная индикация (зеленые галочки для выполненных)
```

#### 5. **Password Visibility Toggle**
```typescript
Test Cases:
✓ По умолчанию пароль скрыт (точки)
✓ Клик на иконку глаза → пароль виден (text)
✓ Повторный клик → пароль снова скрыт
✓ Визуальные индикаторы (точки vs текст)
```

#### 6. **Confirm Password**
```typescript
Test Cases:
✓ Пустое поле - нет ошибки
✓ Не совпадает с password → "Passwords do not match"
✓ Совпадает с password → нет ошибки
✓ Изменение password обновляет валидацию confirm
✓ Visibility toggle работает независимо
```

#### 7. **Submit Button States**
```typescript
Test Cases:
✓ Disabled когда:
  - Email/Phone пустые
  - Password не соответствует требованиям
  - Passwords не совпадают
  - Есть ошибки валидации
✓ Enabled когда:
  - Email/Phone корректны
  - Password соответствует всем 4 требованиям
  - Passwords совпадают
  - Нет ошибок
✓ Loading state при отправке
```

#### 8. **Registration Flow**
```typescript
Test Cases:
✓ Успешная регистрация → VerificationModal
✓ Email уже занят → error message
✓ Сетевая ошибка → error message
✓ Автоматическая генерация username из email
✓ Токены сохраняются в localStorage
```

---

### ✅ LoginModal (Авторизация)

#### 1. **Email/Phone Tab Switching**
```typescript
Test Cases:
✓ Переключение с Email на Phone
✓ Переключение с Phone на Email
✓ Очистка ошибок при переключении
✓ Placeholder меняется соответственно
```

#### 2. **Email Validation**
```typescript
Test Cases:
✓ Пустое поле - нет ошибки
✓ Неверный формат → "Please enter a valid email address"
✓ Правильный формат → нет ошибки
✓ Валидация на blur (потеря фокуса)
```

#### 3. **Phone Validation (International)**
```typescript
Test Cases:
✓ Автодобавление + в начале
✓ Только цифры и + допускаются
✓ Минимум 10 цифр
✓ Максимум 15 цифр
✓ "1234567890" → автоматически "+1234567890"
✓ Слишком короткий → "Phone number is too short"
✓ Слишком длинный → "Phone number is too long"
```

#### 4. **Password Input**
```typescript
Test Cases:
✓ Password field работает
✓ Visibility toggle (показать/скрыть)
✓ Иконка меняется (открытый/закрытый глаз)
```

#### 5. **Login Attempts & Blocking**
```typescript
Test Cases:
✓ 1-4 неудачные попытки → ошибка + "You have X attempts remaining"
✓ 5 неудачных попыток → "IP blocked for 15 minutes"
✓ 10 неудачных попыток → "Account locked for 30 minutes"
✓ Счетчик попыток отображается
✓ Button disabled когда isBlocked = true
```

#### 6. **Login Flow**
```typescript
Test Cases:
✓ Успешный логин → закрытие модала + reload
✓ Неверные credentials → error message
✓ Loading state при запросе
✓ Токены сохраняются в localStorage
✓ User data сохраняется
```

#### 7. **Forgot Password Flow**

##### Screen: forgot-email
```typescript
Test Cases:
✓ Переход по кнопке "Forgot Password?"
✓ Email input validation
✓ Button disabled когда email пустой
✓ Button enabled когда email валиден
✓ Back button возвращает на login
```

##### Screen: forgot-sent
```typescript
Test Cases:
✓ Отображение введенного email
✓ Кнопка "Resend Code"
✓ Back button возвращает на forgot-email
```

##### Screen: create-password
```typescript
Test Cases:
✓ New password field
✓ 4 password requirements с индикаторами
✓ Confirm password field
✓ Passwords must match
✓ Visibility toggles для обоих полей
✓ Button disabled пока не выполнены требования
✓ Button enabled когда все требования выполнены
```

##### Screen: password-reset
```typescript
Test Cases:
✓ Success message отображается
✓ "Return to Sign In" button
✓ Возврат на login screen
✓ Все поля сброшены
```

#### 8. **2FA Flow**

##### 2FA Input
```typescript
Test Cases:
✓ 6 input полей для цифр
✓ Автофокус на первом поле
✓ Автопереход на следующее поле при вводе
✓ Backspace переход на предыдущее поле
✓ Только цифры допускаются
✓ Auto-verify при вводе 6-й цифры
```

##### 2FA Validation
```typescript
Test Cases:
✓ Правильный код "123456" → success
✓ Неправильный код → "Invalid code. Please try again."
✓ 1-2 неудачные попытки → ошибка + retry
✓ 3 неудачные попытки → "Too many failed attempts"
✓ isBlocked2FA = true после 3 попыток
```

##### 2FA Timer & Resend
```typescript
Test Cases:
✓ Начальный таймер 60 секунд
✓ Countdown отображается "Resend Code (Xs)"
✓ После 60 секунд → "Resend Code" активна
✓ Resend очищает поля
✓ Resend сбрасывает ошибки
✓ Resend запускает новый таймер
```

##### 2FA Expiration
```typescript
Test Cases:
✓ Код истекает через 60 секунд
✓ После истечения → "Code expired. Request a new one."
✓ isCodeExpired = true
✓ Inputs disabled после истечения
```

##### 2FA Back Button
```typescript
Test Cases:
✓ Back button возвращает на login
✓ Очистка всех 2FA полей
✓ Сброс состояний
```

#### 9. **SignUp from LoginModal**
```typescript
Test Cases:
✓ Кнопка "Create an account" переключает на signup screen
✓ Signup form отображается внутри LoginModal
✓ Email/Phone tabs работают
✓ Password requirements работают
✓ Submit создает аккаунт
✓ Back button возвращает на login
```

#### 10. **Social Auth Buttons**
```typescript
Test Cases:
✓ Google button отображается
✓ Apple button отображается
✓ X (Twitter) button отображается
✓ Hover эффекты работают
✓ Click handlers (пока mock)
```

---

## 🎯 Edge Cases & Special Scenarios

### 1. **Modal Open/Close**
```typescript
Test Cases:
✓ Modal открывается
✓ Close button (X) закрывает модал
✓ Click вне модала закрывает его
✓ Все состояния сбрасываются при закрытии
✓ Modal не закрывается при клике внутри
```

### 2. **Form Reset**
```typescript
Test Cases:
✓ Закрытие модала сбрасывает все поля
✓ Переключение tabs очищает ошибки
✓ Переключение screens сбрасывает данные
```

### 3. **Responsive Design**
```typescript
Test Cases:
✓ Mobile view (< 768px)
✓ Desktop view (>= 768px)
✓ Right panel скрыт на mobile
✓ Logo placement меняется
✓ Touch-friendly кнопки (min 44px)
```

### 4. **Accessibility**
```typescript
Test Cases:
✓ Keyboard navigation работает
✓ Tab order логичен
✓ Enter для submit
✓ Escape для close
✓ ARIA labels присутствуют
✓ Focus indicators видны
```

### 5. **Loading States**
```typescript
Test Cases:
✓ isLoading state при регистрации
✓ isLoading state при логине
✓ Button disabled во время loading
✓ Spinner отображается
✓ "Creating account..." / "Signing in..." текст
```

### 6. **Error Handling**
```typescript
Test Cases:
✓ Сетевые ошибки отображаются
✓ API ошибки отображаются
✓ Ошибки исчезают при изменении полей
✓ Multiple ошибки могут отображаться одновременно
```

### 7. **Data Persistence**
```typescript
Test Cases:
✓ localStorage tokens сохраняются
✓ localStorage user data сохраняется
✓ Refresh tokens работают
✓ Auto-login при наличии valid token
```

---

## 🔧 Testing Tools Recommendations

### Playwright E2E Tests
```typescript
// Example structure
describe('SignUpModal', () => {
  beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.click('[data-testid="signup-button"]');
  });

  describe('Email Validation', () => {
    test('should show error for invalid email', async ({ page }) => {
      await page.fill('[data-testid="email-input"]', 'invalid');
      await page.blur('[data-testid="email-input"]');
      await expect(page.getByText('Please enter a valid email')).toBeVisible();
    });
  });

  describe('Password Requirements', () => {
    test('all requirements met shows green checkmarks', async ({ page }) => {
      await page.fill('[data-testid="password-input"]', 'VeryLongPassword123!');
      await expect(page.locator('.requirement-check[data-status="valid"]')).toHaveCount(4);
    });
  });
});
```

### Cypress Alternative
```typescript
describe('LoginModal', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.get('[data-testid="login-button"]').click();
  });

  it('should block after 5 failed attempts', () => {
    for (let i = 0; i < 5; i++) {
      cy.get('[data-testid="email-input"]').type('test@example.com');
      cy.get('[data-testid="password-input"]').type('wrongpassword');
      cy.get('[data-testid="login-submit"]').click();
      cy.wait(1000);
    }
    cy.contains('IP blocked for 15 minutes').should('be.visible');
  });
});
```

---

## 📊 Test Coverage Goals

- **Unit Tests:** 80%+ (валидации, helpers)
- **Integration Tests:** 70%+ (API calls, state management)
- **E2E Tests:** 90%+ (user flows, critical paths)

---

## 🚀 Priority Testing Order

### P0 (Critical - Must Test)
1. ✅ Registration happy path
2. ✅ Login happy path
3. ✅ Email/Phone validation
4. ✅ Password requirements
5. ✅ Forgot password flow

### P1 (High Priority)
6. ✅ 2FA complete flow
7. ✅ Login attempts blocking
8. ✅ Form validation errors
9. ✅ Submit button states
10. ✅ Loading states

### P2 (Medium Priority)
11. ✅ Tab switching
12. ✅ Visibility toggles
13. ✅ Modal open/close
14. ✅ Back navigation
15. ✅ Social auth buttons

### P3 (Nice to Have)
16. ✅ Responsive design
17. ✅ Accessibility
18. ✅ Edge cases
19. ✅ Error recovery
20. ✅ Data persistence

---

## 📝 Manual Testing Checklist

### Before Each Release
- [ ] Пройти все P0 тесты вручную
- [ ] Проверить на разных браузерах (Chrome, Firefox, Safari)
- [ ] Проверить на mobile устройствах
- [ ] Проверить accessibility
- [ ] Проверить performance (нет лагов)

### Smoke Tests
- [ ] Регистрация работает
- [ ] Логин работает
- [ ] Forgot password работает
- [ ] 2FA работает
- [ ] Токены сохраняются

---

## 🐛 Known Issues / Future Improvements

### Mock Data (To Replace)
- [ ] Email "example@gmail.com" - mock existing email check
- [ ] Phone "89743531212" - mock existing phone check
- [ ] 2FA code "123456" - mock validation
- [ ] Social auth buttons - не подключены

### Backend Integration Needed
- [ ] Real email availability check
- [ ] Real phone availability check
- [ ] Real 2FA code generation/validation
- [ ] Email verification flow
- [ ] Phone SMS verification
- [ ] Social OAuth integration

---

**Итого:** 150+ тест-кейсов покрывают все критические пути, валидации и edge cases модальных окон авторизации.
