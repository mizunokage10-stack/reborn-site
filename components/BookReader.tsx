"use client";

import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type MouseEvent,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type BookReaderProps = {
  pages: string[];
  className?: string;
  currentPage?: number;
  basePath?: string;
  pageInfoLabel?: string;
};

const transition = {
  duration: 0.62,
  ease: [0.22, 0.61, 0.36, 1] as const,
};

const pageVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "14%" : "-14%",
    rotateY: direction > 0 ? -24 : 24,
    rotateZ: direction > 0 ? -2.5 : 2.5,
    opacity: 0.9,
    filter: "brightness(0.96)",
  }),
  center: {
    x: 0,
    rotateY: 0,
    rotateZ: 0,
    opacity: 1,
    filter: "brightness(1)",
  },
  exit: (direction: number) => ({
    x: direction > 0 ? "-11%" : "11%",
    rotateY: direction > 0 ? 18 : -18,
    rotateZ: direction > 0 ? 1.5 : -1.5,
    opacity: 0.35,
    filter: "brightness(0.92)",
  }),
};

const textStyle = {
  fontFamily:
    '"MS Mincho", "MS 明朝", "Hiragino Mincho ProN", "Yu Mincho", "YuMincho", "Times New Roman", serif',
};

function clampPage(value: number, total: number) {
  if (total <= 0) return 0;
  return Math.min(Math.max(value, 0), total - 1);
}

