/* eslint-disable @typescript-eslint/no-explicit-any */

import { AdminConfig } from './admin.types';
import {
  Favorite,
  IStorage,
  PendingEmailRegistration,
  PlayRecord,
  SkipConfig,
} from './types';

// In-memory storage adapter for server-side operations without external database dependencies
class InMemoryStorage implements IStorage {
  private playRecords = new Map<string, Map<string, PlayRecord>>();
  private favorites = new Map<string, Map<string, Favorite>>();
  private searchHistory = new Map<string, string[]>();
  private skipConfigs = new Map<string, Map<string, SkipConfig>>();
  private adminConfig: AdminConfig | null = null;
  private users = new Set<string>(['luperta_user']);
  private emailRegistrations = new Map<string, PendingEmailRegistration>();

  async getPlayRecord(userName: string, key: string): Promise<PlayRecord | null> {
    return this.playRecords.get(userName)?.get(key) || null;
  }

  async setPlayRecord(userName: string, key: string, record: PlayRecord): Promise<void> {
    let userRecords = this.playRecords.get(userName);
    if (!userRecords) {
      userRecords = new Map();
      this.playRecords.set(userName, userRecords);
    }
    userRecords.set(key, record);
  }

  async getAllPlayRecords(userName: string): Promise<{ [key: string]: PlayRecord }> {
    const userRecords = this.playRecords.get(userName);
    if (!userRecords) return {};
    return Object.fromEntries(userRecords);
  }

  async deletePlayRecord(userName: string, key: string): Promise<void> {
    const userRecords = this.playRecords.get(userName);
    if (userRecords) {
      userRecords.delete(key);
    }
  }

  async getFavorite(userName: string, key: string): Promise<Favorite | null> {
    return this.favorites.get(userName)?.get(key) || null;
  }

  async setFavorite(userName: string, key: string, favorite: Favorite): Promise<void> {
    let userFavorites = this.favorites.get(userName);
    if (!userFavorites) {
      userFavorites = new Map();
      this.favorites.set(userName, userFavorites);
    }
    userFavorites.set(key, favorite);
  }

  async getAllFavorites(userName: string): Promise<{ [key: string]: Favorite }> {
    const userFavorites = this.favorites.get(userName);
    if (!userFavorites) return {};
    return Object.fromEntries(userFavorites);
  }

  async deleteFavorite(userName: string, key: string): Promise<void> {
    const userFavorites = this.favorites.get(userName);
    if (userFavorites) {
      userFavorites.delete(key);
    }
  }

  async registerUser(userName: string, _password: string, _email?: string | null): Promise<void> {
    this.users.add(userName);
  }

  async verifyUser(_userName: string, _password: string): Promise<boolean> {
    return true;
  }

  async checkUserExist(userName: string): Promise<boolean> {
    return this.users.has(userName);
  }

  async changePassword(_userName: string, _newPassword: string): Promise<void> {
    // Guest/unauthenticated password change is a valid no-op state
    this.users.add(_userName);
  }

  async deleteUser(userName: string): Promise<void> {
    this.users.delete(userName);
    this.playRecords.delete(userName);
    this.favorites.delete(userName);
    this.searchHistory.delete(userName);
    this.skipConfigs.delete(userName);
  }

  async getSearchHistory(userName: string): Promise<string[]> {
    return this.searchHistory.get(userName) || [];
  }

  async addSearchHistory(userName: string, keyword: string): Promise<void> {
    const history = this.searchHistory.get(userName) || [];
    const filtered = history.filter((k) => k !== keyword);
    filtered.unshift(keyword);
    this.searchHistory.set(userName, filtered.slice(0, 30));
  }

  async deleteSearchHistory(userName: string, keyword?: string): Promise<void> {
    if (!keyword) {
      this.searchHistory.delete(userName);
      return;
    }
    const history = this.searchHistory.get(userName) || [];
    this.searchHistory.set(userName, history.filter((k) => k !== keyword));
  }

