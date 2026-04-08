import { Avatar, Button, Drawer, Dropdown, Label } from "@heroui/react";
import {
  BookOpen,
  BookOpenCheck,
  FileCheck,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  User,
  X,
} from "lucide-react";
import {
  Link,
  Outlet,
  createFileRoute,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { signOut } from "@/lib/appwrite/functions";
import { useAuth } from "@/contexts/auth";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

export const Route = createFileRoute("/app")({
  component: AppLayout,
});

function AppLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate({ to: "/login" });
  }, [user, navigate]);

  const signOutFn = useServerFn(signOut);
  const signOutMutation = useMutation({
    mutationFn: signOutFn,
    onSuccess: async () => {
      await router.invalidate();
      navigate({ to: "/login" });
    },
  });

  useEffect(() => {
    if (isMenuOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  const navLinks = [
    {
      label: "Dashboard",
      href: "/app",
      icon: <LayoutDashboard className="size-4" />,
    },
    {
      label: "Sessions",
      href: "/app/sessions",
      icon: <BookOpenCheck className="size-4" />,
    },
    {
      label: "Students",
      href: "/app/students",
      icon: <GraduationCap className="size-4" />,
    },
    {
      label: "Subjects",
      href: "/app/subjects",
      icon: <BookOpen className="size-4" />,
    },
    {
      label: "Confirmations",
      href: "/app/confirmations",
      icon: <FileCheck className="size-4" />,
    },
    {
      label: "Templates",
      href: "/app/templates",
      icon: <FileText className="size-4" />,
    },
  ];

  // Helper for initials
  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "??";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="sticky top-0 z-50 w-full border-b border-divider bg-background/70 backdrop-blur-md">
        <header className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <Link to="/app" className="flex items-center gap-2 group">
              <div className="size-8 rounded-lg bg-accent flex items-center justify-center text-accent-foreground shadow-lg shadow-accent-soft-hover">
                <BookOpen className="size-5" strokeWidth={3} />
              </div>
              <p className="font-black text-xl tracking-tighter text-foreground">
                Tutor<span className="text-accent">Track</span>
              </p>
            </Link>

            <ul className="hidden md:flex items-center gap-1">
              {navLinks
                .filter((link) => link.label !== "Templates")
                .map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      activeProps={{ className: "bg-accent/10 text-accent" }}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.icon}
                      {link.label}
                    </Link>
                  </li>
                ))}
            </ul>
          </div>

          <div className="flex items-center gap-3">
            {/* User Dropdown remains as is */}
            <Dropdown>
              <Dropdown.Trigger className="rounded-full focus:outline-none ring-accent transition-all hover:ring-2 ring-offset-2 ring-offset-background">
                <Avatar className="size-9 cursor-pointer">
                  <Avatar.Fallback className="bg-accent text-accent-foreground font-bold text-xs">
                    {initials}
                  </Avatar.Fallback>
                </Avatar>
              </Dropdown.Trigger>
              <Dropdown.Popover className="min-w-60 rounded-2xl border border-divider shadow-xl overflow-hidden">
                <div className="px-4 py-4 border-b border-divider bg-accent-soft/5">
                  <div className="flex items-center gap-3">
                    <Avatar size="sm">
                      <Avatar.Fallback className="bg-accent text-accent-foreground text-[10px]">
                        {initials}
                      </Avatar.Fallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                      <p className="text-sm font-bold truncate text-foreground leading-none">
                        {user?.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate mt-1">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                </div>
                <Dropdown.Menu className="p-1.5">
                  <Dropdown.Item
                    id="profile"
                    textValue="Profile"
                    className="rounded-xl group"
                  >
                    <div className="flex w-full items-center justify-between gap-2 px-1">
                      <div className="flex items-center gap-2">
                        <User className="size-4 text-muted-foreground group-hover:text-accent" />
                        <Label className="font-medium">My Profile</Label>
                      </div>
                      <span className="text-[10px] bg-divider px-1.5 py-0.5 rounded text-muted-foreground font-bold">
                        SOON
                      </span>
                    </div>
                  </Dropdown.Item>
                  <Dropdown.Item
                    id="templates"
                    textValue="Templates"
                    className="rounded-xl group"
                    onAction={() => navigate({ to: "/app/templates" })}
                  >
                    <div className="flex w-full items-center justify-between gap-2 px-1">
                      <div className="flex items-center gap-2">
                        <FileText className="size-4 text-muted-foreground group-hover:text-accent" />
                        <Label className="font-medium cursor-pointer">
                          PDF Templates
                        </Label>
                      </div>
                    </div>
                  </Dropdown.Item>
                  <Dropdown.Item
                    id="logout"
                    textValue="Logout"
                    variant="danger"
                    className="rounded-xl group"
                    onAction={() => signOutMutation.mutate(undefined)}
                  >
                    <div className="flex w-full items-center justify-between gap-2 px-1">
                      <Label className="font-bold">Log Out</Label>
                      <LogOut className="size-4" />
                    </div>
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown.Popover>
            </Dropdown>

            {/* Fixed Mobile Trigger & Drawer */}
            <Drawer isOpen={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <Button
                isIconOnly
                variant="tertiary"
                className="md:hidden rounded-xl"
                onPress={() => setIsMenuOpen(true)}
              >
                <Menu className="size-6" />
              </Button>
              <Drawer.Backdrop variant="blur">
                <Drawer.Content>
                  <Drawer.Dialog>
                    <Drawer.Header className="flex items-center justify-between border-b border-divider px-6 py-4">
                      <Drawer.Heading className="font-black text-xl tracking-tighter">
                        Tutor<span className="text-accent">Track</span>
                      </Drawer.Heading>
                      <Drawer.CloseTrigger>
                        <X className="size-6" />
                      </Drawer.CloseTrigger>
                    </Drawer.Header>

                    <Drawer.Body className="p-6">
                      <ul className="flex flex-col gap-3">
                        {navLinks.map((link) => (
                          <li key={link.href}>
                            <Link
                              to={link.href}
                              onClick={() => setIsMenuOpen(false)}
                              activeProps={{
                                className: "bg-accent text-accent-foreground",
                              }}
                              className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-xl font-black transition-transform active:scale-95"
                            >
                              <span className="size-6 flex items-center justify-center">
                                {link.icon}
                              </span>
                              {link.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </Drawer.Body>

                    <Drawer.Footer className="border-t border-divider p-6">
                      <Button
                        variant="danger-soft"
                        className="w-full font-bold h-12 rounded-xl"
                        onPress={() => {
                          setIsMenuOpen(false);
                          signOutMutation.mutate(undefined);
                        }}
                      >
                        <LogOut className="size-4 mr-2" />
                        Log Out
                      </Button>
                    </Drawer.Footer>
                  </Drawer.Dialog>
                </Drawer.Content>
              </Drawer.Backdrop>
            </Drawer>
          </div>
        </header>
      </nav>

      <main className="flex-1 w-full max-w-5xl mx-auto p-6 md:p-10 space-y-10">
        <Outlet />
      </main>
    </div>
  );
}
