import { useEffect, useState } from "react";
import { testSupabaseConnection } from "../lib/supabase";

interface ConnectionStatus {
  status: "testing" | "success" | "error";
  message: string;
}

export default function TestPage() {
  const [connection, setConnection] = useState<ConnectionStatus>({
    status: "testing",
    message: "Testing connection to Supabase...",
  });

  useEffect(() => {
    async function checkConnection() {
      const result = await testSupabaseConnection();

      if (result.success) {
        setConnection({
          status: "success",
          message: "✅ Successfully connected to Supabase database!",
        });
      } else {
        setConnection({
          status: "error",
          message: `❌ Connection failed: ${result.error}`,
        });
      }
    }

    checkConnection();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-600 mb-2">
            🥗 Aible MVP - Dev
          </h1>
          <p className="text-gray-500 text-sm">Development Environment Test</p>
        </div>

        <div className="space-y-4">
          {/* Connection Status */}
          <div
            className={`p-4 rounded-lg border-2 ${
              connection.status === "testing"
                ? "bg-blue-50 border-blue-200"
                : connection.status === "success"
                ? "bg-green-50 border-green-200"
                : "bg-red-50 border-red-200"
            }`}
          >
            <h2 className="font-semibold text-gray-800 mb-2">
              Database Connection
            </h2>
            <p
              className={`text-sm ${
                connection.status === "testing"
                  ? "text-blue-700"
                  : connection.status === "success"
                  ? "text-green-700"
                  : "text-red-700"
              }`}
            >
              {connection.message}
            </p>
          </div>

          {/* Environment Check */}
          <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
            <h2 className="font-semibold text-gray-800 mb-3">
              Environment Setup
            </h2>
            <ul className="text-sm text-gray-700 space-y-2">
              <li className="flex items-center gap-2">
                <span className="text-green-600">✅</span>
                <span>React + TypeScript</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✅</span>
                <span>Vite Build Tool</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✅</span>
                <span>Tailwind CSS v4</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✅</span>
                <span>Supabase Client</span>
              </li>
              <li className="flex items-center gap-2">
                <span
                  className={
                    connection.status === "success"
                      ? "text-green-600"
                      : "text-gray-400"
                  }
                >
                  {connection.status === "success" ? "✅" : "⏳"}
                </span>
                <span>Database Connection</span>
              </li>
            </ul>
          </div>

          {/* Database Info */}
          <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
            <h2 className="font-semibold text-gray-800 mb-2">Database Info</h2>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• 14 tables created</li>
              <li>• Row-Level Security enabled</li>
              <li>• Google OAuth configured</li>
              <li>• Ready for development</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">
            🚀 Ready to start building Aible!
          </p>
        </div>
      </div>
    </div>
  );
}
