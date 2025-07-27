// src/preload/index.ts
import { contextBridge } from 'electron';

// Basit API expose et
contextBridge.exposeInMainWorld('api', {
    version: '1.0.0',
    platform: process.platform
});