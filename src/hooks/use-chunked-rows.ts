import { useCallback, useEffect, useRef, useState } from 'react';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

/** How many table rows are drawn first, and how many more each time the user scrolls near the end. */
export const ROW_CHUNK = 100;

/** Start loading the next chunk when the end is within this many screen heights (~half way through a 100-row chunk). */
const LOAD_AHEAD = 3;

/**
 * Draws a long table in chunks: the first `ROW_CHUNK` rows, then `ROW_CHUNK` more whenever the screen is scrolled close to
 * the end. `resetKey` (the search text, the chosen group...) starts again from the first chunk. Hook `onScroll` up to the
 * screen's vertical list.
 */
export function useChunkedRows<T>(rows: T[], resetKey: string) {
  const [state, setState] = useState({ key: resetKey, limit: ROW_CHUNK });
  const limit = state.key === resetKey ? state.limit : ROW_CHUNK;
  const loading = useRef(false);

  // the next chunk is on screen: allow loading the one after it
  useEffect(() => {
    loading.current = false;
  }, [limit, resetKey]);

  const hasMore = limit < rows.length;

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
      const remaining = contentSize.height - (contentOffset.y + layoutMeasurement.height);

      if (hasMore && !loading.current && remaining < layoutMeasurement.height * LOAD_AHEAD) {
        loading.current = true;
        setState({ key: resetKey, limit: limit + ROW_CHUNK });
      }
    },
    [hasMore, limit, resetKey],
  );

  return { visible: rows.slice(0, limit), total: rows.length, onScroll };
}
