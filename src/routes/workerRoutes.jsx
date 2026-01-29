import { Route } from "react-router-dom";
import DrWorkerLayout from "../Components/DrazeWorkerDashboard/DrWorkerLayout.jsx";
import WorkerDashboardLoginDr from "../Components/DrazeWorkerDashboard/WorkerDashboardLoginDr.jsx";
import WorkerDashboardDr from "../Components/DrazeWorkerDashboard/WorkerDashboardDr.jsx";
import DrWorkerProfile from "../Components/DrazeWorkerDashboard/DrWorkerProfile.jsx";

const workerMainRoutes = (
  <Route key="dr_worker_main" path="/dr-worker-dashboard" element={<DrWorkerLayout />}>
    <Route index element={<WorkerDashboardDr />} />
    <Route path="dashboard" element={<WorkerDashboardDr />} />
    <Route path="profile" element={<DrWorkerProfile />} />
  </Route>
);

const workerLoginRoute = (
  <Route key="dr_worker_login" path="/dr_worker_login" element={<WorkerDashboardLoginDr />} />
);

export const workerRoutes = [workerMainRoutes, workerLoginRoute];