import React from 'react';
import type { Module } from 'esp-js-ui';

export const EspModulesContext = React.createContext<ReadonlyArray<Module>>([]);
