import { useState, useEffect, useCallback, useRef } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const useSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState({
    markets: [],
    products: [],
    users: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [filters, setFilters] = useState({
    category: '',
    location: '',
    priceRange: { min: 0, max: 1000 },
    rating: 0,
    sortBy: 'relevance',
    sortOrder: 'desc',
  });

  const debounceTimerRef = useRef(null);

  // Load search history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('search_history');
    const savedRecent = localStorage.getItem('recent_searches');
    
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
    if (savedRecent) {
      setRecentSearches(JSON.parse(savedRecent));
    }
  }, []);

  // Debounced search function
  const debouncedSearch = useCallback((term, searchFilters = {}) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      if (term.trim()) {
        performSearch(term, searchFilters);
      } else {
        setSearchResults({ markets: [], products: [], users: [] });
      }
    }, 300);
  }, []);

  // Perform the actual search
  const performSearch = useCallback(async (term, searchFilters = {}) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        q: term,
        ...filters,
        ...searchFilters,
      });

      const response = await fetch(`${API_BASE_URL}/search?${params}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.data);
        
        // Add to search history
        addToSearchHistory(term);
      } else {
        throw new Error('Search failed');
      }
    } catch (err) {
      setError(err.message);
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Search markets specifically
  const searchMarkets = useCallback(async (term, searchFilters = {}) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        search: term,
        ...filters,
        ...searchFilters,
      });

      const response = await fetch(`${API_BASE_URL}/markets?${params}`);

      if (response.ok) {
        const data = await response.json();
        setSearchResults(prev => ({
          ...prev,
          markets: data.data,
        }));
        return data.data;
      } else {
        throw new Error('Market search failed');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Search products specifically
  const searchProducts = useCallback(async (term, searchFilters = {}) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        search: term,
        ...filters,
        ...searchFilters,
      });

      const response = await fetch(`${API_BASE_URL}/products?${params}`);

      if (response.ok) {
        const data = await response.json();
        setSearchResults(prev => ({
          ...prev,
          products: data.data,
        }));
        return data.data;
      } else {
        throw new Error('Product search failed');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Get search suggestions
  const getSearchSuggestions = useCallback(async (term) => {
    if (!term || term.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const params = new URLSearchParams({ q: term, limit: 10 });
      const response = await fetch(`${API_BASE_URL}/search/suggestions?${params}`);

      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.data);
      } else {
        setSuggestions([]);
      }
    } catch (err) {
      console.error('Error fetching suggestions:', err);
      setSuggestions([]);
    }
  }, []);

  // Add to search history
  const addToSearchHistory = useCallback((term) => {
    const newHistory = [term, ...searchHistory.filter(item => item !== term)].slice(0, 20);
    setSearchHistory(newHistory);
    localStorage.setItem('search_history', JSON.stringify(newHistory));

    // Also update recent searches with timestamp
    const newRecent = [
      { term, timestamp: Date.now() },
      ...recentSearches.filter(item => item.term !== term)
    ].slice(0, 10);
    setRecentSearches(newRecent);
    localStorage.setItem('recent_searches', JSON.stringify(newRecent));
  }, [searchHistory, recentSearches]);

  // Clear search history
  const clearSearchHistory = useCallback(() => {
    setSearchHistory([]);
    setRecentSearches([]);
    localStorage.removeItem('search_history');
    localStorage.removeItem('recent_searches');
  }, []);

  // Remove from search history
  const removeFromSearchHistory = useCallback((term) => {
    const newHistory = searchHistory.filter(item => item !== term);
    setSearchHistory(newHistory);
    localStorage.setItem('search_history', JSON.stringify(newHistory));

    const newRecent = recentSearches.filter(item => item.term !== term);
    setRecentSearches(newRecent);
    localStorage.setItem('recent_searches', JSON.stringify(newRecent));
  }, [searchHistory, recentSearches]);

  // Update filters
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters({
      category: '',
      location: '',
      priceRange: { min: 0, max: 1000 },
      rating: 0,
      sortBy: 'relevance',
      sortOrder: 'desc',
    });
  }, []);

  // Clear search results
  const clearSearchResults = useCallback(() => {
    setSearchResults({ markets: [], products: [], users: [] });
    setSearchTerm('');
  }, []);

  // Search by location
  const searchByLocation = useCallback(async (latitude, longitude, radius = 10) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        lat: latitude,
        lng: longitude,
        radius,
        ...filters,
      });

      const response = await fetch(`${API_BASE_URL}/search/location?${params}`);

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.data);
        return data.data;
      } else {
        throw new Error('Location search failed');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Search with voice (requires Web Speech API)
  const searchWithVoice = useCallback(() => {
    if (!window.webkitSpeechRecognition && !window.SpeechRecognition) {
      setError('Voice search not supported in this browser');
      return;
    }

    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setLoading(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSearchTerm(transcript);
      debouncedSearch(transcript);
    };

    recognition.onerror = (event) => {
      setError(`Voice search error: ${event.error}`);
    };

    recognition.onend = () => {
      setLoading(false);
    };

    recognition.start();
  }, [debouncedSearch]);

  // Get popular searches
  const getPopularSearches = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/search/popular`);

      if (response.ok) {
        const data = await response.json();
        return data.data;
      } else {
        throw new Error('Failed to fetch popular searches');
      }
    } catch (err) {
      console.error('Error fetching popular searches:', err);
      return [];
    }
  }, []);

  // Handle search term change
  const handleSearchTermChange = useCallback((term) => {
    setSearchTerm(term);
    getSearchSuggestions(term);
    debouncedSearch(term);
  }, [debouncedSearch, getSearchSuggestions]);

  // Get total results count
  const getTotalResults = useCallback(() => {
    return searchResults.markets.length + searchResults.products.length + searchResults.users.length;
  }, [searchResults]);

  // Cleanup debounce timer
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    searchTerm,
    searchResults,
    loading,
    error,
    searchHistory,
    suggestions,
    recentSearches,
    filters,
    setSearchTerm: handleSearchTermChange,
    performSearch,
    searchMarkets,
    searchProducts,
    getSearchSuggestions,
    addToSearchHistory,
    clearSearchHistory,
    removeFromSearchHistory,
    updateFilters,
    resetFilters,
    clearSearchResults,
    searchByLocation,
    searchWithVoice,
    getPopularSearches,
    getTotalResults,
  };
};

export default useSearch;
