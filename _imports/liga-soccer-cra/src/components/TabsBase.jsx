import React, { createContext, useContext } from 'react';

const TabsContext = createContext(null);

export const Tabs = ({ value, className, children }) => {
  return (
    <TabsContext.Provider value={value}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
};

export const TabsList = ({ className, children }) => {
  return <div className={className}>{children}</div>;
};

export const TabPanel = ({ value, className, children }) => {
  const active = useContext(TabsContext);
  if (active !== value) return null;
  return <div className={className}>{children}</div>;
};

export default { Tabs, TabsList, TabPanel };