function BookReaderComponent({
  pages,
  className,
  currentPage = 1,
  basePath,
  pageInfoLabel = "Page",
}: BookReaderProps) {
  const shouldReduceMotion = useReducedMotion();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const safePages = useMemo(
    () => (pages.length > 0 ? pages : ["本文がありません。"]),
    [pages]
  );
  const currentPageIndex = clampPage(currentPage - 1, safePages.length);
  const [pageIndex, setPageIndex] = useState(currentPageIndex);
  const [direction, setDirection] = useState(1);
  const safePageIndex = clampPage(pageIndex, safePages.length);

  useEffect(() => {
    setPageIndex(currentPageIndex);
  }, [currentPageIndex]);

  const pushPage = useCallback(
    (nextIndex: number) => {
      const clamped = clampPage(nextIndex, safePages.length);

      if (clamped === safePageIndex) {
        return;
      }

      const params = new URLSearchParams(searchParams.toString());
      params.set("page", String(clamped + 1));

      setDirection(clamped > safePageIndex ? 1 : -1);
      setPageIndex(clamped);

      router.push(`${basePath ?? pathname}?${params.toString()}`, { scroll: false });
    },
    [basePath, pathname, router, safePageIndex, safePages.length, searchParams]
  );

  const goNext = useCallback(() => {
    pushPage(safePageIndex + 1);
  }, [pushPage, safePageIndex]);

  const goPrev = useCallback(() => {
    pushPage(safePageIndex - 1);
  }, [pushPage, safePageIndex]);

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

  const currentLeaf = safePages[safePageIndex];
  const previousLeaf = safePages[clampPage(safePageIndex - 1, safePages.length)];
  const nextLeaf = safePages[clampPage(safePageIndex + 1, safePages.length)];

  return (
    <section
      className={cn(
        "w-full rounded-[2rem] border border-[#dfd3bf] bg-[radial-gradient(circle_at_top,#f5eddf_0%,#e6d8c1_48%,#d9c7ad_100%)] p-4 text-stone-800 shadow-[0_28px_70px_rgba(109,81,48,0.16)] sm:p-6 md:p-8",
        className
      )}
      style={textStyle}
      aria-label="Book reader"
    >
      <div className="mb-4 flex items-center justify-between gap-3 text-sm text-stone-600 md:mb-6">
        <button
          type="button"
          onClick={goPrev}
          disabled={safePageIndex === 0}
          className="rounded-full border border-[#d6c8b1] bg-white/72 px-4 py-2 shadow-sm transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-45"
          aria-label="前のページへ"
        >
          ← 前へ
        </button>
        <p className="text-center text-xs tracking-[0.32em] text-stone-500 uppercase">
          {pageInfoLabel} {safePageIndex + 1} / {safePages.length}
        </p>
        <button
          type="button"
          onClick={goNext}
          disabled={safePageIndex === safePages.length - 1}
          className="rounded-full border border-[#d6c8b1] bg-white/72 px-4 py-2 shadow-sm transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-45"
          aria-label="次のページへ"
        >
          次へ →
        </button>
      </div>

      <div className="rounded-[2.2rem] border border-white/40 bg-white/12 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] sm:p-5">
        <div className="[perspective:2200px]">
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
            className="relative min-h-[520px] cursor-pointer overflow-hidden rounded-[1.85rem] border border-[#e6dac5] bg-[linear-gradient(180deg,#f8f2e8_0%,#eadfcd_100%)] p-4 outline-none transition focus-visible:ring-2 focus-visible:ring-[#d3c2a7] sm:p-6 md:min-h-[700px] md:p-7"
            aria-label="左右クリックまたは矢印キーでページをめくる"
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.78),transparent_48%),radial-gradient(circle_at_bottom,rgba(122,85,42,0.10),transparent_55%)]" />

            <div className="absolute inset-y-7 left-6 right-6 rounded-[1.6rem] bg-[#f7f1e6] shadow-[inset_0_0_0_1px_rgba(212,198,176,0.85),0_18px_26px_rgba(118,95,64,0.10)] md:inset-y-8 md:left-8 md:right-8" />

            <div className="absolute inset-y-10 left-11 hidden w-[38%] rounded-[1.6rem] border border-[#ede4d6] bg-[linear-gradient(180deg,#fffdfa_0%,#f8f2e8_100%)] shadow-[0_18px_30px_rgba(118,95,64,0.10)] md:block" />
            <div className="absolute inset-y-10 right-11 hidden w-[38%] rounded-[1.6rem] border border-[#eadfce] bg-[linear-gradient(180deg,#fffefb_0%,#fbf6ee_100%)] shadow-[0_22px_34px_rgba(118,95,64,0.12)] md:block" />
            <div className="absolute inset-y-11 left-1/2 hidden w-px -translate-x-1/2 bg-[linear-gradient(180deg,transparent,rgba(161,132,92,0.4),transparent)] md:block" />

            <div className="absolute inset-y-14 left-[13%] hidden w-[24%] -rotate-[4deg] rounded-[1.5rem] bg-[linear-gradient(90deg,rgba(218,205,184,0.18),rgba(255,255,255,0.48))] shadow-[0_10px_24px_rgba(120,98,68,0.08)] md:block" />

            <div className="pointer-events-none absolute inset-y-10 left-11 hidden w-[38%] overflow-hidden rounded-[1.6rem] md:block">
              <p className="book-reader-vertical opacity-[0.18] px-7 py-8 text-[22px] leading-[2.15] tracking-[0.08em] text-stone-700">
                {previousLeaf}
              </p>
            </div>

            <AnimatePresence initial={false} custom={direction} mode="popLayout">
              <motion.div
                key={safePageIndex}
                custom={direction}
                variants={shouldReduceMotion ? undefined : pageVariants}
                initial={shouldReduceMotion ? { opacity: 0 } : "enter"}
                animate={shouldReduceMotion ? { opacity: 1 } : "center"}
                exit={shouldReduceMotion ? { opacity: 0 } : "exit"}
                transition={transition}
                className="absolute inset-y-5 left-5 right-5 md:inset-y-7 md:left-[31%] md:right-10"
                style={{
                  transformStyle: "preserve-3d",
                  transformOrigin: direction > 0 ? "left center" : "right center",
                }}
              >
                <article className="relative flex h-full w-full overflow-hidden rounded-[1.75rem] border border-[#e8dcc9] bg-[linear-gradient(90deg,#fbf6ee_0%,#fffefb_18%,#ebe0ce_50%,#fffefb_53%,#fbf7ef_100%)] shadow-[0_24px_50px_rgba(110,83,47,0.18)]">
                  <div className="absolute inset-y-0 left-0 w-[14%] bg-[linear-gradient(90deg,rgba(214,199,176,0.32),rgba(255,255,255,0))]" />
                  <div className="absolute inset-y-0 left-[49%] w-[8%] -translate-x-1/2 bg-[linear-gradient(90deg,rgba(153,123,82,0.10),rgba(255,255,255,0.96),rgba(112,86,52,0.18),rgba(255,255,255,0.90),rgba(153,123,82,0.10))]" />
                  <div className="absolute inset-y-0 right-0 w-[16%] bg-[linear-gradient(90deg,rgba(255,255,255,0),rgba(196,176,150,0.28))]" />
                  <div className="absolute inset-y-0 left-[58%] w-px border-l border-dashed border-[#d8c9b1]/80" />

                  <div className="pointer-events-none absolute right-5 top-5 text-[11px] tracking-[0.42em] text-stone-400 uppercase">
                    page
                  </div>

                  <div className="relative z-10 grid h-full w-full grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                    <div className="hidden h-full md:block" />
                    <div className="flex h-full items-stretch">
                      <p className="book-reader-vertical h-full w-full whitespace-pre-wrap break-words px-8 py-9 text-[22px] leading-[2.2] tracking-[0.08em] text-stone-700 md:px-9 md:py-10 md:text-[24px]">
                        {currentLeaf}
                      </p>
                    </div>
                  </div>
                </article>
              </motion.div>
            </AnimatePresence>

            <div className="pointer-events-none absolute inset-y-10 right-11 hidden w-[38%] overflow-hidden rounded-[1.6rem] md:block">
              <p className="book-reader-vertical opacity-[0.1] px-7 py-8 text-[22px] leading-[2.15] tracking-[0.08em] text-stone-700">
                {nextLeaf}
              </p>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-4 text-center text-sm text-stone-500 md:mt-6">
        右側クリックで次ページ、左側クリックで前ページ。キーボードの ← → にも対応しています。
      </p>
    </section>
  );
}

const BookReader = memo(BookReaderComponent);

export default BookReader;
export type { BookReaderProps };
