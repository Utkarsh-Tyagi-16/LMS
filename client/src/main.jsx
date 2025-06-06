import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Provider } from 'react-redux'
import { appStore } from './app/store'
import { Toaster } from './components/ui/sonner'
import { useLoadUserQuery } from './features/api/authApi'
import LoadingSpinner from "./components/LoadingSpinner";

const Custom = ({ children }) => {
  // Skip the query if there's no token in cookies
  const { isLoading, isError } = useLoadUserQuery(undefined, {
    skip: !document.cookie.includes('token=')
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Don't show error for unauthorized state
  if (isError && !isError.status === 401) {
    return <div>Error loading user data. Please try again.</div>;
  }

  return <>{children}</>;
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={appStore}>
      <Custom>
        <App />
        <Toaster />
      </Custom>
    </Provider>
  </StrictMode>,
)
