interface ConnectionBannerProps {
  error: string | null;
  connectionStatus: string;
}

export function ConnectionBanner({ error, connectionStatus }: ConnectionBannerProps) {
  if (!error || connectionStatus !== 'disconnected') return null;

  return (
    <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-3 rounded-lg mb-6 text-center">
      <div className="flex items-center justify-center space-x-2">
        <span className="font-medium">⚠️ Connection Issue:</span>
        <span>{error}</span>
        <button
          onClick={() => window.location.reload()}
          className="ml-2 underline hover:no-underline font-medium"
        >
          Retry
        </button>
      </div>
    </div>
  );
}