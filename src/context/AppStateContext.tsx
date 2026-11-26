'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  INITIAL_DEMO_MATCHES,
  INITIAL_DEMO_REQUESTS,
  INITIAL_DEMO_USERS,
} from '@/data/demo-seed';
import { computeHeroBadge, evaluateCooldown } from '@/lib/cooldown';
import {
  calculateExtendedExpiryDate,
  calculateInitialExpiryDate,
  getEffectiveRequestStatus,
} from '@/lib/request-lifecycle';
import { normalizeBangladeshMobile } from '@/lib/validation';
import type {
  BloodGroupCode,
  BloodRequestItem,
  EmergencyMatchRecord,
  LocationSelection,
  RequestStatus,
  UrgencyLevel,
  UserProfile,
} from '@/types';

interface AppStateContextValue {
  users: UserProfile[];
  currentUser: UserProfile | null;
  requests: BloodRequestItem[];
  matches: EmergencyMatchRecord[];
  confirmedDonorIdsForCurrentUser: Set<string>;
  signInWithUser: (userId: string) => void;
  loginWithPassword: (mobileNumber: string, password: string) => { ok: boolean; error?: 'INVALID_CREDENTIALS' };
  registerWithPassword: (payload: {
    mobileNumber: string;
    password: string;
    fullName: string;
    bloodGroup: BloodGroupCode;
    location: LocationSelection;
  }) => { ok: boolean; user?: UserProfile; error?: 'ALREADY_EXISTS' };
  signOut: () => void;
  updateCurrentUserProfile: (patch: {
    fullName?: string;
    whatsappNumber?: string;
    bloodGroup?: BloodGroupCode;
    location?: LocationSelection;
    manualAvailable?: boolean;
    hidePhoneNumber?: boolean;
  }) => void;
  logExternalDonation: (donatedAtIso: string, hospitalOrCenter?: string) => void;
  createBloodRequest: (payload: {
    patientName: string;
    bloodGroupNeeded: BloodGroupCode;
    unitsRequired: number;
    urgencyLevel: UrgencyLevel;
    hospitalName: string;
    wardCabinBed: string;
    divisionId: string;
    districtId: string;
    upazilaId: string;
    postOfficeId?: string;
    villageOrArea?: string;
    contactPersonName: string;
    primaryMobile: string;
    alternateMobile?: string;
    medicalReason: string;
  }) => BloodRequestItem;
  updateRequestStatus: (requestId: string, status: RequestStatus) => void;
  extendRequestExpiry: (requestId: string) => void;
  createOrConfirmEmergencyMatch: (requestId: string, donorId: string, autoConfirm?: boolean) => void;
  confirmMatch: (matchId: string) => void;
  completeMatchDonation: (matchId: string) => void;
}

const AppStateContext = createContext<AppStateContextValue | undefined>(undefined);
const STORAGE_KEY = 'roktobondhu_bd_state_v2';

