"use client";
import { createContext, useContext, useReducer, useEffect } from "react";

const WishlistContext = createContext();

// Wishlist reducer to manage state
function wishlistReducer(state, action) {
  switch (action.type) {
    case "SET_WISHLIST":
      return action.payload;
    case "ADD_TO_WISHLIST":
      const isAlreadyInWishlist = state.some(item => item.id === action.payload.id);
      if (isAlreadyInWishlist) return state;
      return [...state, action.payload];
    case "REMOVE_FROM_WISHLIST":
      return state.filter(item => item.id !== action.payload);
    case "CLEAR_WISHLIST":
      return [];
    default:
      return state;
  }
}

export function WishlistProvider({ children }) {
  const [wishlist, dispatch] = useReducer(wishlistReducer, []);

  // Load wishlist from localStorage on mount
  useEffect(() => {
    const savedWishlist = localStorage.getItem("wishlist");
    if (savedWishlist) {
      try {
        dispatch({ type: "SET_WISHLIST", payload: JSON.parse(savedWishlist) });
      } catch (error) {
        console.error("Error loading wishlist:", error);
      }
    }
  }, []);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  const addToWishlist = (product) => {
    dispatch({ type: "ADD_TO_WISHLIST", payload: product });
  };

  const removeFromWishlist = (productId) => {
    dispatch({ type: "REMOVE_FROM_WISHLIST", payload: productId });
  };

  const clearWishlist = () => {
    dispatch({ type: "CLEAR_WISHLIST" });
  };

  const isInWishlist = (productId) => {
    return wishlist.some(item => item.id === productId);
  };

  const getWishlistCount = () => {
    return wishlist.length;
  };

  return (
    <WishlistContext.Provider value={{
      wishlist,
      addToWishlist,
      removeFromWishlist,
      clearWishlist,
      isInWishlist,
      getWishlistCount
    }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}