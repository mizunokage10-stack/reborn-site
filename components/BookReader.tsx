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
import { cn } from "@/lib/utils";

type BookReaderProps = {
  pages?: string[];
  sourceText?: string;
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

type ReaderMetrics = {
  fontSize: number;
  columnGap: number;
  paddingBlock: number;
  paddingInline: number;
};

const SWIPE_THRESHOLD = 42;
const SWIPE_VERTICAL_TOLERANCE = 30;
const FLIP_DURATION_MS = 680;

const textStyle = {
  fontFamily:
    '"MS Mincho", "MS 明朝", "Hiragino Mincho ProN", "Yu Mincho", "YuMincho", "Times New Roman", serif',
};

function clampPage(value: number, total: number) {
  if (total <= 0) return 0;
  return Math.min(Math.max(value, 0), total - 1);
}

function splitParagraph(paragraph: string, chunkLimit: number) {
  if (paragraph.length <= chunkLimit) {
    return [paragraph];
  }

  const sentences = paragraph.match(/[^。！？!?]+[。！？!?]?/g) ?? [paragraph];
  const chunks: string[] = [];
  let buffer = "";

  for (const sentence of sentences) {
    const next = `${buffer}${sentence}`;

    if (buffer && next.length > chunkLimit) {
      chunks.push(buffer.trim());
      buffer = sentence;
    } else {
      buffer = next;
    }
  }

  if (buffer.trim()) {
    chunks.push(buffer.trim());
  }

  return chunks;
}

function paginateSourceText(sourceText: string, estimatedCapacity: number) {
  const normalized = sourceText.replace(/\r\n/g, "\n").trim();

  if (!normalized) {
    return ["本文がありません。"];
  }

  const rawParagraphs = normalized
    .split(/\n\s*\n/)
    .map((item) => item.trim())
    .filter(Boolean);

  const sentenceChunkLimit = Math.max(120, Math.floor(estimatedCapacity * 0.55));
  const pageCharLimit = Math.max(220, estimatedCapacity);
  const chunks = rawParagraphs.flatMap((paragraph) =>
    splitParagraph(paragraph, sentenceChunkLimit)
  );

  const result: string[] = [];
  let buffer: string[] = [];
  let total = 0;

  for (const chunk of chunks) {
    const nextLength = total + chunk.length;

    if (buffer.length > 0 && nextLength > pageCharLimit) {
      result.push(buffer.join("\n\n"));
      buffer = [chunk];
      total = chunk.length;
    } else {
      buffer.push(chunk);
      total = nextLength;
    }
  }

  if (buffer.length > 0) {
    result.push(buffer.join("\n\n"));
  }

  return result.length > 0 ? result : ["本文がありません。"];
}

function measureMetrics(width: number) {
  if (width < 420) {
    return {
      fontSize: 14.5,
      columnGap: 22,
      paddingBlock: 14,
      paddingInline: 12,
    } satisfies ReaderMetrics;
  }

  if (width < 768) {
    return {
      fontSize: 15.5,
      columnGap: 24,
      paddingBlock: 18,
      paddingInline: 16,
    } satisfies ReaderMetrics;
  }

  return {
    fontSize: 20,
    columnGap: 40,
    paddingBlock: 44,
    paddingInline: 48,
  } satisfies ReaderMetrics;
}

function estimateCapacity(width: number, height: number, metrics: ReaderMetrics) {
  const usableWidth = Math.max(0, width - metrics.paddingInline * 2);
  const usableHeight = Math.max(0, height - metrics.paddingBlock * 2);
  const charsPerColumn = Math.max(1, Math.floor(usableHeight / metrics.fontSize));
  const columnWidth = metrics.fontSize + metrics.columnGap;
  const columns = Math.max(1, Math.floor(usableWidth / columnWidth));

  return charsPerColumn * columns;
}

function BookReaderComponent({
  pages,
  sourceText,
  className,
  currentPage = 1,
  basePath,
  pageInfoLabel = "頁",
}: BookReaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pageFrameRef = useRef<HTMLDivElement | null>(null);
  const flipTimerRef = useRef<number | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const staticPages = useMemo(
    () => (pages && pages.length > 0 ? pages : ["本文がありません。"]),
    [pages]
  );
  const [layoutPages, setLayoutPages] = useState<string[] | null>(null);
  const [flipState, setFlipState] = useState<FlipState | null>(null);
  const [isFlipAnimating, setIsFlipAnimating] = useState(false);

  useEffect(() => {
    if (!sourceText || !pageFrameRef.current) {
      return;
    }

    const element = pageFrameRef.current;

    const updateLayout = () => {
      const rect = element.getBoundingClientRect();
      const nextMetrics = measureMetrics(rect.width);
      const capacity = estimateCapacity(rect.width, rect.height, nextMetrics);

      setLayoutPages(paginateSourceText(sourceText, capacity));
    };

    updateLayout();

    const observer = new ResizeObserver(() => {
      updateLayout();
    });

    observer.observe(element);

    return () => observer.disconnect();
  }, [sourceText]);

  useEffect(() => {
    return () => {
      if (flipTimerRef.current) {
        window.clearTimeout(flipTimerRef.current);
      }
    };
  }, []);

  const safePages = layoutPages && layoutPages.length > 0 ? layoutPages : staticPages;
  const currentPageIndex = clampPage(currentPage - 1, safePages.length);
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
      setIsFlipAnimating(false);

      router.push(`${basePath ?? pathname}?${params.toString()}`, { scroll: false });

      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          setIsFlipAnimating(true);
        });
      });

      if (flipTimerRef.current) {
        window.clearTimeout(flipTimerRef.current);
      }

      flipTimerRef.current = window.setTimeout(() => {
        setFlipState(null);
        setIsFlipAnimating(false);
        flipTimerRef.current = null;
      }, FLIP_DURATION_MS);
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
  const underLeaf = flipState ? targetLeaf : currentLeaf;
  const nextFlip = flipState?.direction === 1;
  const pageTextClass =
    "book-reader-vertical h-full w-full whitespace-pre-wrap break-words px-3 py-4 text-[14px] leading-[1.62] tracking-[0.01em] text-stone-700 sm:px-4 sm:py-5 sm:text-[15px] sm:leading-[1.68] md:px-12 md:py-11 md:text-[20px] md:leading-[1.96] md:tracking-[0.04em]";

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
        <div
          className="relative [perspective:1500px]"
          style={{ transformStyle: "preserve-3d" }}
        >
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
            className="relative min-h-[430px] cursor-pointer overflow-hidden rounded-[1.45rem] border border-[#e5d8c4] bg-[linear-gradient(180deg,#fdfbf7_0%,#f2e9db_100%)] p-2.5 outline-none transition focus-visible:ring-2 focus-visible:ring-[#d3c09f] touch-pan-y sm:min-h-[500px] sm:p-3.5 md:min-h-[720px] md:p-7"
            aria-label="左側タップまたは左スワイプで次のページ、右側タップまたは右スワイプで前のページ"
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.62),transparent_42%)]" />
            <div className="pointer-events-none absolute inset-y-4 left-1/2 w-px -translate-x-1/2 bg-[linear-gradient(180deg,transparent,rgba(162,131,87,0.55),transparent)] md:inset-y-8" />

            <div className="absolute inset-y-4 left-3 right-3 rounded-[1.25rem] bg-[#fdfbf7] shadow-[inset_0_0_0_1px_rgba(214,198,174,0.82),0_10px_22px_rgba(108,82,46,0.07)] sm:left-4 sm:right-4 md:inset-y-9 md:left-10 md:right-10" />

            <div
              ref={pageFrameRef}
              className="absolute inset-y-5 left-4 right-4 overflow-visible rounded-[1.1rem] border border-[#ece1d0] bg-[linear-gradient(180deg,#fffdf9_0%,#faf3e8_100%)] shadow-[0_12px_22px_rgba(110,84,49,0.07)] sm:left-5 sm:right-5 md:inset-y-11 md:left-12 md:right-12"
            >
              <div className="absolute inset-y-0 left-0 w-[7%] bg-[linear-gradient(90deg,rgba(212,196,171,0.18),rgba(255,255,255,0))]" />
              <div className="absolute inset-y-0 right-0 w-[8%] bg-[linear-gradient(90deg,rgba(255,255,255,0),rgba(212,196,171,0.16))]" />

              <article className="relative z-10 h-full w-full overflow-hidden">
                <p className={pageTextClass} style={{ overflow: "visible" }}>
                  {underLeaf}
                </p>
              </article>

              {flipState ? (
                <div
                  className={cn(
                    "absolute inset-0 z-20 transition-transform",
                    isFlipAnimating
                      ? nextFlip
                        ? "book-reader-flip-next"
                        : "book-reader-flip-prev"
                      : "book-reader-flip-idle"
                  )}
                  style={{
                    transformStyle: "preserve-3d",
                    transitionDuration: `${FLIP_DURATION_MS}ms`,
                    transformOrigin: nextFlip ? "right center" : "left center",
                  }}
                >
                  <article className="relative h-full w-full overflow-hidden rounded-[1.1rem] border border-[#eadfce] bg-[linear-gradient(180deg,#fffefb_0%,#f9f3e9_100%)] shadow-[0_16px_28px_rgba(111,83,47,0.14)] [backface-visibility:hidden]">
                    <div
                      className={cn(
                        "absolute inset-y-0 w-[12%]",
                        nextFlip
                          ? "left-0 bg-[linear-gradient(90deg,rgba(126,94,53,0.18),rgba(255,255,255,0))]"
                          : "right-0 bg-[linear-gradient(90deg,rgba(255,255,255,0),rgba(126,94,53,0.18))]"
                      )}
                    />
                    <div
                      className={cn(
                        "absolute inset-y-0 w-[10%]",
                        nextFlip
                          ? "right-0 bg-[linear-gradient(90deg,rgba(255,255,255,0),rgba(214,197,171,0.2))]"
                          : "left-0 bg-[linear-gradient(90deg,rgba(214,197,171,0.2),rgba(255,255,255,0))]"
                      )}
                    />
                    <p className={pageTextClass}>{currentLeaf}</p>
                  </article>
                </div>
              ) : null}
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
