# Код аватарки в EditProfileModal

## Текущая реализация аватарки:

```tsx
{/* Avatar overlapping the banner */}
<div
  className="absolute left-4 w-[var(--avatar-size)] h-[var(--avatar-size)] rounded-full ring-1 ring-[#2f3336] ring-offset-4 ring-offset-black overflow-hidden"
  style={{
    bottom: 'calc(var(--avatar-size) * var(--avatar-overlap) * -1)',
  }}
>
  <ProfileAvatar
    avatarUrl={avatarUrl}
    level={userLevel}
    isEditable={true}
    size="responsive"
    onUpload={handleUploadAvatar}
    uploadProgress={uploadProgress}
    isUploading={isUploading && uploadType === 'avatar'}
    className="!w-full !h-full"
  />
</div>
```

## CSS переменные:

```tsx
style={{
  ['--avatar-size' as any]: 'clamp(80px, 20vw, 112px)',
  ['--avatar-overlap' as any]: '0.5',
}}
```

## Компонент ProfileAvatar внутри:

```tsx
<div className="relative w-full h-full rounded-full overflow-hidden bg-[#121720] group">
  <img 
    src={finalAvatarUrl} 
    alt="Avatar" 
    className="w-full h-full object-cover" 
  />
  
  {/* Upload button (hover) */}
  {isEditable && !isUploading && (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60 transition-opacity duration-200 opacity-0 group-hover:opacity-100"
    >
      <Camera className="h-6 w-6 text-white" />
    </button>
  )}
</div>
```

## Проблема:

Фото в аватарке не заполняет весь круг правильно - выглядит сжатым или сдвинутым.

## Ожидаемое поведение:

- Фото должно заполнять весь круг аватарки
- Изображение должно быть отцентрировано
- Object-fit: cover должен работать правильно
- Размер аватарки: 80-112px (адаптивный)
