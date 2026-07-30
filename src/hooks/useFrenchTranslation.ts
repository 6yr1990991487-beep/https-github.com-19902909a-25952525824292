import { useCallback, useEffect, useMemo, useState } from "react";
import { getCachedTranslation, normalizeTranslationText, translateTexts } from "@/lib/utils";

type UseFrenchTranslationOptions = {
  auto?: boolean;
  storageKey?: string;
  targetLang?: string;
};

export function useFrenchTranslation(texts: Array<string | null | undefined>, options: UseFrenchTranslationOptions = {}) {
  const { auto = false, storageKey, targetLang = "fr" } = options;
  const normalizedTexts = useMemo(
    () => Array.from(new Set(texts.map((value) => normalizeTranslationText(value)).filter(Boolean))),
    [texts],
  );

  const [enabled, setEnabled] = useState<boolean>(() => {
    if (typeof window === "undefined") return auto;
    if (!storageKey) return auto;
    const saved = window.localStorage.getItem(storageKey);
    return saved ? saved === "1" : auto;
  });
  const [loading, setLoading] = useState(false);
  const [translations, setTranslations] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const text of normalizedTexts) {
      const cached = getCachedTranslation(text, targetLang);
      if (cached) initial[text] = cached;
    }
    return initial;
  });

  useEffect(() => {
    if (!storageKey || typeof window === "undefined") return;
    window.localStorage.setItem(storageKey, enabled ? "1" : "0");
  }, [enabled, storageKey]);

  const runTranslate = useCallback(async () => {
    if (!normalizedTexts.length) return;
    setLoading(true);
    try {
      const result = await translateTexts(normalizedTexts, targetLang);
      setTranslations((current) => ({ ...current, ...result }));
    } finally {
      setLoading(false);
    }
  }, [normalizedTexts, targetLang]);

  useEffect(() => {
    if (!enabled) return;
    const missing = normalizedTexts.some((text) => !translations[text] && !getCachedTranslation(text, targetLang));
    if (missing) {
      runTranslate();
    }
  }, [enabled, normalizedTexts, runTranslate, targetLang, translations]);

  const translateNow = useCallback(async () => {
    setEnabled(true);
    await runTranslate();
  }, [runTranslate]);

  const getText = useCallback(
    (original: string | null | undefined) => {
      const normalized = normalizeTranslationText(original);
      if (!normalized) return "";
      if (!enabled) return normalized;
      return translations[normalized] || getCachedTranslation(normalized, targetLang) || normalized;
    },
    [enabled, targetLang, translations],
  );

  return {
    enabled,
    setEnabled,
    loading,
    translations,
    getText,
    translateNow,
  };
}
