import Home from "@/pages/Home";
import LoginPage from "@/pages/Login";
import Dashboard from "@/pages/dashboard/Dashboard";
import {
  createBrowserRouter,
  Outlet,
  RouterProvider,
  useNavigation,
} from "react-router";
import NotesPage from "@/pages/dashboard/Notes";
import Chat from "@/pages/dashboard/Chat";
import FocusPage from "@/pages/dashboard/Focus";
import RemindersPage from "@/pages/dashboard/Reminders";
import DashboardLayout from "@/pages/dashboard/layout/DashboardLayout";
import { ThemeProvider } from "@/providers/theme-provider";
import { ToastProvider } from "@/components/ui/toast";
import QueryProvideR from "@/providers/providers";
import "../app/globals.css";
import NotFound from "@/pages/ErrorPage";
import Loading, { SuspenseLoading } from "@/pages/Loading";
import { Suspense } from "react";

export default function App() {
  return <RouterProvider router={router} />;
}

function Layout() {
  const navigation = useNavigation();
  const isLoading = navigation.state === "loading";

  return (
    <div className="min-h-screen antialiased">
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <QueryProvideR>
          <ToastProvider>
            <main className="relative">
              {isLoading && <Loading />}
              <Suspense fallback={<SuspenseLoading />}>
                <Outlet />
              </Suspense>
            </main>
          </ToastProvider>
        </QueryProvideR>
      </ThemeProvider>
    </div>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "/login",
        element: <LoginPage />,
      },
      {
        path: "/dashboard",
        element: (
          <DashboardLayout>
            <Outlet />
          </DashboardLayout>
        ),
        children: [
          {
            index: true,
            element: <Dashboard />,
          },
          {
            path: "notes",
            element: <NotesPage />,
          },
          {
            path: "chat",
            element: <Chat />,
          },
          {
            path: "focus",
            element: <FocusPage />,
          },
          {
            path: "reminders",
            element: <RemindersPage />,
          },
        ],
      },
    ],
  },
]);