interface PersistedShape {
  users: UserProfile[];
  credentials: Record<string, string>;
  currentUserId: string | null;
  requests: BloodRequestItem[];
  matches: EmergencyMatchRecord[];
}

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<UserProfile[]>(INITIAL_DEMO_USERS);
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [requests, setRequests] = useState<BloodRequestItem[]>(INITIAL_DEMO_REQUESTS);
  const [matches, setMatches] = useState<EmergencyMatchRecord[]>(INITIAL_DEMO_MATCHES);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as PersistedShape;
        if (Array.isArray(parsed.users) && parsed.users.length > 0) {
          setUsers(parsed.users);
          setCredentials(parsed.credentials ?? {});
          setCurrentUserId(parsed.currentUserId);
          setRequests(parsed.requests ?? INITIAL_DEMO_REQUESTS);
          setMatches(parsed.matches ?? INITIAL_DEMO_MATCHES);
        }
      }
    } catch {
      // Fallback cleanly to demo seed
    }
  }, []);

  useEffect(() => {
    try {
      const payload: PersistedShape = { users, credentials, currentUserId, requests, matches };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore storage quota issues
    }
  }, [users, credentials, currentUserId, requests, matches]);

  const normalizedUsers = useMemo(
    () =>
      users.map((u) => {
        const cooldown = evaluateCooldown(u.lastDonationDate, u.manualAvailable);
        return {
          ...u,
          availabilityStatus: cooldown.effectiveStatus,
          heroBadge: computeHeroBadge(u.totalDonations),
        };
      }),
    [users]
  );

  const normalizedRequests = useMemo(
    () =>
      requests.map((r) => {
        const status = getEffectiveRequestStatus(r);
        return {
          ...r,
          status,
          isActive: status === 'ACTIVE' || status === 'IN_PROGRESS',
        };
      }),
    [requests]
  );

  const currentUser = useMemo(
    () => normalizedUsers.find((u) => u.id === currentUserId) ?? null,
    [normalizedUsers, currentUserId]
  );

  const confirmedDonorIdsForCurrentUser = useMemo(() => {
    if (!currentUser) return new Set<string>();
    const myRequestIds = new Set(
      normalizedRequests.filter((r) => r.requesterId === currentUser.id).map((r) => r.id)
    );
    const ids = new Set<string>();
    for (const m of matches) {
      if (m.phoneRevealed && (myRequestIds.has(m.requestId) || m.donorId === currentUser.id)) {
        ids.add(m.donorId);
      }
    }
    return ids;
  }, [currentUser, matches, normalizedRequests]);

  const signInWithUser = (userId: string) => {
    setCurrentUserId(userId);
  };

  const loginWithPassword = (
    mobileNumber: string,
    password: string
  ): { ok: boolean; error?: 'INVALID_CREDENTIALS' } => {
    const mobile = normalizeBangladeshMobile(mobileNumber);
    const existing = normalizedUsers.find((u) => u.mobileNumber === mobile);
    if (!existing) {
      return { ok: false, error: 'INVALID_CREDENTIALS' };
    }

    const savedPassword = credentials[mobile];
    if (!savedPassword || savedPassword !== password) {
      return { ok: false, error: 'INVALID_CREDENTIALS' };
    }

    setUsers((prev) =>
      prev.map((u) =>
        u.id === existing.id ? { ...u, lastActiveAt: new Date().toISOString() } : u
      )
    );
    setCurrentUserId(existing.id);
    return { ok: true };
  };

  const registerWithPassword = (payload: {
    mobileNumber: string;
    password: string;
    fullName: string;
    bloodGroup: BloodGroupCode;
    location: LocationSelection;
  }): { ok: boolean; user?: UserProfile; error?: 'ALREADY_EXISTS' } => {
    const mobile = normalizeBangladeshMobile(payload.mobileNumber);
    if (normalizedUsers.some((u) => u.mobileNumber === mobile)) {
      return { ok: false, error: 'ALREADY_EXISTS' };
    }

    const nowIso = new Date().toISOString();
    const created: UserProfile = {
      id: `usr-${Date.now()}`,
      fullName: payload.fullName.trim(),
      mobileNumber: mobile,
      isMobileVerified: true,
      whatsappNumber: mobile,
      bloodGroup: payload.bloodGroup,
      divisionId: payload.location.divisionId,
      districtId: payload.location.districtId,
      upazilaId: payload.location.upazilaId,
      postOfficeId: payload.location.postOfficeId,
      villageId: payload.location.villageId,
      manualAvailable: true,
      availabilityStatus: 'AVAILABLE',
      lastDonationDate: null,
      hidePhoneNumber: false,
      totalDonations: 0,
      heroBadge: 'NONE',
      lastActiveAt: nowIso,
      createdAt: nowIso,
    };

    setCredentials((prev) => ({ ...prev, [mobile]: payload.password }));
    setUsers((prev) => [created, ...prev]);
    setCurrentUserId(created.id);
    return { ok: true, user: created };
  };

  const signOut = () => {
    setCurrentUserId(null);
  };

  const updateCurrentUserProfile = (patch: {
    fullName?: string;
    whatsappNumber?: string;
    bloodGroup?: BloodGroupCode;
    location?: LocationSelection;
    manualAvailable?: boolean;
    hidePhoneNumber?: boolean;
  }) => {
    if (!currentUserId) return;
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== currentUserId) return u;
        const nextManual =
          typeof patch.manualAvailable === 'boolean' ? patch.manualAvailable : u.manualAvailable;
        const cooldown = evaluateCooldown(u.lastDonationDate, nextManual);
        return {
          ...u,
          fullName: patch.fullName?.trim() || u.fullName,
          whatsappNumber:
            patch.whatsappNumber !== undefined ? patch.whatsappNumber.trim() : u.whatsappNumber,
          bloodGroup: patch.bloodGroup ?? u.bloodGroup,
          divisionId: patch.location?.divisionId || u.divisionId,
          districtId: patch.location?.districtId || u.districtId,
          upazilaId: patch.location?.upazilaId || u.upazilaId,
          postOfficeId: patch.location?.postOfficeId || u.postOfficeId,
          villageId: patch.location?.villageId || u.villageId,
          manualAvailable: nextManual,
          availabilityStatus: cooldown.effectiveStatus,
          hidePhoneNumber:
            typeof patch.hidePhoneNumber === 'boolean'
              ? patch.hidePhoneNumber
              : u.hidePhoneNumber,
          lastActiveAt: new Date().toISOString(),
        };
      })
    );
  };

  const logExternalDonation = (donatedAtIso: string) => {
    if (!currentUserId) return;
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== currentUserId) return u;
        const donatedMs = new Date(donatedAtIso).getTime();
        const existingMs = u.lastDonationDate ? new Date(u.lastDonationDate).getTime() : 0;
        const latestDonationDate =
          donatedMs >= existingMs ? new Date(donatedAtIso).toISOString() : u.lastDonationDate;
        const nextTotal = u.totalDonations + 1;
        const cooldown = evaluateCooldown(latestDonationDate, u.manualAvailable);
        return {
          ...u,
          lastDonationDate: latestDonationDate,
          availabilityStatus: cooldown.effectiveStatus,
          totalDonations: nextTotal,
          heroBadge: computeHeroBadge(nextTotal),
          lastActiveAt: new Date().toISOString(),
        };
      })
    );
  };

  const createBloodRequest: AppStateContextValue['createBloodRequest'] = (payload) => {
    const nowDate = new Date();
    const nowIso = nowDate.toISOString();
    const created: BloodRequestItem = {
      id: `req-${Date.now()}`,
      requesterId: currentUserId ?? 'usr-guest',
      patientName: payload.patientName.trim(),
      bloodGroupNeeded: payload.bloodGroupNeeded,
      unitsRequired: payload.unitsRequired,
      unitsFulfilled: 0,
      urgencyLevel: payload.urgencyLevel,
      hospitalName: payload.hospitalName.trim(),
      wardCabinBed: payload.wardCabinBed.trim(),
      divisionId: payload.divisionId,
      districtId: payload.districtId,
      upazilaId: payload.upazilaId,
      postOfficeId: payload.postOfficeId || null,
      villageOrArea: payload.villageOrArea?.trim() || null,
      contactPersonName: payload.contactPersonName.trim(),
      primaryMobile: normalizeBangladeshMobile(payload.primaryMobile),
      alternateMobile: payload.alternateMobile?.trim()
        ? normalizeBangladeshMobile(payload.alternateMobile)
        : null,
      medicalReason: payload.medicalReason.trim(),
      status: 'ACTIVE',
      isActive: true,
      expiresAt: calculateInitialExpiryDate(nowDate).toISOString(),
      extensionCount: 0,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    setRequests((prev) => [created, ...prev]);
    return created;
  };

  const updateRequestStatus = (requestId: string, status: RequestStatus) => {
    const nowIso = new Date().toISOString();
    setRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status,
              isActive: status === 'ACTIVE' || status === 'IN_PROGRESS',
              updatedAt: nowIso,
            }
          : r
      )
    );
  };

  const extendRequestExpiry = (requestId: string) => {
    const nowDate = new Date();
    const nextExpiry = calculateExtendedExpiryDate(nowDate).toISOString();
    setRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              expiresAt: nextExpiry,
              status: getEffectiveRequestStatus(r) === 'EXPIRED' ? 'ACTIVE' : r.status,
              isActive: true,
              extensionCount: r.extensionCount + 1,
              updatedAt: nowDate.toISOString(),
            }
          : r
      )
    );
  };

  const createOrConfirmEmergencyMatch = (
    requestId: string,
    donorId: string,
    autoConfirm = false
  ) => {
    const nowIso = new Date().toISOString();
    setMatches((prev) => {
      const existing = prev.find((m) => m.requestId === requestId && m.donorId === donorId);
      if (existing) {
        if (!autoConfirm) return prev;
        return prev.map((m) =>
          m.id === existing.id
            ? { ...m, status: 'CONFIRMED', phoneRevealed: true, confirmedAt: nowIso }
            : m
        );
      }
      const nextMatch: EmergencyMatchRecord = {
        id: `match-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        requestId,
        donorId,
        status: autoConfirm ? 'CONFIRMED' : 'PENDING',
        phoneRevealed: autoConfirm,
        confirmedAt: autoConfirm ? nowIso : null,
        createdAt: nowIso,
      };
      return [nextMatch, ...prev];
    });
  };

  const confirmMatch = (matchId: string) => {
    const nowIso = new Date().toISOString();
    const target = matches.find((m) => m.id === matchId);
    setMatches((prev) =>
      prev.map((m) =>
        m.id === matchId
          ? { ...m, status: 'CONFIRMED', phoneRevealed: true, confirmedAt: nowIso }
          : m
      )
    );
    if (target) {
      updateRequestStatus(target.requestId, 'IN_PROGRESS');
    }
  };

  const completeMatchDonation = (matchId: string) => {
    const target = matches.find((m) => m.id === matchId);
    if (!target) return;
    const nowIso = new Date().toISOString();

    setMatches((prev) =>
      prev.map((m) =>
        m.id === matchId
          ? { ...m, status: 'COMPLETED', completedAt: nowIso, phoneRevealed: true }
          : m
      )
    );

    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== target.donorId) return u;
        const nextTotal = u.totalDonations + 1;
        const cooldown = evaluateCooldown(nowIso, u.manualAvailable);
        return {
          ...u,
          lastDonationDate: nowIso,
          availabilityStatus: cooldown.effectiveStatus,
          totalDonations: nextTotal,
          heroBadge: computeHeroBadge(nextTotal),
          lastActiveAt: nowIso,
        };
      })
    );

    setRequests((prev) =>
      prev.map((r) => {
        if (r.id !== target.requestId) return r;
        const nextFulfilled = r.unitsFulfilled + 1;
        const done = nextFulfilled >= r.unitsRequired;
        return {
          ...r,
          unitsFulfilled: nextFulfilled,
          status: done ? 'FULFILLED' : 'IN_PROGRESS',
          isActive: !done,
          updatedAt: nowIso,
        };
      })
    );
  };

  return (
    <AppStateContext.Provider
      value={{
        users: normalizedUsers,
        currentUser,
        requests: normalizedRequests,
        matches,
        confirmedDonorIdsForCurrentUser,
        signInWithUser,
        loginWithPassword,
        registerWithPassword,
        signOut,
        updateCurrentUserProfile,
        logExternalDonation,
        createBloodRequest,
        updateRequestStatus,
        extendRequestExpiry,
        createOrConfirmEmergencyMatch,
        confirmMatch,
        completeMatchDonation,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState(): AppStateContextValue {
  const ctx = useContext(AppStateContext);
  if (!ctx) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return ctx;
}
