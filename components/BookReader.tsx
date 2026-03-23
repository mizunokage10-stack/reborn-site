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

type FlipState = {
  direction: 1 | -1;
  fromIndex: number;
  targetIndex: number;
};

const flipTransition = {
  duration: 0.82,
  ease: [0.2, 0.8, 0.2, 1] as const,
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
  const [flipState, setFlipState] = useState<FlipState | null>(null);
  const visiblePageIndex = flipState ? flipState.fromIndex : currentPageIndex;
  const safeVisiblePageIndex = clampPage(visiblePageIndex, safePages.length);

  const navigateToPage = useCallback(
    (nextIndex: number) => {
      const clamped = clampPage(nextIndex, safePages.length);

      if (clamped === safeVisiblePageIndex || flipState) {
        return;
      }

      const params = new URLSearchParams(searchParams.toString());
      params.set("page", String(clamped + 1));

      setFlipState({
        direction: clamped > safeVisiblePageIndex ? 1 : -1,
        fromIndex: safeVisiblePageIndex,
        targetIndex: clamped,
      });

      router.push(`${basePath ?? pathname}?${params.toString()}`, { scroll: false });
    },
    [
      basePath,
      flipState,
      pathname,
      router,
      safeVisiblePageIndex,
      safePages.length,
      searchParams,
    ]
  );

  const goNext = useCallback(() => {
    navigateToPage(safeVisiblePageIndex + 1);
  }, [navigateToPage, safeVisiblePageIndex]);

  const goPrev = useCallback(() => {
    navigateToPage(safeVisiblePageIndex - 1);
  }, [navigateToPage, safeVisiblePageIndex]);

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

  const targetIndex = flipState?.targetIndex ?? safeVisiblePageIndex;
  const currentLeaf = safePages[safeVisiblePageIndex];
  const targetLeaf = safePages[targetIndex];
  const isNextFlip = flipState?.direction === 1;
  const overlayLeaf = flipState ? (isNextFlip ? currentLeaf : targetLeaf) : null;
  const underLeaf = flipState ? targetLeaf : currentLeaf;

  return (
    <section
      className={cn(
        "w-full rounded-[2rem] border border-[#ded2bf] bg-[linear-gradient(180deg,#efe6d7_0%,#e4d6c1_100%)] p-4 text-stone-800 shadow-[0_20px_60px_rgba(87,63,33,0.12)] sm:p-6 md:p-8",
        className
      )}
      style={textStyle}
      aria-label="Book reader"
    >
      <div className="mb-4 flex items-center justify-between gap-3 text-sm text-stone-600 md:mb-6">
        <button
          type="button"
          onClick={goPrev}
          disabled={safeVisiblePageIndex === 0 || Boolean(flipState)}
          className="rounded-full border border-[#d6c8b1] bg-white/78 px-4 py-2 shadow-sm transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-45"
          aria-label="前のページへ"
        >
          ← 前へ
        </button>
        <p className="text-center text-xs tracking-[0.3em] text-stone-500 uppercase">
          {pageInfoLabel} {safeVisiblePageIndex + 1} / {safePages.length}
        </p>
        <button
          type="button"
          onClick={goNext}
          disabled={safeVisiblePageIndex === safePages.length - 1 || Boolean(flipState)}
          className="rounded-full border border-[#d6c8b1] bg-white/78 px-4 py-2 shadow-sm transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-45"
          aria-label="次のページへ"
        >
          次へ →
        </button>
      </div>

      <div className="rounded-[2rem] border border-white/45 bg-white/16 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] sm:p-5">
        <div className="[perspective:2400px]">
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
            className="relative min-h-[520px] cursor-pointer overflow-hidden rounded-[1.8rem] border border-[#e7dbc8] bg-[linear-gradient(180deg,#f5ede1_0%,#ecdfcc_100%)] p-4 outline-none transition focus-visible:ring-2 focus-visible:ring-[#d4c2a3] sm:p-6 md:min-h-[720px] md:p-8"
            aria-label="右側クリックで次のページ、左側クリックで前のページ"
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.72),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.12),rgba(120,94,52,0.06))]" />
            <div className="absolute inset-y-7 left-1/2 w-[2px] -translate-x-1/2 bg-[linear-gradient(180deg,transparent,rgba(150,118,78,0.45),transparent)]" />

            <div className="absolute inset-y-9 left-6 right-6 rounded-[1.65rem] bg-[#f7f1e7] shadow-[inset_0_0_0_1px_rgba(213,199,177,0.8),0_16px_30px_rgba(104,78,42,0.08)] md:left-10 md:right-10" />
            <div className="absolute inset-y-11 left-8 right-8 rounded-[1.5rem] border border-[#ece1d0] bg-[linear-gradient(180deg,#fffdfa_0%,#faf4ea_100%)] shadow-[0_18px_34px_rgba(110,84,49,0.1)] md:left-12 md:right-12" />

            <div className="absolute inset-y-11 left-8 right-8 overflow-hidden rounded-[1.5rem] md:left-12 md:right-12">
              <div className="absolute inset-y-0 left-0 w-[10%] bg-[linear-gradient(90deg,rgba(213,198,176,0.28),rgba(255,255,255,0))]" />
              <div className="absolute inset-y-0 right-0 w-[12%] bg-[linear-gradient(90deg,rgba(255,255,255,0),rgba(213,198,176,0.22))]" />
              <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-[linear-gradient(180deg,transparent,rgba(201,183,155,0.7),transparent)]" />

              <article className="relative z-10 h-full w-full">
                <p className="book-reader-vertical h-full w-full whitespace-pre-wrap break-words px-8 py-9 text-[21px] leading-[2.2] tracking-[0.08em] text-stone-700 md:px-12 md:py-12 md:text-[24px]">
                  {underLeaf}
                </p>
              </article>

              <AnimatePresence>
                {flipState && overlayLeaf ? (
                  <motion.div
                    key={`${safeVisiblePageIndex}-${targetIndex}`}
                    initial={
                      shouldReduceMotion
                        ? { opacity: 0 }
                        : isNextFlip
                          ? { rotateY: 0, x: "0%", opacity: 1 }
                          : { rotateY: 168, x: "-4%", opacity: 0.96 }
                    }
                    animate={
                      shouldReduceMotion
                        ? { opacity: 1 }
                        : isNextFlip
                          ? { rotateY: -168, x: "-4%", opacity: 0.96 }
                          : { rotateY: 0, x: "0%", opacity: 1 }
                    }
                    exit={{ opacity: 0 }}
                    transition={flipTransition}
                    onAnimationComplete={() => {
                      setFlipState(null);
                    }}
                    className="absolute inset-0 z-20"
                    style={{
                      transformStyle: "preserve-3d",
                      transformOrigin: isNextFlip ? "left center" : "right center",
                    }}
                  >
                    <article className="relative h-full w-full overflow-hidden rounded-[1.5rem] border border-[#e9decd] bg-[linear-gradient(180deg,#fffefb_0%,#f9f4eb_100%)] shadow-[0_20px_36px_rgba(111,83,47,0.18)]">
                      <div className="absolute inset-y-0 left-0 w-[14%] bg-[linear-gradient(90deg,rgba(214,197,171,0.34),rgba(255,255,255,0))]" />
                      <div className="absolute inset-y-0 right-0 w-[16%] bg-[linear-gradient(90deg,rgba(255,255,255,0),rgba(193,171,140,0.3))]" />
                      <div
                        className={cn(
                          "absolute inset-y-0 w-[12%]",
                          isNextFlip
                            ? "right-0 bg-[linear-gradient(90deg,rgba(255,255,255,0),rgba(112,84,44,0.22))]"
                            : "left-0 bg-[linear-gradient(90deg,rgba(112,84,44,0.22),rgba(255,255,255,0))]"
                        )}
                      />

                      <p className="book-reader-vertical h-full w-full whitespace-pre-wrap break-words px-8 py-9 text-[21px] leading-[2.2] tracking-[0.08em] text-stone-700 md:px-12 md:py-12 md:text-[24px]">
                        {overlayLeaf}
                      </p>
                    </article>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-4 text-center text-sm text-stone-500 md:mt-6">
        右側クリックで次のページを左へ捲り、左側クリックで前のページへ戻れます。キーボードの ← → にも対応しています。
      </p>
    </section>
  );
}

const BookReader = memo(BookReaderComponent);

export default BookReader;
export type { BookReaderProps };
