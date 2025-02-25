import React from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  onSearch?: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [query, setQuery] = React.useState('');
  
  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(query);
    }
  };
  
  return (
    <div className="flex items-center bg-gray-50 border border-gray-300 rounded px-2 py-1 w-48">
      <Search size={16} className="text-gray-400" />
      <input 
        type="text" 
        placeholder="Search" 
        className="bg-transparent border-none outline-none ml-2 w-full text-sm placeholder-gray-400"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleSearch}
      />
    </div>
  );
};

export default SearchBar;
