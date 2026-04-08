import DashboardLayout from "../../layouts/DashboardLayout";
import Index from '../../components/dashboard/index'
import Graficos from '../../components/dashboard/Graficos'

export default function Dashboard() {
  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <Index />
      </div>
      <div className="p-6 space-y-6">
        <Graficos />
      </div>
    </DashboardLayout>
  );
}