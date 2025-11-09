# План редизайна ProfileSecuritySettings

## Текущая ситуация
- **Статический HTML блок** в Settings.tsx (строки 2324-2705) содержит красивый дизайн
- **ProfileSecuritySettings.tsx** имеет рабочий функционал, но другой дизайн

## Задача
Интегрировать дизайн из статического HTML в ProfileSecuritySettings, сохранив функциональность

## Элементы дизайна из статического HTML

### 1. Account Section (для 'account' tab)
```tsx
// Структура каждого блока:
<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
  <div className="flex flex-col gap-1 flex-1">
    <div className="flex items-center gap-2">
      <span className="text-sm font-bold text-white">Label:</span>
      <span className="text-sm font-bold text-white">Value</span>
    </div>
    <p className="text-sm font-normal text-webGray">Description</p>
  </div>
  <button className="w-full md:w-auto inline-flex h-8 items-center justify-center gap-2 px-3 rounded-full bg-gradient-to-r from-primary to-[#482090] shadow-[0_4px_8px_0_rgba(0,0,0,0.24)] backdrop-blur-[50px] text-white text-center text-xs md:text-sm font-bold transition-opacity hover:opacity-90">
    Change
  </button>
</div>
```

### 2. Two-Factor Authentication (для 'twofa' tab)
```tsx
// Toggle switch:
<div className="flex w-[38px] h-5 p-0.5 justify-end items-center gap-2.5 rounded-[300px] bg-gradient-to-r from-primary to-[#482090]">
  <div className="w-4 h-4 rounded-full bg-white" />
</div>

// Current Method row:
<div className="flex items-center gap-2">
  <span className="text-sm font-bold text-white">Current Method:</span>
  <span className="text-sm font-bold text-white">Email</span>
</div>
```

### 3. Recovery Section (для 'backup' tab)
- Показывать текущее значение inline (как "None")
- Кнопка "Setup" вместо input полей

### 4. Delete Account (для 'delete' tab)
- Две отдельные строки: Deactivate и Delete
- Разные стили кнопок

### 5. User Sessions (УДАЛИТЬ из статического блока)
- Это настоящий дубликат, есть отдельный компонент ActiveSessions

## Шаги выполнения

1. ✅ Восстановить Settings.tsx из git
2. ✅ Изучить статический HTML блок
3. ✅ Изучить текущий ProfileSecuritySettings.tsx
4. [ ] Применить дизайн статического HTML к ProfileSecuritySettings:
   - [ ] Account tab - flex-row структура с правой кнопкой
   - [ ] Two-Factor tab - добавить toggle и текущий метод
   - [ ] Backup tab - показывать значения inline с кнопками Setup
   - [ ] Password tab - улучшить визуально
   - [ ] Delete tab - две отдельные строки
5. [ ] Удалить статический блок из Settings.tsx
6. [ ] Тестировать функциональность

## Ключевые классы дизайна
- Контейнер секции: `flex flex-col gap-4 p-4 rounded-3xl border border-[#181B22] bg-[rgba(12,16,20,0.5)] backdrop-blur-[50px]`
- Заголовок секции: `text-2xl font-bold text-white`
- Строка с элементом: `flex flex-col md:flex-row justify-between items-start md:items-center gap-4`
- Кнопка Change: `w-full md:w-auto inline-flex h-8 items-center justify-center gap-2 px-3 rounded-full bg-gradient-to-r from-primary to-[#482090] shadow-[0_4px_8px_0_rgba(0,0,0,0.24)] backdrop-blur-[50px] text-white text-center text-xs md:text-sm font-bold transition-opacity hover:opacity-90`
