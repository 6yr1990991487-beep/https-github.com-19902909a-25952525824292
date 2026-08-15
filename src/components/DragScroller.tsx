import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { useDragScroll } from "@/hooks/useDragScroll";

/** Conteneur horizontal défilant au glisser / toucher, sans rail visible. */
export const DragScroller = ({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) => {
  const ref = useDragScroll<HTMLDivElement>();
  return (
    <div ref={ref} data-no-panel-drag className={cn("drag-scroll no-scrollbar overflow-x-auto", className)} {...props}>
      {children}
    </div>
  );
};

export default DragScroller;
