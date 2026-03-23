const DEFAULT_SENTENCE_CHUNK_LIMIT = 340;
const DEFAULT_PAGE_CHAR_LIMIT = 760;

function splitParagraph(paragraph: string, sentenceChunkLimit: number) {
  if (paragraph.length <= sentenceChunkLimit) {
    return [paragraph];
  }

  const sentences = paragraph.match(/[^。！？!?]+[。！？!?]?/g) ?? [paragraph];
  const chunks: string[] = [];
  let buffer = "";

  for (const sentence of sentences) {
    const next = `${buffer}${sentence}`;

    if (buffer && next.length > sentenceChunkLimit) {
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

export function paginateVerticalJapaneseText(
  content: string,
  options?: {
    sentenceChunkLimit?: number;
    pageCharLimit?: number;
  }
) {
  const normalized = content.replace(/\r\n/g, "\n").trim();

  if (!normalized) {
    return ["本文がありません。"];
  }

  const sentenceChunkLimit =
    options?.sentenceChunkLimit ?? DEFAULT_SENTENCE_CHUNK_LIMIT;
  const pageCharLimit = options?.pageCharLimit ?? DEFAULT_PAGE_CHAR_LIMIT;

  const rawParagraphs = normalized
    .split(/\n\s*\n/)
    .map((item) => item.trim())
    .filter(Boolean);

  const chunks = rawParagraphs.flatMap((paragraph) =>
    splitParagraph(paragraph, sentenceChunkLimit)
  );

  const pages: string[] = [];
  let pageBuffer: string[] = [];
  let pageLength = 0;

  for (const chunk of chunks) {
    const nextLength = pageLength + chunk.length;

    if (pageBuffer.length > 0 && nextLength > pageCharLimit) {
      pages.push(pageBuffer.join("\n\n"));
      pageBuffer = [chunk];
      pageLength = chunk.length;
    } else {
      pageBuffer.push(chunk);
      pageLength = nextLength;
    }
  }

  if (pageBuffer.length > 0) {
    pages.push(pageBuffer.join("\n\n"));
  }

  return pages.length > 0 ? pages : ["本文がありません。"];
}
