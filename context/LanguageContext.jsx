import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STRINGS } from '../constants/strings';

const LANG_KEY = 'bd_lang';

const LanguageContext = createContext({
  lang: 'gu',
  t: STRINGS.gu,
  setLang: async () => {},
  isFirstLaunch: false,
});

export function LanguageProvider({ children }) {
  const [lang,           setLangState]    = useState('gu');
  const [isFirstLaunch,  setFirstLaunch]  = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(LANG_KEY).then(v => {
      if (!v) setFirstLaunch(true);
      else    setLangState(v);
    });
  }, []);

  const setLang = async (l) => {
    await AsyncStorage.setItem(LANG_KEY, l);
    setLangState(l);
    setFirstLaunch(false);
  };

  return (
    <LanguageContext.Provider value={{ lang, t: STRINGS[lang], setLang, isFirstLaunch }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLang = () => useContext(LanguageContext);