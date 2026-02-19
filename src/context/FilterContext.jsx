import { createContext, useContext, useState } from "react";

const FilterContext = createContext();

export function FilterProvider({ children }) {
  const [sortBy, setSortBy] = useState("featured");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [highlightedProducts, setHighlightedProducts] = useState([]);

  const resetFilters = () => {
    setSortBy("featured");
    setSelectedCategory("All");
    setSearchQuery("");
    setPriceRange([0, 500]);
    setHighlightedProducts([]);
  };

  return (
    <FilterContext.Provider
      value={{
        sortBy,
        setSortBy,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        priceRange,
        setPriceRange,
        highlightedProducts,
        setHighlightedProducts,
        resetFilters,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
}

export function useFilter() {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error("useFilter must be used within a FilterProvider");
  }
  return context;
}
