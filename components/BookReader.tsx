"use client";

import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
  type TouchEvent,
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

const SWIPE_THRESHOLD = 42;
const SWIPE_VERTICAL_TOLERANCE = 28;

const flipTransition = {
  duration: 0.72,
  ease: [0.22, 0.79, 0.24, 0.99] as const,
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
  pageInfoLabel = "頁",
}: BookReaderProps) {
  const shouldReduceMotion = useReducedMotion();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
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

      if (flipState || clamped === safeVisiblePageIndex) {
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
      safePages.length,
      safeVisiblePageIndex,
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
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goNext();
      }

      if (event.key === "ArrowRight") {
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
        goNext();
        return;
      }

      goPrev();
    },
    [goNext, goPrev]
  );

  const handleTouchStart = useCallback((event: TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const handleTouchEnd = useCallback(
    (event: TouchEvent<HTMLDivElement>) => {
      const start = touchStartRef.current;
      const touch = event.changedTouches[0];
      touchStartRef.current = null;

      if (!start || !touch || flipState) {
        return;
      }

      const deltaX = touch.clientX - start.x;
      const deltaY = touch.clientY - start.y;

      if (Math.abs(deltaY) > SWIPE_VERTICAL_TOLERANCE && Math.abs(deltaY) > Math.abs(deltaX)) {
        return;
      }

      if (deltaX <= -SWIPE_THRESHOLD) {
        goNext();
      }

      if (deltaX >= SWIPE_THRESHOLD) {
        goPrev();
      }
    },
    [flipState, goNext, goPrev]
  );

  const targetIndex = flipState?.targetIndex ?? safeVisiblePageIndex;
  const currentLeaf = safePages[safeVisiblePageIndex];
  const targetLeaf = safePages[targetIndex];
  const isNextFlip = flipState?.direction === 1;
  const overlayLeaf = flipState ? currentLeaf : null;
  const underLeaf = flipState ? targetLeaf : currentLeaf;

  return (
    <section
      className={cn(
        "w-full rounded-[1.9rem] border border-[#ddd0bb] bg-[linear-gradient(180deg,#f0e7d9_0%,#e4d6c1_100%)] p-3 text-stone-800 shadow-[0_16px_40px_rgba(89,66,37,0.10)] sm:p-4 md:p-7",
        className
      )}
      style={textStyle}
      aria-label="読書ページ"
    >
      <div className="mb-3 flex items-center justify-between gap-2 text-sm text-stone-600 md:mb-5">
        <button
          type="button"
          onClick={goNext}
          disabled={safeVisiblePageIndex === safePages.length - 1 || Boolean(flipState)}
          className="rounded-full border border-[#d3c5ad] bg-white/82 px-3.5 py-2 text-sm shadow-sm transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-45 md:px-4"
          aria-label="次のページへ進む"
        >
          ← 次へ
        </button>
        <p className="text-center text-[11px] tracking-[0.16em] text-stone-500 md:text-xs md:tracking-[0.2em]">
          第 {safeVisiblePageIndex + 1} / {safePages.length} {pageInfoLabel}
        </p>
        <button
          type="button"
          onClick={goPrev}
          disabled={safeVisiblePageIndex === 0 || Boolean(flipState)}
          className="rounded-full border border-[#d3c5ad] bg-white/82 px-3.5 py-2 text-sm shadow-sm transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-45 md:px-4"
          aria-label="前のページへ戻る"
        >
          前へ →
        </button>
      </div>

      <div className="rounded-[1.75rem] border border-white/55 bg-white/16 p-2 sm:p-3.5">
        <div className="[perspective:2200px]">
          <div
            role="button"
            tabIndex={0}
            onClick={handlePageClick}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                goNext();
              }
            }}
            className="relative min-h-[430px] cursor-pointer overflow-hidden rounded-[1.45rem] border border-[#e5d8c4] bg-[linear-gradient(180deg,#f7efe4_0%,#ece0ce_100%)] p-2.5 outline-none transition focus-visible:ring-2 focus-visible:ring-[#d3c09f] touch-pan-y sm:min-h-[500px] sm:p-3.5 md:min-h-[720px] md:p-7"
            aria-label="左側タップまたは左スワイプで次のページ、右側タップまたは右スワイプで前のページ"
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.62),transparent_40%),linear-gradient(180deg,rgba(255,255,255,0.08),rgba(123,95,55,0.06))]" />
            <div className="pointer-events-none absolute inset-y-4 left-1/2 w-px -translate-x-1/2 bg-[linear-gradient(180deg,transparent,rgba(162,131,87,0.55),transparent)] md:inset-y-8" />

            <div className="absolute inset-y-4 left-3 right-3 rounded-[1.25rem] bg-[#f9f4eb] shadow-[inset_0_0_0_1px_rgba(214,198,174,0.82),0_10px_22px_rgba(108,82,46,0.07)] sm:left-4 sm:right-4 md:inset-y-9 md:left-10 md:right-10" />

            <div className="absolute inset-y-5 left-4 right-4 overflow-hidden rounded-[1.1rem] border border-[#ece1d0] bg-[linear-gradient(180deg,#fffdf9_0%,#faf3e8_100%)] shadow-[0_12px_22px_rgba(110,84,49,0.07)] sm:left-5 sm:right-5 md:inset-y-11 md:left-12 md:right-12">
              <div className="absolute inset-y-0 left-0 w-[7%] bg-[linear-gradient(90deg,rgba(212,196,171,0.18),rgba(255,255,255,0))]" />
              <div className="absolute inset-y-0 right-0 w-[8%] bg-[linear-gradient(90deg,rgba(255,255,255,0),rgba(212,196,171,0.16))]" />

              <article className="relative z-10 h-full w-full">
                <p className="book-reader-vertical h-full w-full overflow-hidden whitespace-pre-wrap break-words px-3 py-4 text-[15px] leading-[1.72] tracking-[0.02em] text-stone-700 sm:px-4 sm:py-5 sm:text-[15.5px] sm:leading-[1.78] md:px-12 md:py-11 md:text-[20px] md:leading-[2.02] md:tracking-[0.05em]">
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
                        : { rotateY: 0, x: "0%", opacity: 1 }
                    }
                    animate={
                      shouldReduceMotion
                        ? { opacity: 1 }
                        : isNextFlip
                          ? { rotateY: 168, x: "3.5%", opacity: 0.94 }
                          : { rotateY: -168, x: "-3.5%", opacity: 0.94 }
                    }
                    exit={{ opacity: 0 }}
                    transition={flipTransition}
                    onAnimationComplete={() => {
                      setFlipState(null);
                    }}
                    className="absolute inset-0 z-20"
                    style={{
                      transformStyle: "preserve-3d",
                      transformOrigin: isNextFlip ? "right center" : "left center",
                    }}
                  >
                    <article className="relative h-full w-full overflow-hidden rounded-[1.1rem] border border-[#eadfce] bg-[linear-gradient(180deg,#fffefb_0%,#f9f3e9_100%)] shadow-[0_16px_28px_rgba(111,83,47,0.14)]">
                      <div
                        className={cn(
                          "absolute inset-y-0 w-[12%]",
                          isNextFlip
                            ? "left-0 bg-[linear-gradient(90deg,rgba(126,94,53,0.18),rgba(255,255,255,0))]"
                            : "right-0 bg-[linear-gradient(90deg,rgba(255,255,255,0),rgba(126,94,53,0.18))]"
                        )}
                      />
                      <div
                        className={cn(
                          "absolute inset-y-0 w-[10%]",
                          isNextFlip
                            ? "right-0 bg-[linear-gradient(90deg,rgba(255,255,255,0),rgba(214,197,171,0.2))]"
                            : "left-0 bg-[linear-gradient(90deg,rgba(214,197,171,0.2),rgba(255,255,255,0))]"
                        )}
                      />

                      <p className="book-reader-vertical h-full w-full overflow-hidden whitespace-pre-wrap break-words px-3 py-4 text-[15px] leading-[1.72] tracking-[0.02em] text-stone-700 sm:px-4 sm:py-5 sm:text-[15.5px] sm:leading-[1.78] md:px-12 md:py-11 md:text-[20px] md:leading-[2.02] md:tracking-[0.05em]">
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

      <p className="mt-3 text-center text-xs leading-6 text-stone-500 md:mt-5 md:text-sm">
        左側タップまたは左スワイプで次の頁へ、右側タップまたは右スワイプで前の頁へ戻れます。キーボードは ← で次、→ で前です。
      </p>
    </section>
  );
}

const BookReader = memo(BookReaderComponent);

export default BookReader;
export type { BookReaderProps };
