import { createContext, useContext, useState } from 'react';

const RefreshContext = createContext();

export function RefreshProvider({ children }) {
  const [fileRefreshFlag, setFileRefreshFlag] = useState(false);

  const toggleRefresh = () => {
    setFileRefreshFlag(prev => !prev);
  };

  return (
    <RefreshContext.Provider value={{ fileRefreshFlag, toggleRefresh }}>
      {children}
    </RefreshContext.Provider>
  );
}

export function useRefresh() {
  return useContext(RefreshContext);
}