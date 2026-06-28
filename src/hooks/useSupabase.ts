import { useState, useEffect, useCallback } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useSupabaseQuery<T = any>(
  table: string,
  options?: {
    select?: string;
    eq?: { column: string; value: unknown };
    order?: { column: string; ascending?: boolean };
    limit?: number;
  }
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      let query = supabase.from(table).select(options?.select || "*");

      if (options?.eq) {
        query = query.eq(options.eq.column, options.eq.value);
      }
      if (options?.order) {
        query = query.order(options.order.column, {
          ascending: options.order.ascending ?? true,
        });
      }
      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data: rows, error: err } = await query;
      if (err) throw err;
      setData((rows || []) as T[]);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function supabaseInsert(table: string, payload: Record<string, any>) {
  if (!isSupabaseConfigured()) return { data: null, error: null };
  const { data, error } = await supabase.from(table).insert(payload).select().single();
  return { data, error };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function supabaseUpdate(table: string, id: string, payload: Record<string, any>) {
  if (!isSupabaseConfigured()) return { data: null, error: null };
  const { data, error } = await supabase.from(table).update(payload).eq("id", id).select().single();
  return { data, error };
}
