import React, { useState, useEffect } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';

const FilterBar = ({ 
  onFilterChange, 
  searchQuery, 
  setSearchQuery,
  listingType = 'Rent',
  setListingType,
  selectedLocalities,
  setSelectedLocalities,
  minBudget,
  setMinBudget,
  maxBudget,
  setMaxBudget,
  selectedBHK,
  setSelectedBHK,
  selectedPropertyTypes,
  setSelectedPropertyTypes
}) => {
  const [activeFilter, setActiveFilter] = useState(null);
  const [localities, setLocalities] = useState([]);
  const [loadingLocalities, setLoadingLocalities] = useState(false);

  // Fetch unique localities from API
  useEffect(() => {
    const fetchLocalities = async () => {
      setLoadingLocalities(true);
      try {
        const response = await fetch('https://api.gharzoreality.com/api/public/properties?limit=100');
        const data = await response.json();
        
        if (data?.data) {
          // Extract unique localities
          const uniqueLocalities = [...new Set(
            data.data
              .filter(p => p.listingType === listingType)
              .map(p => p.location?.locality)
              .filter(Boolean)
          )];
          setLocalities(uniqueLocalities);
        }
      } catch (error) {
        console.error('Error fetching localities:', error);
        // Fallback localities
        setLocalities(['Nipania', 'Bicholi Mardana', 'Vijay Nagar', 'Mahalakshmi Nagar', 'Talawali Chanda']);
      } finally {
        setLoadingLocalities(false);
      }
    };

    fetchLocalities();
  }, [listingType]);

  const bhkOptions = ['1 BHK', '2 BHK', '3 BHK', '4 BHK', '5+ BHK'];
  const propertyTypeOptions = ['Flat', 'House/Villa', 'Plot/Land', 'Office Space', 'PG', 'Studio'];

  const toggleFilter = (filter) => {
    setActiveFilter(activeFilter === filter ? null : filter);
  };

  const handleLocalityToggle = (locality) => {
    const updated = selectedLocalities.includes(locality)
      ? selectedLocalities.filter(l => l !== locality)
      : [...selectedLocalities, locality];
    setSelectedLocalities(updated);
    onFilterChange({ selectedLocalities: updated });
  };

  const handleBHKToggle = (bhk) => {
    const updated = selectedBHK.includes(bhk)
      ? selectedBHK.filter(b => b !== bhk)
      : [...selectedBHK, bhk];
    setSelectedBHK(updated);
    onFilterChange({ selectedBHK: updated });
  };

  const handlePropertyTypeToggle = (type) => {
    const updated = selectedPropertyTypes.includes(type)
      ? selectedPropertyTypes.filter(t => t !== type)
      : [...selectedPropertyTypes, type];
    setSelectedPropertyTypes(updated);
    onFilterChange({ selectedPropertyTypes: updated });
  };

  const applyBudgetFilter = () => {
    onFilterChange({ minBudget, maxBudget });
    setActiveFilter(null);
  };

  const clearBudgetFilter = () => {
    setMinBudget('');
    setMaxBudget('');
    onFilterChange({ minBudget: '', maxBudget: '' });
  };

  const handleSearch = () => {
    onFilterChange({ 
      searchQuery, 
      listingType,
      selectedLocalities,
      minBudget,
      maxBudget,
      selectedBHK,
      selectedPropertyTypes
    });
  };

  const handleBuyRentToggle = (type) => {
    setListingType(type);
    onFilterChange({ listingType: type });
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (activeFilter && !e.target.closest('.filter-dropdown')) {
        setActiveFilter(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [activeFilter]);

  return (
    <div className="w-full bg-white shadow-md border-b sticky top-0 z-50 font-sans">
      <div className="max-w-7xl mx-auto px-4 py-3">
        {/* Top Search & Primary Filters */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Buy/Rent Toggle (Dark Blue Theme) */}
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button 
              onClick={() => handleBuyRentToggle('Buy')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                listingType === 'Buy' 
                  ? 'bg-[#002f6c] text-white' 
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Buy
            </button>
            <button 
              onClick={() => handleBuyRentToggle('Rent')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                listingType === 'Rent' 
                  ? 'bg-[#002f6c] text-white' 
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Rent
            </button>
          </div>

          {/* Search Input */}
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Enter Locality, Project or Builder" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f15a24] border-slate-200"
            />
          </div>

          {/* Dropdown Filters */}
          <div className="flex flex-wrap gap-2">
            
            {/* Locality Filter */}
            <div className="relative filter-dropdown">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFilter('locality');
                }}
                className={`flex items-center gap-1 px-4 py-2 border rounded-full text-sm font-medium transition-all ${
                  activeFilter === 'locality' 
                    ? 'border-[#f15a24] text-[#f15a24] bg-orange-50' 
                    : 'hover:border-slate-400'
                }`}
              >
                Top Localities 
                {selectedLocalities.length > 0 && (
                  <span className="bg-[#f15a24] text-white text-[10px] px-1.5 rounded-full ml-1">
                    {selectedLocalities.length}
                  </span>
                )}
                <ChevronDown size={16} />
              </button>
              {activeFilter === 'locality' && (
                <div className="absolute top-12 left-0 w-64 bg-white shadow-xl border rounded-lg p-4 z-50 max-h-64 overflow-y-auto">
                  {loadingLocalities ? (
                    <div className="text-center py-4 text-gray-500">Loading...</div>
                  ) : (
                    <div className="grid grid-cols-1 gap-2">
                      {localities.map(loc => (
                        <label key={loc} className="flex items-center gap-2 text-slate-700 cursor-pointer hover:text-[#f15a24]">
                          <input 
                            type="checkbox" 
                            checked={selectedLocalities.includes(loc)}
                            onChange={() => handleLocalityToggle(loc)}
                            className="accent-[#f15a24]" 
                          /> 
                          {loc}
                        </label>
                      ))}
                   </div>
                  )}
                  {selectedLocalities.length > 0 && (
                    <button 
                      onClick={() => {
                        setSelectedLocalities([]);
                        onFilterChange({ selectedLocalities: [] });
                      }} 
                      className="mt-3 text-sm text-red-500 hover:text-red-700"
                    >
                      Clear selection
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Budget Filter (With Min/Max Input) */}
            <div className="relative filter-dropdown">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFilter('budget');
                }}
                className={`flex items-center gap-1 px-4 py-2 border rounded-full text-sm font-medium ${
                  activeFilter === 'budget' ? 'border-[#f15a24] text-[#f15a24]' : ''
                }`}
              >
                Budget 
                {(minBudget || maxBudget) && (
                  <span className="bg-[#f15a24] text-white text-[10px] px-1.5 rounded-full ml-1">1</span>
                )}
                <ChevronDown size={16} />
              </button>
              {activeFilter === 'budget' && (
                <div className="absolute top-12 left-0 w-72 bg-white shadow-xl border rounded-lg p-4 z-50">
                  <p className="text-sm font-bold text-slate-800 mb-3">Budget Range</p>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      placeholder="Min" 
                      value={minBudget}
                      onChange={(e) => setMinBudget(e.target.value)}
                      className="w-full border p-2 rounded text-sm focus:border-[#f15a24] outline-none"
                    />
                    <span className="text-slate-400">to</span>
                    <input 
                      type="number" 
                      placeholder="Max" 
                      value={maxBudget}
                      onChange={(e) => setMaxBudget(e.target.value)}
                      className="w-full border p-2 rounded text-sm focus:border-[#f15a24] outline-none"
                    />
                  </div>
                  {/* Quick budget presets */}
                  <div className="mt-3 flex flex-wrap gap-1">
                    {['5000-10000', '10000-20000', '20000-50000', '50000+'].map(preset => {
                      const [min, max] = preset.split('-').map(v => v.replace('+', ''));
                      return (
                        <button
                          key={preset}
                          onClick={() => {
                            setMinBudget(min);
                            setMaxBudget(max || '999999');
                          }}
                          className="text-xs px-2 py-1 bg-slate-100 rounded hover:bg-slate-200"
                        >
                          {preset}
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <button 
                      onClick={clearBudgetFilter} 
                      className="text-sm text-slate-500 underline"
                    >
                      Clear
                    </button>
                    <button 
                      onClick={applyBudgetFilter} 
                      className="bg-[#f15a24] text-white px-4 py-1.5 rounded-md text-sm"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* BHK Filter */}
            <div className="relative filter-dropdown">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFilter('bhk');
                }}
                className={`flex items-center gap-1 px-4 py-2 border rounded-full text-sm font-medium ${
                  activeFilter === 'bhk' ? 'border-[#f15a24] text-[#f15a24]' : ''
                }`}
              >
                BHK 
                {selectedBHK.length > 0 && (
                  <span className="bg-[#f15a24] text-white text-[10px] px-1.5 rounded-full ml-1">
                    {selectedBHK.length}
                  </span>
                )}
                <ChevronDown size={16} />
              </button>
              {activeFilter === 'bhk' && (
                <div className="absolute top-12 left-0 w-60 bg-white shadow-xl border rounded-lg p-4 z-50">
                  <div className="flex flex-wrap gap-2">
                    {bhkOptions.map(bhk => (
                      <button 
                        key={bhk}
                        onClick={() => handleBHKToggle(bhk)}
                        className={`px-3 py-1 border rounded text-sm transition-all ${
                          selectedBHK.includes(bhk) 
                            ? 'bg-[#f15a24] text-white border-[#f15a24]' 
                            : 'hover:border-[#f15a24] hover:text-[#f15a24]'
                        }`}
                      >
                        {bhk}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Property Type Filter */}
            <div className="relative filter-dropdown">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFilter('propertyType');
                }}
                className={`flex items-center gap-1 px-4 py-2 border rounded-full text-sm font-medium ${
                  activeFilter === 'propertyType' ? 'border-[#f15a24] text-[#f15a24]' : ''
                }`}
              >
                Property Type
                {selectedPropertyTypes.length > 0 && (
                  <span className="bg-[#f15a24] text-white text-[10px] px-1.5 rounded-full ml-1">
                    {selectedPropertyTypes.length}
                  </span>
                )}
                <ChevronDown size={16} />
              </button>
              {activeFilter === 'propertyType' && (
                <div className="absolute top-12 left-0 w-64 bg-white shadow-xl border rounded-lg p-4 z-50">
                  <div className="grid grid-cols-1 gap-2">
                    {propertyTypeOptions.map(type => (
                      <label 
                        key={type} 
                        className="flex items-center gap-2 text-slate-700 cursor-pointer hover:text-[#f15a24]"
                      >
                        <input 
                          type="checkbox"
                          checked={selectedPropertyTypes.includes(type)}
                          onChange={() => handlePropertyTypeToggle(type)}
                          className="accent-[#f15a24]" 
                        />
                        {type}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Search Button (Orange) */}
            <button 
              onClick={handleSearch}
              className="bg-[#f15a24] hover:bg-[#d44d1f] text-white px-6 py-2 rounded-lg font-bold transition-colors"
            >
              Search
            </button>
          </div>
        </div>

        {/* Active Filter Tags */}
        {(selectedLocalities.length > 0 || minBudget || maxBudget || selectedBHK.length > 0 || selectedPropertyTypes.length > 0) && (
          <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-100">
            <span className="text-xs text-slate-500">Active:</span>
            
            {selectedLocalities.map(loc => (
              <span 
                key={loc} 
                className="inline-flex items-center gap-1 px-2 py-1 bg-orange-50 text-[#f15a24] rounded-full text-xs"
              >
                {loc}
                <X 
                  size={12} 
                  className="cursor-pointer" 
                  onClick={() => handleLocalityToggle(loc)}
                />
              </span>
            ))}

            {(minBudget || maxBudget) && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-50 text-[#f15a24] rounded-full text-xs">
                ₹{minBudget || '0'} - ₹{maxBudget || 'Any'}
                <X size={12} className="cursor-pointer" onClick={clearBudgetFilter} />
              </span>
            )}

            {selectedBHK.map(bhk => (
              <span 
                key={bhk} 
                className="inline-flex items-center gap-1 px-2 py-1 bg-orange-50 text-[#f15a24] rounded-full text-xs"
              >
                {bhk}
                <X size={12} className="cursor-pointer" onClick={() => handleBHKToggle(bhk)} />
              </span>
            ))}

            {selectedPropertyTypes.map(type => (
              <span 
                key={type} 
                className="inline-flex items-center gap-1 px-2 py-1 bg-orange-50 text-[#f15a24] rounded-full text-xs"
              >
                {type}
                <X size={12} className="cursor-pointer" onClick={() => handlePropertyTypeToggle(type)} />
              </span>
            ))}

            <button 
              onClick={() => {
                setSelectedLocalities([]);
                setMinBudget('');
                setMaxBudget('');
                setSelectedBHK([]);
                setSelectedPropertyTypes([]);
                onFilterChange({
                  selectedLocalities: [],
                  minBudget: '',
                  maxBudget: '',
                  selectedBHK: [],
                  selectedPropertyTypes: []
                });
              }}
              className="text-xs text-red-500 hover:text-red-700 ml-2"
            >
              Clear All
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterBar;