  async getAllUsers(): Promise<string[]> {
    return Array.from(this.users);
  }

  async getAdminConfig(): Promise<AdminConfig | null> {
    return this.adminConfig;
  }

  async setAdminConfig(config: AdminConfig): Promise<void> {
    this.adminConfig = config;
  }

  async getSkipConfig(userName: string, source: string, id: string): Promise<SkipConfig | null> {
    return this.skipConfigs.get(userName)?.get(`${source}+${id}`) || null;
  }

  async setSkipConfig(userName: string, source: string, id: string, config: SkipConfig): Promise<void> {
    let userConfigs = this.skipConfigs.get(userName);
    if (!userConfigs) {
      userConfigs = new Map();
      this.skipConfigs.set(userName, userConfigs);
    }
    userConfigs.set(`${source}+${id}`, config);
  }

  async deleteSkipConfig(userName: string, source: string, id: string): Promise<void> {
    const userConfigs = this.skipConfigs.get(userName);
    if (userConfigs) {
      userConfigs.delete(`${source}+${id}`);
    }
  }

  async getAllSkipConfigs(userName: string): Promise<{ [key: string]: SkipConfig }> {
    const userConfigs = this.skipConfigs.get(userName);
    if (!userConfigs) return {};
    return Object.fromEntries(userConfigs);
  }

  async checkEmailExist(email: string): Promise<boolean> {
    for (const reg of Array.from(this.emailRegistrations.values())) {
      if (reg.email === email) return true;
    }
    return false;
  }

  async createEmailRegistration(
    userName: string,
    email: string,
    password: string,
    tokenHash: string,
    expiresAt: number
  ): Promise<void> {
    this.emailRegistrations.set(tokenHash, {
      username: userName,
      email,
      password,
      token_hash: tokenHash,
      expires_at: expiresAt,
      created_at: Date.now(),
    });
  }

  async getEmailRegistrationByTokenHash(tokenHash: string): Promise<PendingEmailRegistration | null> {
    return this.emailRegistrations.get(tokenHash) || null;
  }

  async deleteEmailRegistration(email: string): Promise<void> {
    for (const [hash, reg] of Array.from(this.emailRegistrations.entries())) {
      if (reg.email === email) {
        this.emailRegistrations.delete(hash);
      }
    }
  }
}

let storageInstance: IStorage | null = null;

export function getStorage(): IStorage {
  if (!storageInstance) {
    storageInstance = new InMemoryStorage();
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

  async checkEmailExist(email: string): Promise<boolean> {
    if (typeof this.storage.checkEmailExist === 'function') {
      return this.storage.checkEmailExist(email);
    }
    return false;
  }

  async createEmailRegistration(
    userName: string,
    email: string,
    password: string,
    tokenHash: string,
    expiresAt: number
  ): Promise<void> {
    if (typeof this.storage.createEmailRegistration === 'function') {
      await this.storage.createEmailRegistration(
        userName,
        email,
        password,
        tokenHash,
        expiresAt
      );
    }
  }

  async getEmailRegistrationByTokenHash(tokenHash: string): Promise<PendingEmailRegistration | null> {
    if (typeof this.storage.getEmailRegistrationByTokenHash === 'function') {
      return this.storage.getEmailRegistrationByTokenHash(tokenHash);
    }
    return null;
  }

  async deleteEmailRegistration(email: string): Promise<void> {
    if (typeof this.storage.deleteEmailRegistration === 'function') {
      await this.storage.deleteEmailRegistration(email);
    }
  }

  async checkUserExist(userName: string): Promise<boolean> {
    return this.storage.checkUserExist(userName);
  }

  async changePassword(userName: string, newPassword: string): Promise<void> {
    await this.storage.changePassword(userName, newPassword);
  }

  async deleteUser(userName: string): Promise<void> {
    await this.storage.deleteUser(userName);
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
