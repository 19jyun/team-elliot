import React, { createContext, useContext } from 'react';
import { usePermission } from '../hooks/usePermission';
import { PermissionType } from '../types/Permission';

interface PermissionContextType {
  calendar: ReturnType<typeof usePermission>;
  notifications: ReturnType<typeof usePermission>;
}

const PermissionContext = createContext<PermissionContextType | null>(null);

export function PermissionProvider({ children }: { children: React.ReactNode }) {
  const calendar = usePermission(PermissionType.Calendar);
  const notifications = usePermission(PermissionType.Notifications);

  return (
    <PermissionContext.Provider value={{ calendar, notifications }}>
      {children}
    </PermissionContext.Provider>
  );
}

export function usePermissions() {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }
  return context;
}
