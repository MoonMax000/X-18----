import { useState, useEffect } from "react";
import { MediaEditor } from "../components/CreatePostBox/MediaEditor";
import { MediaGrid } from "../components/CreatePostBox/MediaGrid";
import { MediaItem } from "../components/CreatePostBox/types";

type AspectPreset = "original" | "wide" | "square";

export default function CropTestPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [editingMedia, setEditingMedia] = useState<MediaItem | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, `[${timestamp}] ${message}`]);
    console.log(`[CROP TEST] ${message}`);
  };

  useEffect(() => {
    addLog("🎨 Тестовая страница кропа загружена");
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    addLog(`📤 Загружено файлов: ${files.length}`);

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) {
        addLog(`❌ Файл ${file.name} не является изображением`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        
        // Получаем размеры изображения
        const img = new Image();
        img.onload = () => {
          const aspectRatio = img.naturalWidth / img.naturalHeight;
          let autoPreset: AspectPreset = "square";
          
          if (aspectRatio >= 1.5) {
            autoPreset = "wide";
            addLog(`📐 ${file.name}: ${img.naturalWidth}×${img.naturalHeight} (пейзаж) → auto-preset: Wide`);
          } else if (aspectRatio <= 0.8) {
            autoPreset = "original";
            addLog(`📐 ${file.name}: ${img.naturalWidth}×${img.naturalHeight} (портрет) → auto-preset: Original`);
          } else {
            autoPreset = "square";
            addLog(`📐 ${file.name}: ${img.naturalWidth}×${img.naturalHeight} (квадрат) → auto-preset: Square`);
          }

          const newMedia: MediaItem = {
            id: `${Date.now()}-${Math.random()}`,
            type: "image",
            url,
            file,
          };

          setMedia((prev) => [...prev, newMedia]);
          addLog(`✅ Изображение ${file.name} добавлено (ID: ${newMedia.id.substring(0, 8)}...)`);
        };
        img.src = url;
      };
      reader.readAsDataURL(file);
    });

    e.target.value = "";
  };

  const handleEdit = (item: MediaItem) => {
    addLog(`✏️ Открыт редактор для изображения ${item.id.substring(0, 8)}...`);
    setEditingMedia(item);
  };

  const handleSave = (updatedMedia: MediaItem) => {
    addLog(`💾 Сохранение изменений для ${updatedMedia.id.substring(0, 8)}...`);
    
    if (updatedMedia.transform) {
      const t = updatedMedia.transform;
      addLog(`   📊 Transform: zoom=${t.scale.toFixed(2)}, x=${t.translateX.toFixed(0)}px, y=${t.translateY.toFixed(0)}px`);
      addLog(`   📐 Aspect: ${t.aspectRatio}`);
      if (t.cropRect) {
        addLog(`   ✂️ Crop: x=${t.cropRect.x}, y=${t.cropRect.y}, w=${t.cropRect.w}, h=${t.cropRect.h}`);
      }
    }

    setMedia((prev) =>
      prev.map((item) =>
        item.id === updatedMedia.id ? updatedMedia : item
      )
    );
    setEditingMedia(null);
    addLog(`✅ Изменения сохранены`);
  };

  const handleRemove = (mediaId: string) => {
    addLog(`🗑️ Удаление изображения ${mediaId.substring(0, 8)}...`);
    setMedia((prev) => prev.filter((item) => item.id !== mediaId));
  };

  const handleReorder = (fromIndex: number, toIndex: number) => {
    addLog(`🔄 Перестановка: позиция ${fromIndex} → позиция ${toIndex}`);
    setMedia((prev) => {
      const newMedia = [...prev];
      const [movedItem] = newMedia.splice(fromIndex, 1);
      newMedia.splice(toIndex, 0, movedItem);
      return newMedia;
    });
  };

  const clearLogs = () => {
    setLogs([]);
    addLog("🧹 Логи очищены");
  };

  const clearMedia = () => {
    addLog(`🗑️ Удаление всех изображений (${media.length} шт.)`);
    setMedia([]);
  };

  return (
    <div className="min-h-screen bg-[#0C1014] text-white">
      <div className="mx-auto max-w-6xl p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">
            🎨 Тестирование функционала кропа изображений
          </h1>
          <p className="text-[#808283]">
            Эта страница предназначена для тестирования улучшений кропа без авторизации
          </p>
        </div>

        {/* Features Info */}
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-[#181B22] bg-white/5 p-4">
            <div className="mb-2 text-2xl">🎯</div>
            <h3 className="mb-1 font-semibold">Автовыбор пресета</h3>
            <p className="text-xs text-[#808283]">
              Пейзаж (≥1.5) → Wide<br />
              Портрет (≤0.8) → Original<br />
              Квадрат → Square
            </p>
          </div>
          <div className="rounded-2xl border border-[#181B22] bg-white/5 p-4">
            <div className="mb-2 text-2xl">💾</div>
            <h3 className="mb-1 font-semibold">Сохранение состояния</h3>
            <p className="text-xs text-[#808283]">
              Каждый пресет хранит свой zoom и позицию независимо
            </p>
          </div>
          <div className="rounded-2xl border border-[#181B22] bg-white/5 p-4">
            <div className="mb-2 text-2xl">🖼️</div>
            <h3 className="mb-1 font-semibold">Адаптивный preview</h3>
            <p className="text-xs text-[#808283]">
              1 фото: полное<br />
              Несколько: сетка 16:9
            </p>
          </div>
        </div>

        {/* Upload Section */}
        <div className="mb-6 rounded-2xl border border-[#181B22] bg-white/5 p-6">
          <h2 className="mb-4 text-xl font-semibold">📤 Загрузка изображений</h2>
          <div className="flex gap-3">
            <label className="flex-1 cursor-pointer">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="rounded-xl border-2 border-dashed border-[#1D9BF0] bg-[#1D9BF0]/10 px-6 py-8 text-center transition-colors hover:bg-[#1D9BF0]/20">
                <div className="mb-2 text-4xl">📁</div>
                <p className="font-semibold text-[#1D9BF0]">
                  Выберите изображения для тестирования
                </p>
                <p className="mt-1 text-xs text-[#808283]">
                  Можно выбрать несколько файлов одновременно
                </p>
              </div>
            </label>
          </div>

          {media.length > 0 && (
            <div className="mt-4 flex gap-3">
              <button
                onClick={clearMedia}
                className="rounded-full bg-[#EF454A]/20 px-4 py-2 text-sm font-semibold text-[#EF454A] transition-colors hover:bg-[#EF454A]/30"
              >
                🗑️ Очистить все изображения
              </button>
              <div className="flex-1 text-right text-sm text-[#808283]">
                Загружено: {media.length} {media.length === 1 ? "изображение" : "изображений"}
              </div>
            </div>
          )}
        </div>

        {/* Media Grid Preview */}
        {media.length > 0 && (
          <div className="mb-6 rounded-2xl border border-[#181B22] bg-white/5 p-6">
            <h2 className="mb-4 text-xl font-semibold">🖼️ Preview (MediaGrid)</h2>
            <MediaGrid
              media={media}
              onRemove={handleRemove}
              onEdit={handleEdit}
              onReorder={handleReorder}
            />
          </div>
        )}

        {/* Logs Section */}
        <div className="rounded-2xl border border-[#181B22] bg-white/5 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">📋 Логи ({logs.length})</h2>
            <button
              onClick={clearLogs}
              className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold transition-colors hover:bg-white/20"
            >
              🧹 Очистить логи
            </button>
          </div>
          <div className="max-h-[400px] overflow-y-auto rounded-xl bg-black/50 p-4 font-mono text-xs">
            {logs.length === 0 ? (
              <div className="text-center text-[#808283]">
                Логи пусты. Загрузите изображения для начала тестирования.
              </div>
            ) : (
              logs.map((log, index) => (
                <div
                  key={index}
                  className="border-b border-white/5 py-1 last:border-0"
                >
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 rounded-2xl border border-[#A06AFF]/30 bg-[#A06AFF]/10 p-6">
          <h3 className="mb-3 text-lg font-semibold">💡 Как тестировать:</h3>
          <ol className="space-y-2 text-sm">
            <li>1️⃣ Загрузите изображения разных форматов (пейзаж, портрет, квадрат)</li>
            <li>2️⃣ Проверьте, что автовыбор пресета работает (смотрите логи)</li>
            <li>3️⃣ Нажмите "Edit" на любом изображении</li>
            <li>4️⃣ В редакторе: переключайтесь между пресетами, меняйте zoom и позицию</li>
            <li>5️⃣ Проверьте, что каждый пресет сохраняет свои настройки независимо</li>
            <li>6️⃣ Сохраните и проверьте preview в MediaGrid</li>
            <li>7️⃣ Все действия логируются для анализа</li>
          </ol>
        </div>
      </div>

      {/* Media Editor Modal */}
      {editingMedia && (
        <MediaEditor
          media={editingMedia}
          onSave={handleSave}
          onClose={() => {
            addLog(`❌ Редактор закрыт без сохранения`);
            setEditingMedia(null);
          }}
        />
      )}
    </div>
  );
}
