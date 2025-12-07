import { BibleViewer } from '@/components/bible-viewer';
import { PassageRecommender } from '@/components/passage-recommender';

export default function Home() {
  return (
    <div className="grid h-screen w-full lg:grid-cols-[minmax(350px,400px)_1fr]">
      <div className="flex flex-col border-r border-border/60 bg-card/50">
        <PassageRecommender />
      </div>
      <div className="flex flex-col">
        <BibleViewer />
      </div>
    </div>
  );
}
