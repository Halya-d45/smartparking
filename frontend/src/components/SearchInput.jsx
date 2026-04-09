import React, { useState, useRef, useEffect } from 'react';

const SearchInput = ({ onSearch, placeholder = "Search city like Hyderabad, Vijayawada..." }) => {
  const [searchValue, setSearchValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);

  // Handle search functionality
  const handleSearch = async () => {
    if (!searchValue.trim()) return;

    setIsLoading(true);
    try {
      await onSearch(searchValue.trim());
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Apply autofill detection and styling fixes
  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    const handleAnimationStart = (e) => {
      if (e.animationName === 'autofill') {
        // Force dark theme styles when autofill is detected
        input.style.setProperty('background-color', 'transparent', 'important');
        input.style.setProperty('color', 'white', 'important');
        input.style.setProperty('-webkit-text-fill-color', 'white', 'important');
        input.style.setProperty('box-shadow', 'none', 'important');
      }
    };

    input.addEventListener('animationstart', handleAnimationStart);

    return () => {
      input.removeEventListener('animationstart', handleAnimationStart);
    };
  }, []);

  return (
    <div className="relative flex items-center bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl overflow-hidden transition-all duration-300 focus-within:border-blue-500/50 focus-within:shadow-lg focus-within:shadow-blue-500/10 hover:border-gray-600/50">
      {/* Search Icon */}
      <div className="flex items-center justify-center w-12 h-full text-gray-400">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* Input Field */}
      <input
        ref={inputRef}
        type="text"
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        className="
          flex-1 px-0 py-5 bg-transparent border-none outline-none
          text-white placeholder-gray-400 font-medium text-base
          autofill:bg-transparent autofill:text-white
          [-webkit-text-fill-color:white] [-webkit-box-shadow:none]
          focus:ring-0 focus:outline-none focus:bg-transparent
          selection:bg-blue-500/30 selection:text-white
        "
        style={{
          // Additional CSS-in-JS fixes for stubborn browser styles
          WebkitAppearance: 'none',
          MozAppearance: 'none',
          backgroundColor: 'transparent !important',
          color: 'white !important',
          WebkitTextFillColor: 'white !important',
          WebkitBoxShadow: 'none !important',
          boxShadow: 'none !important',
        }}
      />

      {/* Search Button */}
      <button
        onClick={handleSearch}
        disabled={isLoading || !searchValue.trim()}
        className="
          flex items-center gap-2 px-6 py-4
          bg-gradient-to-r from-blue-600 to-indigo-600
          hover:from-blue-500 hover:to-indigo-500
          disabled:from-gray-700 disabled:to-gray-700
          disabled:cursor-not-allowed
          text-white font-semibold text-sm
          transition-all duration-200
          rounded-l-none rounded-r-2xl
          shadow-lg shadow-blue-500/25
          hover:shadow-xl hover:shadow-blue-500/30
          active:scale-95
          focus:outline-none focus:ring-2 focus:ring-blue-500/50
        "
      >
        {isLoading ? (
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <>
            <span>Search</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </>
        )}
      </button>
    </div>
  );
};

export default SearchInput;