/* eslint-disable @typescript-eslint/no-explicit-any */

import { AdminConfig } from './admin.types';
import {
  Favorite,
  IStorage,
  PendingEmailRegistration,
  PlayRecord,
  SkipConfig,
} from './types';

// Standalone memory/null storage fallback for server-side when running purely on localstorage
class LocalFallbackStorage implements IStorage {
  async getPlayRecord(_userName: string, _key: string): Promise<PlayRecord | null> {
    return null;
  }
  async setPlayRecord(_userName: string, _key: string, _record: PlayRecord): Promise<void> {}
  async getAllPlayRecords(_userName: string): Promise<{ [key: string]: PlayRecord }> {
    return {};
  }
  async deletePlayRecord(_userName: string, _key: string): Promise<void> {}
  async getFavorite(_userName: string, _key: string): Promise<Favorite | null> {
    return null;
  }
  async setFavorite(_userName: string, _key: string, _favorite: Favorite): Promise<void> {}
  async getAllFavorites(_userName: string): Promise<{ [key: string]: Favorite }> {
    return {};
  }
  async deleteFavorite(_userName: string, _key: string): Promise<void> {}
  async registerUser(_userName: string, _password: string, _email?: string | null): Promise<void> {}
  async verifyUser(_userName: string, _password: string): Promise<boolean> {
    return true;
  }
  async checkUserExist(_userName: string): Promise<boolean> {
    return false;
  }
  async getSearchHistory(_userName: string): Promise<string[]> {
    return [];
  }
  async addSearchHistory(_userName: string, _keyword: string): Promise<void> {}
  async deleteSearchHistory(_userName: string, _keyword?: string): Promise<void> {}
  async getAllUsers(): Promise<string[]> {
    return ['luperta_user'];
  }
  async getAdminConfig(): Promise<AdminConfig | null> {
    return null;
  }
  async setAdminConfig(_config: AdminConfig): Promise<void> {}
  async getSkipConfig(_userName: string, _source: string, _id: string): Promise<SkipConfig | null> {
    return null;
  }
  async setSkipConfig(_userName: string, _source: string, _id: string, _config: SkipConfig): Promise<void> {}
  async deleteSkipConfig(_userName: string, _source: string, _id: string): Promise<void> {}
  async getAllSkipConfigs(_userName: string): Promise<{ [key: string]: SkipConfig }> {
    return {};
  }
}

let storageInstance: IStorage | null = null;

export function getStorage(): IStorage {
  if (!storageInstance) {
    storageInstance = new LocalFallbackStorage();
  }
  return storageInstance;
}

export function generateStorageKey(source: string, id: string): string {
  return `${source}+${id}`;
}

export class DbManager {
  private storage: IStorage;

  constructor() {
    this.storage = getStorage();
  }

  async getPlayRecord(userName: string, source: string, id: string): Promise<PlayRecord | null> {
    const key = generateStorageKey(source, id);
    return this.storage.getPlayRecord(userName, key);
  }

  async savePlayRecord(userName: string, source: string, id: string, record: PlayRecord): Promise<void> {
    const key = generateStorageKey(source, id);
    await this.storage.setPlayRecord(userName, key, record);
  }

  async getAllPlayRecords(userName: string): Promise<{ [key: string]: PlayRecord }> {
    return this.storage.getAllPlayRecords(userName);
  }

  async deletePlayRecord(userName: string, source: string, id: string): Promise<void> {
    const key = generateStorageKey(source, id);
    await this.storage.deletePlayRecord(userName, key);
  }

  async getFavorite(userName: string, source: string, id: string): Promise<Favorite | null> {
    const key = generateStorageKey(source, id);
    return this.storage.getFavorite(userName, key);
  }

  async saveFavorite(userName: string, source: string, id: string, favorite: Favorite): Promise<void> {
    const key = generateStorageKey(source, id);
    await this.storage.setFavorite(userName, key, favorite);
  }

  async getAllFavorites(userName: string): Promise<{ [key: string]: Favorite }> {
    return this.storage.getAllFavorites(userName);
  }

  async deleteFavorite(userName: string, source: string, id: string): Promise<void> {
    const key = generateStorageKey(source, id);
    await this.storage.deleteFavorite(userName, key);
  }

  async isFavorited(userName: string, source: string, id: string): Promise<boolean> {
    const favorite = await this.getFavorite(userName, source, id);
    return favorite !== null;
  }

  async registerUser(userName: string, password: string, email?: string | null): Promise<void> {
    await this.storage.registerUser(userName, password, email);
  }

  async verifyUser(userName: string, password: string): Promise<boolean> {
    return this.storage.verifyUser(userName, password);
  }

  async checkEmailExist(_email: string): Promise<boolean> {
    return false;
  }

  async createEmailRegistration(
    _userName: string,
    _email: string,
    _password: string,
    _tokenHash: string,
    _expiresAt: number
  ): Promise<void> {}

  async getEmailRegistrationByTokenHash(_tokenHash: string): Promise<PendingEmailRegistration | null> {
    return null;
  }

  async deleteEmailRegistration(_email: string): Promise<void> {}

  async checkUserExist(userName: string): Promise<boolean> {
    return this.storage.checkUserExist(userName);
  }

  async getSearchHistory(userName: string): Promise<string[]> {
    return this.storage.getSearchHistory(userName);
  }

  async addSearchHistory(userName: string, keyword: string): Promise<void> {
    await this.storage.addSearchHistory(userName, keyword);
  }

  async deleteSearchHistory(userName: string, keyword?: string): Promise<void> {
    await this.storage.deleteSearchHistory(userName, keyword);
  }

  async getAllUsers(): Promise<string[]> {
    return (this.storage as any).getAllUsers();
  }

  async getAdminConfig(): Promise<AdminConfig | null> {
    return (this.storage as any).getAdminConfig();
  }

  async saveAdminConfig(config: AdminConfig): Promise<void> {
    await (this.storage as any).setAdminConfig(config);
  }

  async getSkipConfig(userName: string, source: string, id: string): Promise<SkipConfig | null> {
    return (this.storage as any).getSkipConfig(userName, source, id);
  }

  async setSkipConfig(userName: string, source: string, id: string, config: SkipConfig): Promise<void> {
    await (this.storage as any).setSkipConfig(userName, source, id, config);
  }

  async deleteSkipConfig(userName: string, source: string, id: string): Promise<void> {
    await (this.storage as any).deleteSkipConfig(userName, source, id);
  }

  async getAllSkipConfigs(userName: string): Promise<{ [key: string]: SkipConfig }> {
    return (this.storage as any).getAllSkipConfigs(userName);
  }
}

export const db = new DbManager();
