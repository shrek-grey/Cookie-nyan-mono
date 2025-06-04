// declare const wx: any;
import { sys } from 'cc';


export default class StorageManager {
    static save(key: string, value: any): void {
        sys.localStorage.setItem(key, JSON.stringify(value));
    //   if (typeof wx !== 'undefined') {
    //     try {
    //       wx.setStorageSync(key, JSON.stringify(value));
    //     } catch (e) {
    //       console.error("Storage Save Error:", e);
    //     }
    //   } else {
    //     console.warn('wx not available – not in WeChat Mini Game environment');
    //   }
    }
  
    static load<T = any>(key: string): T | null {
        const data = sys.localStorage.getItem(key);
        if (data) {
            try {
            return JSON.parse(data) as T;
            } catch (e) {
            console.error("Storage Load Error:", e);
            return null;
            }
        }
        return null;
    //   if (typeof wx !== 'undefined') {
    //     try {
    //       const data = wx.getStorageSync(key);
    //       return data ? JSON.parse(data) : null;
    //     } catch (e) {
    //       console.error("Storage Load Error:", e);
    //       return null;
    //     }
    //   }
    //   console.warn('wx not available – not in WeChat Mini Game environment');
    //   return null;
    }
  
    static remove(key: string): void {
        sys.localStorage.removeItem(key);
    //   if (typeof wx !== 'undefined') {
    //     try {
    //       wx.removeStorageSync(key);
    //     } catch (e) {
    //       console.error("Storage Remove Error:", e);
    //     }
    //   }
    }
  
    static clear(): void {
        sys.localStorage.clear();
    //   if (typeof wx !== 'undefined') {
    //     try {
    //       wx.clearStorageSync();
    //     } catch (e) {
    //       console.error("Storage Clear Error:", e);
    //     }
    //   }
    }
  }