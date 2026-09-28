import { useState } from "react";
import { cn } from "../../utils/helpers";

export default function ProductGallery({ images = [], name }) {
  const [active, setActive] = useState(0);
  const gallery = images.length > 0 ? images : ["/placeholder.png"];
  const activeImage = gallery[active];

  return (
    <div className="space-y-3">
      <div className="aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700 border border-slate-100 dark:border-slate-700">
        <img src={activeImage} alt={name} className="h-full w-full object-cover" />
      </div>
      {gallery.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {gallery.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={cn(
                "h-20 w-20 shrink-0 rounded-lg overflow-hidden border-2 transition",
                active === i
                  ? "border-brand.blue"
                  : "border-transparent opacity-60 hover:opacity-100"
              )}
            >
              <img src={img} alt={`${name} ${i + 1}`} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
