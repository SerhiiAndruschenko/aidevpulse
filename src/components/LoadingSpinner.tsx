export default function LoadingSpinner() {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="relative">
        {/* Main gear */}
        <div className="w-24 h-24 relative">
          <div className="absolute inset-0 w-24 h-24 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
          <div className="absolute inset-2 w-20 h-20 border-4 border-transparent border-t-purple-500 rounded-full animate-spin" style={{ animationDelay: '-0.3s' }}></div>
          <div className="absolute inset-4 w-16 h-16 border-4 border-transparent border-t-cyan-500 rounded-full animate-spin" style={{ animationDelay: '-0.6s' }}></div>
        </div>
        
        
        
      </div>
    </div>
  );
}
