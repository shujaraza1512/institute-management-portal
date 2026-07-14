import { Search } from 'lucide-react';

function SearchInput({ value, onChange, placeholder = 'Search…' }) {
  return (
    <div className="relative">
      <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-3 py-2 border border-navy-100 rounded-card text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 w-full sm:w-64"
      />
    </div>
  );
}

export default SearchInput;
