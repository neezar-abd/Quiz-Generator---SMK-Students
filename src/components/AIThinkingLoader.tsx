import { memo } from 'react';

const AIThinkingLoader = memo(function AIThinkingLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
      {/* AI Brain Animation */}
      <div className="relative">
        {/* Main Brain Circle */}
        <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center relative overflow-hidden">
          {/* Pulsing Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-ping opacity-20"></div>
          
          {/* Brain Icon */}
          <svg 
            className="w-10 h-10 text-white animate-pulse" 
            fill="currentColor" 
            viewBox="0 0 24 24"
          >
            <path d="M12 2C8.13 2 5 5.13 5 9c0 1.74.5 3.37 1.41 4.84.91 1.47 2.04 2.79 3.34 3.94.65.58 1.37 1.07 2.13 1.42L12 21l.12-1.8c.76-.35 1.48-.84 2.13-1.42 1.3-1.15 2.43-2.47 3.34-3.94C18.5 12.37 19 10.74 19 9c0-3.87-3.13-7-7-7zm0 2c2.76 0 5 2.24 5 5 0 1.26-.36 2.46-1 3.5-.64 1.04-1.5 1.98-2.5 2.75-.5.39-1.01.72-1.5 1-.49-.28-1-.61-1.5-1-1-.77-1.86-1.71-2.5-2.75C7.36 11.46 7 10.26 7 9c0-2.76 2.24-5 5-5z"/>
            <circle cx="9" cy="8" r="1"/>
            <circle cx="15" cy="8" r="1"/>
            <path d="M12 11c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/>
          </svg>
        </div>

        {/* Orbiting Dots */}
        <div className="absolute inset-0 animate-spin-slow">
          <div className="w-3 h-3 bg-blue-400 rounded-full absolute -top-1 left-1/2 transform -translate-x-1/2 animate-bounce"></div>
          <div className="w-2 h-2 bg-purple-400 rounded-full absolute top-4 -right-2 animate-pulse"></div>
          <div className="w-2.5 h-2.5 bg-indigo-400 rounded-full absolute bottom-2 -left-1 animate-bounce" style={{ animationDelay: '0.5s' }}></div>
        </div>
      </div>

      {/* Thinking Text with Typewriter Effect */}
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center justify-center space-x-2">
          <span>AI is thinking</span>
          <span className="flex space-x-1">
            <span className="w-1 h-1 bg-gray-600 rounded-full animate-bounce"></span>
            <span className="w-1 h-1 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
            <span className="w-1 h-1 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
          </span>
        </h3>
        
        <div className="space-y-2 text-gray-600">
          <div className="flex items-center justify-center space-x-2 animate-fade-in-up">
            <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-sm">Analyzing your content...</span>
          </div>
          
          <div className="flex items-center justify-center space-x-2 animate-fade-in-up" style={{ animationDelay: '1s' }}>
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm">Generating intelligent questions...</span>
          </div>
          
          <div className="flex items-center justify-center space-x-2 animate-fade-in-up opacity-50" style={{ animationDelay: '2s' }}>
            <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
            <span className="text-sm">Creating answer keys...</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-xs">
        <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-progress"></div>
        </div>
      </div>

      {/* Fun Facts Carousel */}
      <div className="text-center text-sm text-gray-500 animate-fade-in-out">
  <p className="font-medium">Did you know?</p>
        <p>AI can process your content 1000x faster than humans!</p>
      </div>
    </div>
  );
});

export default AIThinkingLoader;