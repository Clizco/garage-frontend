import { BrowserRouter as Router, Routes, Route } from "react-router";
import { Toaster } from "react-hot-toast"; // 💥 Agregado
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import PublicRoutes from "./utils/publicRoutes";
import PrivateRoutes from "./utils/privateRoutes";
import InstallButton from "./components/installbutton/installbutton";
import VehicleInspectionTable from "./pages/VehicleInspection/VehicleInspectionTable";
import ExitOrderTable from "./pages/ExitOrder/ExitOrderTable";
import CreateExitOrder from "./pages/ExitOrder/CreateExitOrder/CreateExitOrder";
import UpdateExitOrder from "./pages/ExitOrder/UpdateExitOrder/UpdateExitOrder";
import MilageTable from "./pages/Mileages/MileageTable";
import CreateMilage from "./pages/Mileages/CreateMileages/CreateMileages";
import UpdateMilage from "./pages/Mileages/UpdateMileages/UpdateMileages";
import WorkshopReportTable from "./pages/WorkshopReport/WorkshopReportTable";
import CreateWorkshopReport from "./pages/WorkshopReport/CreateWorkshopReport/CreateWorkshopReport";
import RoutesTable from "./pages/Routes/RoutesTable";
import CreateRoute from "./pages/Routes/CreateRoutes/CreateRoutes";
import { GuardiaRoutes, ConductorRoutes } from "./utils/roleRoutes";
import ObservationsTable from "./pages/Observations/ObservationsTable";
import CreateObservationForm from "./pages/Observations/CreateObservations/CreateObservations";


export default function App() {
  return (
    <Router>
      <InstallButton />
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 4000,
          style: {
            background: "#333",
            color: "#fff",
            borderRadius: "8px",
            fontSize: "14px",
          },
        }}
      />
      <ScrollToTop />
      <Routes>

        {/* Rutas privadas (requieren login) */}
        <Route element={<PrivateRoutes />}>
          <Route element={<AppLayout />}>
            {/* Dashboard */}
            <Route index path="/" element={<Home />} />
            {/* Otras páginas */}
            <Route path="/profile" element={<UserProfiles />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/blank" element={<Blank />} />

           {/* Rutas solo para GUARDIAS (rol 4) */}
            <Route element={<GuardiaRoutes />}>
              <Route path="/vehicle-inspection" element={<VehicleInspectionTable />} />
              <Route path="/exit-orders" element={<ExitOrderTable />} />
              <Route path="/create-exit-order" element={<CreateExitOrder />} />
              <Route path="/update-exit-order/:id" element={<UpdateExitOrder />} />
              <Route path="/milages" element={<MilageTable />} />
              <Route path="/create-milage" element={<CreateMilage />} />
              <Route path="/update-milage/:id" element={<UpdateMilage />} />
              <Route path="/workshop-reports" element={<WorkshopReportTable />} />
              <Route path="/create-workshop-report" element={<CreateWorkshopReport />} />
              <Route path="/observations" element={<ObservationsTable />} />
              <Route path="/create-observation" element={<CreateObservationForm />} />
            </Route>

            {/* Rutas solo para CONDUCTORES (rol 3) */}
            <Route element={<ConductorRoutes />}>
              <Route path="/routes" element={<RoutesTable />} />
              <Route path="/create-route" element={<CreateRoute />} />
            </Route>


          

            {/* Rutas anidadas */}

            {/* Formularios */}
            <Route path="/form-elements" element={<FormElements />} />

            {/* Tablas */}
            <Route path="/basic-tables" element={<BasicTables />} />

            {/* Componentes UI */}
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/avatars" element={<Avatars />} />
            <Route path="/badge" element={<Badges />} />
            <Route path="/buttons" element={<Buttons />} />
            <Route path="/images" element={<Images />} />
            <Route path="/videos" element={<Videos />} />

            {/* Gráficos */}
            <Route path="/line-chart" element={<LineChart />} />
            <Route path="/bar-chart" element={<BarChart />} />
          </Route>
        </Route>

        {/* Rutas públicas */}
        <Route element={<PublicRoutes />}>
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
        </Route>

        {/* Ruta de error (404) */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </Router>
  );
}
