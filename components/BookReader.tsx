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
  duration: 0.76,
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

  const targetIndex = flipState?.targetIndex ?? safeVisiblePageIndex;
  const currentLeaf = safePages[safeVisiblePageIndex];
  const targetLeaf = safePages[targetIndex];
  const isNextFlip = flipState?.direction === 1;
  const overlayLeaf = flipState ? currentLeaf : null;
  const underLeaf = flipState ? targetLeaf : currentLeaf;

  return (
    <section
      className={cn(
        "w-full rounded-[2rem] border border-[#ddd0bb] bg-[linear-gradient(180deg,#f0e7d9_0%,#e3d5bf_100%)] p-3 text-stone-800 shadow-[0_18px_48px_rgba(89,66,37,0.11)] sm:p-5 md:p-7",
        className
      )}
      style={textStyle}
      aria-label="読書ページ"
    >
      <div className="mb-3 flex items-center justify-between gap-3 text-sm text-stone-600 md:mb-5">
        <button
          type="button"
          onClick={goNext}
          disabled={safeVisiblePageIndex === safePages.length - 1 || Boolean(flipState)}
          className="order-1 rounded-full border border-[#d3c5ad] bg-white/80 px-4 py-2 shadow-sm transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-45"
          aria-label="次のページへ進む"
        >
          ← 次へ
        </button>
        <p className="order-2 text-center text-xs tracking-[0.2em] text-stone-500">
          第 {safeVisiblePageIndex + 1} / {safePages.length} {pageInfoLabel}
        </p>
        <button
          type="button"
          onClick={goPrev}
          disabled={safeVisiblePageIndex === 0 || Boolean(flipState)}
          className="order-3 rounded-full border border-[#d3c5ad] bg-white/80 px-4 py-2 shadow-sm transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-45"
          aria-label="前のページへ戻る"
        >
          前へ →
        </button>
      </div>

      <div className="rounded-[1.85rem] border border-white/50 bg-white/15 p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] sm:p-4">
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
            className="relative min-h-[480px] cursor-pointer overflow-hidden rounded-[1.6rem] border border-[#e5d8c4] bg-[linear-gradient(180deg,#f6eee2_0%,#ece0cd_100%)] p-3 outline-none transition focus-visible:ring-2 focus-visible:ring-[#d3c09f] sm:min-h-[520px] sm:p-4 md:min-h-[720px] md:p-7"
            aria-label="左側クリックで次のページ、右側クリックで前のページ"
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.65),transparent_40%),linear-gradient(180deg,rgba(255,255,255,0.1),rgba(123,95,55,0.06))]" />
            <div className="pointer-events-none absolute inset-y-5 left-1/2 w-px -translate-x-1/2 bg-[linear-gradient(180deg,transparent,rgba(162,131,87,0.55),transparent)] md:inset-y-8" />

            <div className="absolute inset-y-6 left-4 right-4 rounded-[1.4rem] bg-[#f8f2e9] shadow-[inset_0_0_0_1px_rgba(214,198,174,0.82),0_12px_28px_rgba(108,82,46,0.08)] sm:left-5 sm:right-5 md:inset-y-9 md:left-10 md:right-10" />

            <div className="absolute inset-y-7 left-5 right-5 overflow-hidden rounded-[1.25rem] border border-[#ece1d0] bg-[linear-gradient(180deg,#fffdf9_0%,#faf3e8_100%)] shadow-[0_14px_28px_rgba(110,84,49,0.08)] sm:left-6 sm:right-6 md:inset-y-11 md:left-12 md:right-12">
              <div className="absolute inset-y-0 left-0 w-[8%] bg-[linear-gradient(90deg,rgba(212,196,171,0.22),rgba(255,255,255,0))]" />
              <div className="absolute inset-y-0 right-0 w-[10%] bg-[linear-gradient(90deg,rgba(255,255,255,0),rgba(212,196,171,0.18))]" />

              <article className="relative z-10 h-full w-full">
                <p className="book-reader-vertical h-full w-full whitespace-pre-wrap break-words px-4 py-5 text-[16px] leading-[1.9] tracking-[0.04em] text-stone-700 sm:px-5 sm:py-6 sm:text-[17px] md:px-12 md:py-11 md:text-[21px] md:leading-[2.08] md:tracking-[0.06em]">
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
                          : { rotateY: 0, x: "0%", opacity: 1 }
                    }
                    animate={
                      shouldReduceMotion
                        ? { opacity: 1 }
                        : isNextFlip
                          ? { rotateY: 168, x: "4%", opacity: 0.94 }
                          : { rotateY: -168, x: "-4%", opacity: 0.94 }
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
                    <article className="relative h-full w-full overflow-hidden rounded-[1.25rem] border border-[#eadfce] bg-[linear-gradient(180deg,#fffefb_0%,#f9f3e9_100%)] shadow-[0_18px_34px_rgba(111,83,47,0.16)]">
                      <div
                        className={cn(
                          "absolute inset-y-0 w-[14%]",
                          isNextFlip
                            ? "left-0 bg-[linear-gradient(90deg,rgba(126,94,53,0.22),rgba(255,255,255,0))]"
                            : "right-0 bg-[linear-gradient(90deg,rgba(255,255,255,0),rgba(126,94,53,0.22))]"
                        )}
                      />
                      <div
                        className={cn(
                          "absolute inset-y-0 w-[12%]",
                          isNextFlip
                            ? "right-0 bg-[linear-gradient(90deg,rgba(255,255,255,0),rgba(214,197,171,0.26))]"
                            : "left-0 bg-[linear-gradient(90deg,rgba(214,197,171,0.26),rgba(255,255,255,0))]"
                        )}
                      />

                      <p className="book-reader-vertical h-full w-full whitespace-pre-wrap break-words px-4 py-5 text-[16px] leading-[1.9] tracking-[0.04em] text-stone-700 sm:px-5 sm:py-6 sm:text-[17px] md:px-12 md:py-11 md:text-[21px] md:leading-[2.08] md:tracking-[0.06em]">
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
        左側で次の頁へ、右側で前の頁へ。キーボードは ← で次、→ で前です。
      </p>
    </section>
  );
}

const BookReader = memo(BookReaderComponent);

export default BookReader;
export type { BookReaderProps };
