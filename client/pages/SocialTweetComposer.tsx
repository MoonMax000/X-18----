import type { FC } from "react";

import TweetComposer from "@/components/socialComposer/TweetComposer";

const tips = [
  {
    title: "Добавьте контекст",
    description: "Указание источника и краткое резюме повышает доверие к посту.",
  },
  {
    title: "Используйте хэштеги",
    description: "До трёх точных тегов помогают охватить целевую аудиторию.",
  },
  {
    title: "Закрепите лучший пост",
    description: "Важно выделить ключевую мысль, чтобы новый подписчик быстро понял ваш фокус.",
  },
];

const SocialTweetComposer: FC = () => {
  return (
    <div className="mx-auto flex w-full max-w-[1150px] flex-col gap-6 pb-14 lg:flex-row lg:items-start">
      <div className="w-full flex-1 space-y-6">
        <TweetComposer />
      </div>

      <aside className="sticky top-20 hidden w-full max-w-[320px] flex-col gap-4 lg:flex">
        <div className="rounded-3xl border border-[#1F242B] bg-[rgba(12,16,20,0.7)] p-5 text-white">
          <h2 className="text-lg font-semibold">Как повысить вовлечённость</h2>
          <ul className="mt-4 space-y-4 text-sm text-[#AEB6C2]">
            {tips.map((tip) => (
              <li key={tip.title} className="space-y-1">
                <div className="font-semibold text-white">{tip.title}</div>
                <p>{tip.description}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-3xl border border-[#1F242B] bg-[rgba(12,16,20,0.7)] p-5 text-white">
          <h2 className="text-lg font-semibold">Шаблон публикации</h2>
          <p className="mt-3 text-sm text-[#AEB6C2]">
            Начните с сильного заголовка, затем добавьте цифры или тезисы. Используйте отдельный параграф для call-to-action.
          </p>
        </div>
      </aside>
    </div>
  );
};

export default SocialTweetComposer;
