"use client";

import { startTransition, useEffect, useState } from "react";

import type { LiveSearchResults } from "@/features/search/types";

const EMPTY_RESULTS: LiveSearchResults = {
  products: [],
  categories: [],
};

const LIVE_SEARCH_ERROR_MESSAGE = "No se pudieron cargar resultados. Intenta de nuevo.";

function normalizeLiveSearchResults(payload: unknown): LiveSearchResults {
  if (!payload || typeof payload !== "object") {
    return EMPTY_RESULTS;
  }

  const candidate = payload as Partial<LiveSearchResults>;

  return {
    products: Array.isArray(candidate.products) ? candidate.products : [],
    categories: Array.isArray(candidate.categories) ? candidate.categories : [],
  };
}

export function useLiveSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<LiveSearchResults>(EMPTY_RESULTS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (trimmedQuery.length < 2) {
      setIsLoading(false);
      setError(null);
      startTransition(() => {
        setResults(EMPTY_RESULTS);
      });
      return undefined;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(trimmedQuery)}`, {
          signal: controller.signal,
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`SEARCH_REQUEST_FAILED:${response.status}`);
        }

        const payload = normalizeLiveSearchResults(await response.json());

        if (controller.signal.aborted) {
          return;
        }

        startTransition(() => {
          setResults(payload);
        });
      } catch (requestError) {
        if (controller.signal.aborted) {
          return;
        }

        console.error("[useLiveSearch] Failed to fetch live search results", requestError);

        startTransition(() => {
          setResults(EMPTY_RESULTS);
        });
        setError(LIVE_SEARCH_ERROR_MESSAGE);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }, 300);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [query]);

  function clear() {
    setQuery("");
    setIsLoading(false);
    setError(null);
    startTransition(() => {
      setResults(EMPTY_RESULTS);
    });
  }

  return {
    query,
    setQuery,
    results,
    isLoading,
    error,
    clear,
  };
}