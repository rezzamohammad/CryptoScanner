interface ErrorStateProps {
  isDark: boolean;
  error: string;
}

export function ErrorState({ isDark, error }: ErrorStateProps) {
  return (
    <div className={`min-h-screen flex items-center justify-center ${
      isDark
        ? 'bg-gradient-to-br from-[#00110c] via-black to-[#110000]'
        : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'
    }`}>
      <div className="text-center max-w-md mx-auto px-4">
        <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mb-4 mx-auto">
          <span className="text-2xl">⚠️</span>
        </div>
        <h2 className={`text-xl font-bold mb-2 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          Connection Failed
        </h2>
        <p className={`text-sm mb-4 ${
          isDark ? 'text-gray-400' : 'text-gray-600'
        }`}>
          {error}
        </p>
        <div className="space-y-2">
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 neon-green-md w-full"
          >
            Retry Connection
          </button>
          <button
            onClick={() => {
              // Enable mock fallback and reload
              localStorage.setItem('force-mock-data', 'true');
              window.location.reload();
            }}
            className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 w-full"
          >
            Use Demo Mode
          </button>
        </div>
      </div>
    </div>
  );
}