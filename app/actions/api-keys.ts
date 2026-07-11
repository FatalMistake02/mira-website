// app/actions/api-keys.ts
"use server";

import { createClient } from "@supabase/supabase-js"; 
import crypto from "node:crypto";
import { promises as dnsPromises } from "node:dns";

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! 
);

export async function generateChallenge(domain: string) {
  if (!domain || !domain.includes(".")) {
    return { error: "Please enter a valid domain." };
  }

  const token = crypto.randomBytes(16).toString('hex');

  // Use adminSupabase instead of createClient()
  const { error } = await adminSupabase
    .from('domain_verifications')
    .upsert({ domain, token }, { onConflict: 'domain' });

  if (error) {
    console.error("Admin DB Error:", error);
    return { error: `DB Error: ${error.message}` };
  }

  return { 
    success: true, 
    token, 
    recordName: `mira-verification.${domain}` 
  };
}

export async function verifyAndIssueKey(domain: string) {
  // Use adminSupabase instead of createClient()
  const { data: verifyData, error: fetchError } = await adminSupabase
    .from('domain_verifications')
    .select('token')
    .eq('domain', domain)
    .single();

  if (fetchError || !verifyData) {
    return { error: "No pending verification found. Please start over." };
  }

  try {
    const records = await dnsPromises.resolveTxt(`mira-verification.${domain}`);
    const allTxtRecords = records.flat().join("");
    
    if (!allTxtRecords.includes(verifyData.token)) {
      return { error: "DNS record not found. Please wait for propagation." };
    }
  } catch (e) {
    return { error: "Could not verify DNS records." };
  }

  const apiKey = `mira_${crypto.randomBytes(32).toString('hex')}`;

  // Admin operations: Delete old key and Insert new key
  await adminSupabase.from('api_keys').delete().eq('domain', domain);
  
  const { error: insertError } = await adminSupabase
    .from('api_keys')
    .insert({ key_value: apiKey, domain });

  if (insertError) {
    console.error("Admin Insert Error:", insertError);
    return { error: "Failed to save your API key." };
  }

  // Admin cleanup
  await adminSupabase.from('domain_verifications').delete().eq('domain', domain);

  return { success: true, apiKey };
}
