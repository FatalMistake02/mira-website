// app/apikey/page.tsx
"use client";

import { useState } from "react";
import { generateChallenge, verifyAndIssueKey } from "@/app/actions/api-keys";

export default function ApiKeyPage() {
  const [domain, setDomain] = useState("");
  const [step, setStep] = useState<"input" | "challenge" | "success">("input");
  const [challengeData, setChallengeData] = useState<{ token: string; recordName: string } | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Request Challenge
  async function handleStart() {
    setLoading(true);
    setError(null);
    const result = await generateChallenge(domain);
    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else if (result.success) {
      setChallengeData({ token: result.token!, recordName: result.recordName! });
      setStep("challenge");
    }
  }

  // Step 2: Verify DNS and Get Key
  async function handleVerify() {
    setLoading(true);
    setError(null);
    const result = await verifyAndIssueKey(domain);
    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else if (result.success) {
      setApiKey(result.apiKey!);
      setStep("success");
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-8 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">API Key</h1>

      {/* STEP 1: INPUT DOMAIN */}
      {step === "input" && (
        <div className="space-y-4">
          <p className="">Enter the domain you want to associate with your API key.</p>
          <div className="flex gap-2">
            <input 
              className="border p-2 rounded flex-1 focus:outline-none" 
              placeholder="example.com" 
              value={domain} 
              onChange={(e) => setDomain(e.target.value)} 
            />
            <button 
              onClick={handleStart} 
              disabled={loading} 
              className="bg-blue-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
            >
              {loading ? "Loading..." : "Next"}
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: DNS CHALLENGE */}
      {step === "challenge" && challengeData && (
        <div className="space-y-6 bg-gray-50 p-6 rounded-lg border">
          <div className="text-sm font-medium text-gray-700">
            To verify ownership of <span className="font-bold">{domain}</span>, add the following TXT record to your DNS provider:
          </div>
          
          <div className="grid grid-cols-2 gap-4 bg-white p-4 border rounded font-mono text-sm">
            <div>
              <span className="block text-xs text-gray-400 uppercase">Host/Name</span>
              <span className="text-black">{challengeData.recordName}</span>
            </div>
            <div>
              <span className="block text-xs text-gray-400 uppercase">Value</span>
              <span className="text-black">{challengeData.token}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={() => setStep("input")} 
              className="text-gray-500 underline mr-auto"
            >
              Change Domain
            </button>
            <button 
              onClick={handleVerify} 
              disabled={loading} 
              className="bg-green-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
            >
              {loading ? "Verifying..." : "Verify & Generate Key"}
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: SUCCESS / SHOW KEY */}
      {step === "success" && (
        <div className="space-y-4">
          <p className="text-sm">
            Your API key has been generated. <strong>Copy it now.</strong> We will not show it again.
          </p>
          <div className="flex items-center gap-2 rounded font-mono text-lg break-all">
            <code>{apiKey}</code>
            <button 
              onClick={() => navigator.clipboard.writeText(apiKey || "")}
              className="ml-auto bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded text-sm"
            >
              Copy
            </button>
          </div>
          <button 
            onClick={() => setStep("input")} 
            className="block text-center text-sm text-gray-500 underline"
          >
            Done / Generate a new key
          </button>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
