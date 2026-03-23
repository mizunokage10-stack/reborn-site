"use client";

import { memo, useCallback, useEffect, useMemo, useState, type MouseEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type BookReaderProps = {
  text: string;
  className?: string;
  initialPage?: number;
  onPageChange?: (page: number) => void;
};

const transition = {
  duration: 0.4,
  ease: [0.42, 0, 0.58, 1] as const,
};

const pageVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "18%" : "-18%",
    rotateY: direction > 0 ? -8 : 8,
    opacity: 0,
    boxShadow:
      direction > 0
        ? "-20px 18px 32px rgba(120, 98, 68, 0.12)"
        : "20px 18px 32px rgba(120, 98, 68, 0.12)",
  }),
  center: {
    x: 0,
    rotateY: 0,
    opacity: 1,
    boxShadow: "0 18px 40px rgba(120, 98, 68, 0.14)",
  },
  exit: (direction: number) => ({
    x: direction > 0 ? "-18%" : "18%",
    rotateY: direction > 0 ? 8 : -8,
    opacity: 0,
    boxShadow:
      direction > 0
        ? "18px 18px 32px rgba(120, 98, 68, 0.1)"
        : "-18px 18px 32px rgba(120, 98, 68, 0.1)",
  }),
};

const staticPageStyle = {
  boxShadow: "0 18px 40px rgba(120, 98, 68, 0.14)",
};

const textStyle = {
  fontFamily:
    '"MS Mincho", "MS 明朝", "Hiragino Mincho ProN", "Yu Mincho", "Times New Roman", serif',
};

function clampPage(value: number, total: number) {
  if (total <= 0) return 0;
  return Math.min(Math.max(value, 0), total - 1);
}

function BookReaderComponent({
  text,
  className,
  initialPage = 0,
  onPageChange,
}: BookReaderProps) {
  const shouldReduceMotion = useReducedMotion();
  const pages = useMemo(() => {
    const normalized = text
      .split(",")
      .map((page) => page.trim())
      .filter(Boolean);

    return normalized.length > 0 ? normalized : ["本文がありません。"];
  }, [text]);

  const [pageIndex, setPageIndex] = useState(() => clampPage(initialPage, pages.length));
  const [direction, setDirection] = useState(1);
  const safePageIndex = clampPage(pageIndex, pages.length);

  useEffect(() => {
    onPageChange?.(safePageIndex);
  }, [onPageChange, safePageIndex]);

  const goToPage = useCallback(
    (nextIndex: number) => {
      const clamped = clampPage(nextIndex, pages.length);

      if (clamped === safePageIndex) {
        return;
      }

      setDirection(clamped > safePageIndex ? 1 : -1);
      setPageIndex(clamped);
    },
    [pages.length, safePageIndex]
  );

  const goNext = useCallback(() => {
    goToPage(safePageIndex + 1);
  }, [goToPage, safePageIndex]);

  const goPrev = useCallback(() => {
    goToPage(safePageIndex - 1);
  }, [goToPage, safePageIndex]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        goNext();
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goPrev();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goNext, goPrev]);

  const handlePageClick = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      const bounds = event.currentTarget.getBoundingClientRect();
      const clickedLeftSide = event.clientX - bounds.left < bounds.width / 2;

      if (clickedLeftSide) {
        goPrev();
        return;
      }

      goNext();
    },
    [goNext, goPrev]
  );

  const currentPage = pages[safePageIndex];

  return (
    <section
      className={cn(
        "w-full rounded-[2rem] border border-stone-200 bg-[#fdfbf7] p-4 text-stone-800 sm:p-6 md:p-8",
        className
      )}
      style={textStyle}
      aria-label="Book reader"
    >
      <div className="mb-4 flex items-center justify-between gap-3 text-sm text-stone-500 md:mb-6">
        <button
          type="button"
          onClick={goPrev}
          disabled={safePageIndex === 0}
          className="rounded-full border border-stone-200 bg-white/80 px-4 py-2 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-45"
          aria-label="前のページへ"
        >
          ← 前へ
        </button>
        <p className="text-center text-sm tracking-[0.15em] text-stone-500 uppercase">
          Page {safePageIndex + 1} / {pages.length}
        </p>
        <button
          type="button"
          onClick={goNext}
          disabled={safePageIndex === pages.length - 1}
          className="rounded-full border border-stone-200 bg-white/80 px-4 py-2 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-45"
          aria-label="次のページへ"
        >
          次へ →
        </button>
      </div>

      <div className="[perspective:1600px]">
        <div
          role="button"
          tabIndex={0}
          onClick={handlePageClick}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              goNext();
            }
          }}
          className="relative min-h-[420px] cursor-pointer overflow-hidden rounded-[1.75rem] border border-stone-200/80 bg-[#fdfbf7] px-6 py-10 outline-none ring-0 transition focus-visible:ring-2 focus-visible:ring-stone-300 sm:px-10 md:min-h-[520px] md:px-14 md:py-14"
          aria-label="左右クリックまたは矢印キーでページをめくる"
        >
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
              key={safePageIndex}
              custom={direction}
              variants={shouldReduceMotion ? undefined : pageVariants}
              initial={shouldReduceMotion ? { opacity: 0 } : "enter"}
              animate={shouldReduceMotion ? { opacity: 1 } : "center"}
              exit={shouldReduceMotion ? { opacity: 0 } : "exit"}
              transition={transition}
              className="absolute inset-0 flex h-full w-full items-center justify-center px-6 py-10 sm:px-10 md:px-14 md:py-14"
              style={{ transformStyle: "preserve-3d", transformOrigin: direction > 0 ? "left center" : "right center" }}
            >
              <article
                className="flex h-full w-full max-w-3xl items-center justify-center rounded-[1.5rem] border border-stone-200/70 bg-[#fffefb] px-6 py-8 text-center text-lg leading-9 text-stone-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] sm:px-10 md:px-14 md:text-xl md:leading-10"
                style={shouldReduceMotion ? staticPageStyle : undefined}
              >
                <p className="whitespace-pre-wrap break-words">{currentPage}</p>
              </article>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <p className="mt-4 text-center text-sm text-stone-400 md:mt-6">
        右側クリックで次ページ、左側クリックで前ページ。キーボードの ← → にも対応しています。
      </p>
    </section>
  );
}

const BookReader = memo(BookReaderComponent);

export default BookReader;
export type { BookReaderProps };
