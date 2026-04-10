import React, { useState, useRef, useEffect } from 'react';

const SearchInput = ({ onSearch, placeholder = "Search city like Hyderabad, Vijayawada..." }) => {
  const [searchValue, setSearchValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);

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

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div className="relative flex items-center bg-white rounded-3xl overflow-hidden transition-all duration-300 border border-gray-100 shadow-sm focus-within:shadow-xl focus-within:shadow-blue-500/5 focus-within:border-blue-200">
      <div className="flex items-center justify-center w-14 h-full text-gray-400">
        <i className="fas fa-search text-lg"></i>
      </div>

      <input
        ref={inputRef}
        type="text"
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        className="flex-1 px-0 py-5 bg-transparent border-none outline-none text-slate-800 placeholder-gray-400 font-semibold text-base"
      />

      <button
        onClick={handleSearch}
        disabled={isLoading || !searchValue.trim()}
        className="flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:cursor-not-allowed text-white font-bold text-sm transition-all duration-200 rounded-2xl m-1.5 shadow-lg shadow-blue-500/20 active:scale-95"
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <>
            <span>Search</span>
            <i className="fas fa-arrow-right text-[10px]"></i>
          </>
        )}
      </button>
    </div>
  );
};

export default SearchInput;