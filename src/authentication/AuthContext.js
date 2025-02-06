import { createContext, useContext, useReducer, useEffect } from "react";
import {jwtDecode} from "jwt-decode";

// Create AuthContext
const AuthContext = createContext();

const initialState = {
  isAuthenticated: false,
  user: null,
  token: null,
  isLoading: true,
};

// Token validation helper
const validateToken = (token) => {
  try {
    const decodedToken = jwtDecode(token);
    if (decodedToken.exp * 1000 < Date.now()) {
      console.error("Token is expired.");
      return null;
    }
    return decodedToken;
  } catch (error) {
    console.error("Invalid token:", error.message);
    return null;
  }
};

// Reducer function
const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN":
      try {
        const decodedToken = jwtDecode(action.payload.token);
        localStorage.setItem("token", action.payload.token);
        return {
          ...state,
          isAuthenticated: true,
          token: action.payload.token,
          user: decodedToken,
          isLoading: false,
        };
      } catch (error) {
        console.error("Error decoding token in reducer:", error.message);
        return state;
      }
    case "LOGOUT":
      localStorage.removeItem("token");
      return {
        ...state,
        isAuthenticated: false,
        token: null,
        user: null,
        isLoading: false,
      };
    case "SET_LOADING":
      return { ...state, isLoading: true };
    case "FINISH_LOADING":
      return { ...state, isLoading: false };
    default:
      return state;
  }
};

// AuthProvider component
const AuthProvider = ({ children }) => {
  const [authState, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const tokenFromStorage = localStorage.getItem("token");

    if (tokenFromStorage) {
      const decodedToken = validateToken(tokenFromStorage);
      if (decodedToken) {
        dispatch({ type: "LOGIN", payload: { token: tokenFromStorage } });
      } else {
        dispatch({ type: "LOGOUT" });
      }
    } else {
      dispatch({ type: "FINISH_LOADING" });
    }
  }, []);

  const login = async (token) => {
    try {
      if (typeof token !== "string" || !token) {
        throw new Error("Invalid token type: Must be a string");
      }
  
      const decodedToken = jwtDecode(token);
      console.log("Decoded token:", decodedToken);
  
      if (decodedToken.exp * 1000 < Date.now()) {
        console.error("Token has expired");
        return;
      }
  
      dispatch({ type: "LOGIN", payload: { token } });
    } catch (error) {
      console.error("Invalid token:", error.message);
    }
  };
  

  return (
    <AuthContext.Provider value={{ authState, login, dispatch }}>
      {!authState.isLoading && children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export { AuthProvider, useAuth };
