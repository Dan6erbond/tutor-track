import { Avatar, Button, Drawer, Dropdown, Separator } from "@heroui/react";
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
    <div className="min-h-screen bg-background flex flex-col relative overflow-x-hidden">
      {/* Soft Pro Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] size-[40%] rounded-full bg-accent/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] size-[40%] rounded-full bg-accent-soft/10 blur-[120px]" />
      </div>

      <nav className="sticky top-0 z-50 w-full border-b border-divider bg-background/60 backdrop-blur-xl supports-backdrop-filter:bg-background/60">
        <header className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 lg:gap-8">
            <Link
              to="/app"
              className="flex items-center gap-2.5 group transition-transform active:scale-95"
            >
              <div className="size-9 rounded-xl bg-accent flex items-center justify-center text-accent-foreground shadow-lg shadow-accent-soft-hover group-hover:shadow-accent/30 transition-all">
                <BookOpen className="size-5" strokeWidth={2.5} />
              </div>
              <p className="font-black text-xl tracking-tight text-foreground hidden sm:block">
                Tutor<span className="text-accent">Track</span>
              </p>
            </Link>

            {/* Desktop Nav */}
            <ul className="hidden md:flex items-center gap-1">
              {navLinks
                .filter((link) => link.label !== "Templates")
                .map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      activeProps={{
                        className:
                          "bg-accent-soft text-accent ring-1 ring-accent/20",
                      }}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                    >
                      <span className="size-4">{link.icon}</span>
                      {link.label}
                    </Link>
                  </li>
                ))}
            </ul>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Profile Dropdown */}
            <Dropdown>
              <Dropdown.Trigger>
                <Button className="px-2 md:pr-4 h-12 group">
                  <Avatar className="size-8 sm:size-9 cursor-pointer border-2 border-transparent group-hover:border-accent-soft-hover transition-all">
                    <Avatar.Fallback className="bg-accent text-accent-foreground font-bold text-xs">
                      {initials}
                    </Avatar.Fallback>
                  </Avatar>
                  <div className="hidden sm:flex flex-col items-start leading-none">
                    <span className="text-xs font-bold text-foreground">
                      {user?.name?.split(" ")[0]}
                    </span>
                  </div>
                </Button>
              </Dropdown.Trigger>

              <Dropdown.Popover className="min-w-64 rounded-2xl border border-divider shadow-2xl overflow-hidden">
                <div className="px-5 py-5 border-b border-divider bg-linear-to-b from-accent-soft/20 to-transparent">
                  <div className="flex items-center gap-3">
                    <Avatar size="md" className="ring-2 ring-accent/10">
                      <Avatar.Fallback className="bg-accent text-accent-foreground text-xs font-black">
                        {initials}
                      </Avatar.Fallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                      <p className="text-sm font-black truncate text-foreground leading-tight">
                        {user?.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate opacity-80">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                </div>

                <Dropdown.Menu className="p-2">
                  <Dropdown.Section>
                    <Dropdown.Item
                      id="profile"
                      textValue="Profile"
                      className="rounded-lg py-2.5 group"
                    >
                      <div className="flex w-full items-center justify-between gap-2 px-1">
                        <div className="flex items-center gap-3">
                          <User className="size-4 text-muted-foreground group-hover:text-accent transition-colors" />
                          <span className="font-semibold text-sm">
                            Account Settings
                          </span>
                        </div>
                        <span className="text-[9px] bg-accent/10 text-accent px-1.5 py-0.5 rounded-md font-black tracking-widest">
                          SOON
                        </span>
                      </div>
                    </Dropdown.Item>

                    <Dropdown.Item
                      id="templates"
                      textValue="Templates"
                      className="rounded-lg py-2.5 group"
                      onAction={() => navigate({ to: "/app/templates" })}
                    >
                      <div className="flex items-center gap-3 px-1">
                        <FileText className="size-4 text-muted-foreground group-hover:text-accent transition-colors" />
                        <span className="font-semibold text-sm">
                          PDF Templates
                        </span>
                      </div>
                    </Dropdown.Item>
                  </Dropdown.Section>

                  <Separator />

                  <Dropdown.Section>
                    <Dropdown.Item
                      id="logout"
                      textValue="Logout"
                      variant="danger"
                      className="rounded-lg py-2.5"
                      onAction={() => signOutMutation.mutate(undefined)}
                    >
                      <div className="flex w-full items-center justify-between gap-2 px-1">
                        <span className="font-bold text-sm">Log Out</span>
                        <LogOut className="size-4" />
                      </div>
                    </Dropdown.Item>
                  </Dropdown.Section>
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

      {/* Unified Content Area */}
      <main className="flex-1 relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        <Outlet />
      </main>
    </div>
  );
}
