import { useEffect, useRef, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useStore } from '@/state/store';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import ToastHost from '@/components/layout/ToastHost';
import { IntelligenceDrawerProvider } from '@/components/shared/IntelligenceDrawer';
import RoleRoute, { ROLE_HOME } from '@/components/layout/RoleRoute';
import LeaDashboard from '@/pages/LeaDashboard';
import I4cCommandCenter from '@/pages/I4cCommandCenter';
import BankQueue from '@/pages/BankQueue';
import GisOverview from '@/pages/GisOverview';
import DistrictDrilldown from '@/pages/DistrictDrilldown';
import AtmDetail from '@/pages/AtmDetail';
import PredictionDetail from '@/pages/PredictionDetail';
import PredictionQueue from '@/pages/PredictionQueue';
import AlertQueue from '@/pages/AlertQueue';
import AlertDetail from '@/pages/AlertDetail';
import CaseList from '@/pages/CaseList';
import CaseDetail from '@/pages/CaseDetail';
import Notifications from '@/pages/Notifications';
import AuditTimeline from '@/pages/AuditTimeline';
import CitizenHome from '@/pages/citizen/CitizenHome';
import CitizenComplaint from '@/pages/citizen/CitizenComplaint';
import CitizenTrack from '@/pages/citizen/CitizenTrack';
import RoleSelect from '@/pages/RoleSelect';

const OPS_ROLES = ['LEA', 'I4C', 'BANK'] as const;

function Shell() {
  const role = useStore((s) => s.role);
  const mainRef = useRef<HTMLElement>(null);
  const [mainScrolled, setMainScrolled] = useState(false);

  useEffect(() => {
    const main = mainRef.current;
    if (!main) return;

    const handleScroll = () => setMainScrolled(main.scrollTop > 8);
    handleScroll();
    main.addEventListener('scroll', handleScroll, { passive: true });
    return () => main.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <IntelligenceDrawerProvider>
      <div className="flex h-screen flex-col">
        <Header scrolled={mainScrolled} />
        <div className="flex min-h-0 flex-1">
          <Sidebar />
          <main ref={mainRef} className="min-h-0 flex-1 overflow-y-auto bg-slate-50">
          <Routes>
            <Route path="/" element={<Navigate to={ROLE_HOME[role]} replace />} />
            <Route
              path="/lea"
              element={
                <RoleRoute roles={['LEA']}>
                  <LeaDashboard />
                </RoleRoute>
              }
            />
            <Route
              path="/i4c"
              element={
                <RoleRoute roles={['I4C']}>
                  <I4cCommandCenter />
                </RoleRoute>
              }
            />
            <Route
              path="/bank"
              element={
                <RoleRoute roles={['BANK']}>
                  <BankQueue />
                </RoleRoute>
              }
            />
            <Route
              path="/gis"
              element={
                <RoleRoute roles={['LEA', 'I4C']}>
                  <GisOverview />
                </RoleRoute>
              }
            />
            <Route
              path="/gis/districts/:districtId"
              element={
                <RoleRoute roles={['LEA', 'I4C']}>
                  <DistrictDrilldown />
                </RoleRoute>
              }
            />
            <Route
              path="/atms/:atmId"
              element={
                <RoleRoute roles={[...OPS_ROLES]}>
                  <AtmDetail />
                </RoleRoute>
              }
            />
            <Route
              path="/predictions/:predictionId"
              element={
                <RoleRoute roles={[...OPS_ROLES]}>
                  <PredictionDetail />
                </RoleRoute>
              }
            />
            <Route
              path="/predictions"
              element={
                <RoleRoute roles={[...OPS_ROLES]}>
                  <PredictionQueue />
                </RoleRoute>
              }
            />
            <Route
              path="/alerts"
              element={
                <RoleRoute roles={[...OPS_ROLES]}>
                  <AlertQueue />
                </RoleRoute>
              }
            />
            <Route
              path="/alerts/:alertId"
              element={
                <RoleRoute roles={[...OPS_ROLES]}>
                  <AlertDetail />
                </RoleRoute>
              }
            />
            <Route
              path="/cases"
              element={
                <RoleRoute roles={['LEA', 'I4C']}>
                  <CaseList />
                </RoleRoute>
              }
            />
            <Route
              path="/cases/:caseId"
              element={
                <RoleRoute roles={['LEA', 'I4C']}>
                  <CaseDetail />
                </RoleRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <RoleRoute roles={[...OPS_ROLES]}>
                  <Notifications />
                </RoleRoute>
              }
            />
            <Route
              path="/audit"
              element={
                <RoleRoute roles={[...OPS_ROLES]}>
                  <AuditTimeline />
                </RoleRoute>
              }
            />
            <Route path="*" element={<Navigate to={ROLE_HOME[role]} replace />} />
          </Routes>
          </main>
        </div>
        <ToastHost />
      </div>
    </IntelligenceDrawerProvider>
  );
}

function CitizenShell() {
  return (
    <>
      <Routes>
        <Route
          path=""
          element={
            <RoleRoute roles={['CITIZEN']}>
              <CitizenHome />
            </RoleRoute>
          }
        />
        <Route
          path="complaint"
          element={
            <RoleRoute roles={['CITIZEN']}>
              <CitizenComplaint />
            </RoleRoute>
          }
        />
        <Route
          path="track"
          element={
            <RoleRoute roles={['CITIZEN']}>
              <CitizenTrack />
            </RoleRoute>
          }
        />
      </Routes>
      <ToastHost />
    </>
  );
}

export default function App() {
  const init = useStore((s) => s.init);
  const ready = useStore((s) => s.ready);
  const error = useStore((s) => s.error);

  useEffect(() => {
    init();
  }, [init]);

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="panel max-w-md p-6 text-center">
          <p className="font-semibold text-red-600">Failed to load intelligence data</p>
          <p className="mt-2 text-sm text-slate-500">{error}</p>
        </div>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center bg-navy-950 text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-white/20 border-t-accent-500" />
          <p className="text-sm uppercase tracking-widest text-slate-300">Loading Telangana intelligence layer…</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<RoleSelect />} />
        <Route path="/citizen/*" element={<CitizenShell />} />
        <Route path="/*" element={<Shell />} />
      </Routes>
    </BrowserRouter>
  );
}
