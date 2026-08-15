import React, { createContext, useContext, useEffect, useState } from 'react';

const RouterContext = createContext(null);
export const useRouter = () => useContext(RouterContext);

function parse() {
  const h = window.location.hash.replace(/^#\/?/, '');
  const [path, query] = h.split('?');
  const params = {};
  if (query) {
    new URLSearchParams(query).forEach((v, k) => { params[k] = v; });
  }
  return { path: path || 'landing', params };
}

export function RouterProvider({ children }) {
  const [route, setRoute] = useState(parse());

  useEffect(() => {
    const onHash = () => { setRoute(parse()); window.scrollTo({ top: 0 }); };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const navigate = (path) => {
    window.location.hash = '/' + path;
  };

  return (
    <RouterContext.Provider value={{ ...route, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}
