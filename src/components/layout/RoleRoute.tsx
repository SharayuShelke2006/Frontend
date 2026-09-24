import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useStore } from '@/state/store';
import type { Role } from '@/types/contract';

export const ROLE_HOME: Record<Role, string> = {
  LEA: '/lea-dashboard',
  I4C: '/i4c',
  BANK: '/bank',
  CITIZEN: '/citizen',
};

export default function RoleRoute({ roles, children }: { roles: Role[]; children: ReactNode }) {
  const role = useStore((s) => s.role);
  if (!roles.includes(role)) {
    return <Navigate to={ROLE_HOME[role]} replace />;
  }
  return <>{children}</>;
}
