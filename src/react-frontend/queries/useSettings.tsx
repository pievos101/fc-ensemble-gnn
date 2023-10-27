import React, { useState } from "react";

type TSettings = {
  testSetUnlocked: boolean,
  client: "local" | "global",
}

export function useSettingsConstructor() {
  const [settings, _setSettings] = useState<TSettings>({
    testSetUnlocked: false,
    client: "local"
  });

  const [weights, setWeights] = useState<number[]>([]);

  const setSettings = (value: Partial<TSettings>) => {
    _setSettings(prev => ({ ...prev, ...value }));
  };

  return {
    settings,
    setSettings,
    weights,
    initializeWeights: (n: number) => {
      setWeights(new Array(n).fill(1));
    },
    setWeight: (index: number, value: number) => {
      setWeights(prev => {
        if (prev.length < index) {
          return prev;
        }
        const newWeights = [...prev];
        newWeights[index] = value;
        return newWeights;
      });
    }
  };
}

// create a context and a provider for the context
export const SettingsContext = React.createContext({
  settings: {
    testSetUnlocked: false,
    client: "local"
  } as TSettings,
  setSettings: (value: Partial<TSettings>) => {
  },
  weights: [] as number[],
  initializeWeights: (n: number) => {
  },
  setWeight: (index: number, value: number) => {
  }
});

export function useSettings() {
  return React.useContext(SettingsContext);
}
