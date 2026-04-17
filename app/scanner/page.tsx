"use client";

import { useEffect, useState } from "react";
import { Scanner } from '@yudiel/react-qr-scanner';
import { CheckCircle2, XCircle, Loader2, Camera } from "lucide-react";

export default function ScannerPage() {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [scannerActive, setScannerActive] = useState(false);

  const handleScan = async (result: any) => {
    if (!result || !result[0]) return;
    const code = result[0].rawValue || result[0].text || result[0];

    // Prevent double scanning while loading
    if (status === "loading" || status === "success") return;

    setScanResult(code);
    setScannerActive(false);
    await handleVerifyAction(code);
  };

  const handleError = (error: any) => {
    console.error("Scanner Error:", error);
    setStatus("error");
    setMessage("Camera Error. Please ensure you have granted camera permissions and are using a secure connection (HTTPS or Localhost).");
  };

  const handleVerifyAction = async (code: string) => {
    setStatus("loading");
    try {
      const res = await fetch("/api/scan-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qr_code: code })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setStatus("success");
        // Generate an array mapping of what to admit
        const admitText = data.details.tickets?.map((t: any) => `${t.quantity}x ${t.name}`).join(", ") || "Unknown Tickets";
        setMessage(`Admit: ${admitText} (${data.details.user_name})`);
      } else {
        setStatus("error");
        setMessage(data.error || "Verification failed");
      }
    } catch (e) {
      setStatus("error");
      setMessage("Network error");
    }
  };

  const handleReset = () => {
    setScanResult(null);
    setStatus("idle");
    setMessage("");
    setScannerActive(false);
    setTimeout(() => setScannerActive(true), 100);
  };

  return (
    <div className="min-h-screen bg-stone-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        <div className="p-6 border-b border-stone-100 bg-stone-50 text-center">
          <h1 className="text-xl font-bold text-stone-900">Entrance Scanner</h1>
          <p className="text-sm text-stone-500 mt-1">Scan QR Code to verify entry</p>
        </div>

        <div className="relative flex-1 bg-black min-h-[400px] flex items-center justify-center overflow-hidden">
          {scannerActive ? (
            <Scanner
              onScan={handleScan}
              onError={handleError}
              components={{
                finder: true,
              }}
              styles={{
                container: { width: '100%', height: '100%' }
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-stone-400 p-8 text-center">
              <Camera className="w-16 h-16 mb-4 text-stone-600" />
              <p className="mb-6 font-medium">Camera is currently inactive.</p>
              <button
                onClick={() => {
                  if (typeof window !== 'undefined' && window.isSecureContext === false) {
                    setStatus("error");
                    setMessage("SECURITY BLOCK: Mobile phones block cameras on local IPs (e.g. 192.168.x.x). You MUST use a secure HTTPS tunnel like ngrok to test on a physical phone!");
                    return;
                  }
                  setScannerActive(true);
                }}
                className="bg-emerald-500 cursor-pointer hover:bg-emerald-600 text-white px-6 py-3 rounded-full font-bold shadow-lg transition-transform active:scale-95"
              >
                Enable Camera Access
              </button>
              <p className="text-xs text-stone-600 mt-4 max-w-xs">
                Your browser will prompt you to grant camera permissions when you click this button.
              </p>
            </div>
          )}
        </div>

        <div className="p-6 bg-white min-h-[180px] flex flex-col items-center justify-center text-center">
          {status === "idle" && (
            <p className="text-stone-500 font-medium">Awaiting scan...</p>
          )}

          {status === "loading" && (
            <div className="flex flex-col items-center gap-3 text-stone-500">
              <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
              <p className="font-medium animate-pulse">Verifying code...</p>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center gap-2">
              <CheckCircle2 className="w-12 h-12 text-emerald-500" />
              <p className="font-bold text-lg text-emerald-600">VALID TICKET</p>
              <p className="text-stone-600">{message}</p>
              <p className="text-xs text-stone-400 font-mono mt-1">{scanResult}</p>
              <button
                onClick={handleReset}
                className="mt-4 cursor-pointer bg-emerald-500 text-white px-6 py-2 rounded-full font-medium"
              >
                Scan Next
              </button>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center gap-2">
              <XCircle className="w-12 h-12 text-rose-500" />
              <p className="font-bold text-lg text-rose-600">INVALID</p>
              <p className="text-stone-600 font-medium">{message}</p>
              <p className="text-xs text-stone-400 font-mono mt-1">{scanResult}</p>
              <button
                onClick={handleReset}
                className="mt-4 cursor-pointer bg-rose-500 text-white px-6 py-2 rounded-full font-medium"
              >
                Retry Scan
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
