"use client";

interface EmptyStreamStateProps {
  onManageStreams: () => void;
  onBackToSetup: () => void;
}

export function EmptyStreamState({ onManageStreams, onBackToSetup }: EmptyStreamStateProps) {
  return (
    <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 relative overflow-hidden">
      {/* Ambient background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-purple-500/5" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      
      <div className="text-center p-8 max-w-md relative z-10">
        {/* Modern icon */}
        <div className="relative mb-8">
          <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-slate-800/80 via-slate-700/60 to-slate-800/80 backdrop-blur-sm border border-slate-700/50 flex items-center justify-center shadow-2xl">
            <svg className="w-12 h-12 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-xs font-bold text-white">0</span>
          </div>
        </div>
        
        <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-300 bg-clip-text text-transparent mb-4">
          No Active Streams
        </h2>
        <p className="text-slate-400 mb-8 text-lg leading-relaxed">
          All streams have been removed. Ready to add some exciting content to watch?
        </p>
        
        <div className="flex flex-col gap-4">
          <button
            onClick={onManageStreams}
            className="group flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 rounded-xl font-semibold transition-all duration-300 text-white shadow-xl hover:shadow-violet-500/25 hover:scale-105 transform"
          >
            <svg className="w-5 h-5 transition-transform group-hover:rotate-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            <span>Add New Streams</span>
          </button>
          
          <button
            onClick={onBackToSetup}
            className="group flex items-center justify-center gap-3 px-8 py-4 bg-slate-800/60 hover:bg-slate-700/80 backdrop-blur-sm border border-slate-700/50 hover:border-slate-600/60 rounded-xl font-semibold transition-all duration-300 text-slate-200 hover:text-white shadow-lg hover:scale-105 transform"
          >
            <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Start Over</span>
          </button>
        </div>
        
        <div className="mt-8 text-sm text-slate-500">
          <p className="flex items-center justify-center gap-2">
            <span className="w-2 h-2 bg-violet-400 rounded-full animate-pulse"></span>
            MultiTwitch Experience
          </p>
        </div>
      </div>
    </div>
  );
} 