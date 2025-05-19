import { createBrowserClient } from "@supabase/ssr";

export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  console.log("Creating Supabase client with:", {
    urlAvailable: !!supabaseUrl,
    keyAvailable: !!supabaseKey,
    urlPrefix: supabaseUrl?.substring(0, 10),
    keyPrefix: supabaseKey?.substring(0, 5),
  });

  if (!supabaseUrl || !supabaseKey) {
    console.error("Supabase credentials missing!");
  }

  const client = createBrowserClient(supabaseUrl!, supabaseKey!);

  console.log("Supabase client created:", !!client);
  return client;
};
