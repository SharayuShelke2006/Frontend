import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useStore } from '@/state/store';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import RoleSelect from '@/pages/RoleSelect';
import LeaDashboard from '@/pages/LeaDashboard';
import I4cCommandCenter from '@/pages/I4cCommandCenter';
import BankQueue from '@/pages/BankQueue';
import GisOverview from '@/pages/GisOverview';
import DistrictDrilldown from '@/pages/DistrictDrilldown';
import AtmDetail from '@/pages/AtmDetail';
import PredictionDetail from '@/pages/PredictionDetail';
import AlertQueue from '@/pages/AlertQueue';
import AlertDetail from '@/pages/AlertDetail';
import CaseList from '@/pages/CaseList';
import CaseDetail from '@/pages/CaseDetail';
import CitizenComplaint from '@/pages/CitizenComplaint';
import Notifications from '@/pages/Notifications';
import AuditTimeline from '@/pages/AuditTimeline';

function Shell() {
  return (
    <div className="flex h-screen flex-col">
      <Header />
      <div className="flex min-h-0 flex-1">
        <Sidebar />
        <main className="min-h-0 flex-1 overflow-y-auto bg-slate-50">
          <Routes>
            <Route path="/" element={<RoleGate />} />
            <Route path="/lea" element={<LeaDashboard />} />
            <Route path="/i4c" element={<I4cCommandCenter />} />
            <Route path="/bank" element={<BankQueue />} />
            <Route path="/complaint" element={<CitizenComplaint />} />
            <Route path="/gis" element={<GisOverview />} />
            <Route path="/gis/districts/:districtId" element={<DistrictDrilldown />} />
            <Route path="/atms/:atmId" element={<AtmDetail />} />
            <Route path="/predictions/:predictionId" element={<PredictionDetail />} />
            <Route path="/alerts" element={<AlertQueue />} />
            <Route path="/alerts/:alertId" element={<AlertDetail />} />
            <Route path="/cases" element={<CaseList />} />
            <Route path="/cases/:caseId" element={<CaseDetail />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/audit" element={<AuditTimeline />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function RoleGate() {
  const role = useStore((s) => s.role);
  if (role === 'LEA') return <Navigate to="/lea" replace />;
  if (role === 'I4C') return <Navigate to="/i4c" replace />;
  if (role === 'BANK') return <Navigate to="/bank" replace />;
  return <Navigate to="/complaint" replace />;
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
        <Route path="/*" element={<Shell />} />
      </Routes>
    </BrowserRouter>
  );
}
