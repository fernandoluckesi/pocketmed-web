import { MainLayout } from "../../components/MainLayout";
import { DashboardContent } from "../../components/DashboardContent";
import { ICONS } from "../../constants";
import { motion } from "motion/react";

export default function Dashboard() {
  return (
    <MainLayout>
      <DashboardContent />

      {/* Contextual FAB */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed bottom-8 right-8 w-14 h-14 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center z-50 cursor-pointer"
      >
        <ICONS.Plus size={24} />
      </motion.button>
    </MainLayout>
  );
}
