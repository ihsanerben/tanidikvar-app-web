"use client";
import {createContext,useContext} from 'react';
import type {CurrentUser} from '@/lib/session';
export type ManagerSession={user:CurrentUser|null;status:'loading'|'ready'|'error';reload:()=>Promise<void>;logout:()=>Promise<void>;setUser:(user:CurrentUser|null)=>void};
export const ManagerSessionContext=createContext<ManagerSession|null>(null);
export function useAuth(){const session=useContext(ManagerSessionContext);if(!session)throw new Error('Manager session provider is required');return session;}
