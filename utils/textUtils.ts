/**
 * Utility functions for text processing
 */

/**
 * Removes HTML tags and decodes HTML entities from a string
 * @param html HTML string to clean
 * @returns Cleaned text
 */
export function cleanHtmlText(html: string | null): string | null {
  if (!html) return null;
  
  // First, decode HTML entities like &amp; &lt; &gt; &#243; etc.
  const decodedText = decodeHtmlEntities(html);
  
  // Then remove HTML tags
  const textWithoutTags = decodedText.replace(/<\/?[^>]+(>|$)/g, ' ')
                                    .replace(/\s+/g, ' ')
                                    .trim();
  
  return textWithoutTags;
}

/**
 * Decodes HTML entities in a string
 * @param text Text with HTML entities
 * @returns Decoded text
 */
export function decodeHtmlEntities(text: string): string {
  const entities: Record<string, string> = {
    'amp': '&',
    'lt': '<',
    'gt': '>',
    'quot': '"',
    'apos': "'",
    'nbsp': ' '
  };

  // Replace named entities like &amp; &lt; etc.
  let result = text.replace(/&([a-z]+);/gi, (match, entity) => {
    return entities[entity] || match;
  });

  // Replace numeric entities like &#243; &#8211; etc.
  result = result.replace(/&#(\d+);/g, (match, numStr) => {
    const num = parseInt(numStr, 10);
    return String.fromCharCode(num);
  });

  // Replace hex entities like &#x2019; etc.
  result = result.replace(/&#x([0-9a-f]+);/gi, (match, numStr) => {
    const num = parseInt(numStr, 16);
    return String.fromCharCode(num);
  });

  return result;
}