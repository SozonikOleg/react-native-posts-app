import React from 'react';
import { ScrollNewsUiStore } from './scrollNewsUiStore';

export class RootStore {
  scrollNewsUi = new ScrollNewsUiStore();
}

const RootStoreContext = React.createContext(null);

export function RootStoreProvider(props: any) {
  const { children } = props;
  const [store] = React.useState(() => props.store ?? new RootStore());
  return React.createElement(
    RootStoreContext.Provider,
    { value: store },
    children,
  );
}

export function useRootStore() {
  const store = React.useContext(RootStoreContext);
  if (!store) {
    throw new Error('RootStoreProvider is missing in the component tree');
  }
  return store as RootStore;
}

