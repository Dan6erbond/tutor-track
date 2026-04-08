import { Alert, Button, Input, Label, Spinner, Tabs } from "@heroui/react";
import {
  createFileRoute,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";
import { signInWithEmail, signUpWithEmail } from "@/lib/appwrite/functions";

import { useAuth } from "#/contexts/auth";
import { useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const router = useRouter();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate({ to: "/app" });
    }
  }, [user, navigate]);

  // 1. Server Functions & Mutations
  const signInFn = useServerFn(signInWithEmail);
  const signUpFn = useServerFn(signUpWithEmail);

  const signInMutation = useMutation({
    mutationFn: signInFn,
    onSuccess: async () => {
      await router.invalidate();
      navigate({ to: "/app" });
    },
  });

  const signUpMutation = useMutation({
    mutationFn: signUpFn,
    onSuccess: async () => {
      await router.invalidate();
      navigate({ to: "/app" });
    },
  });

  // 2. TanStack Forms
  const loginForm = useForm({
    defaultValues: { email: "", password: "" },
    onSubmit: async ({ value }) => {
      signInMutation.mutate({ data: value });
    },
  });

  const signUpForm = useForm({
    defaultValues: { name: "", email: "", password: "" },
    onSubmit: async ({ value }) => {
      signUpMutation.mutate({ data: value });
    },
  });

  const globalError =
    signInMutation.error?.message || signUpMutation.error?.message;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <header className="text-center">
          <h1 className="text-3xl font-bold text-foreground">TutorTrack</h1>
          <p className="text-muted-foreground">Manage your tutoring workflow</p>
        </header>

        {globalError && (
          <Alert status="danger">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>Authentication Error</Alert.Title>
              <Alert.Description>{globalError}</Alert.Description>
            </Alert.Content>
          </Alert>
        )}

        <Tabs className="w-full" variant="secondary">
          <Tabs.ListContainer>
            <Tabs.List aria-label="Auth tabs">
              <Tabs.Tab id="login">
                Sign In
                <Tabs.Indicator />
              </Tabs.Tab>
              <Tabs.Tab id="signup">
                Sign Up
                <Tabs.Indicator />
              </Tabs.Tab>
            </Tabs.List>
          </Tabs.ListContainer>

          {/* Sign In Panel */}
          <Tabs.Panel className="pt-6" id="login">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                loginForm.handleSubmit();
              }}
              className="flex flex-col gap-5"
            >
              <loginForm.Field
                name="email"
                children={(field) => (
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor={field.name}>Email</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      type="email"
                      placeholder="tutor@example.com"
                      variant="secondary"
                      required
                    />
                  </div>
                )}
              />
              <loginForm.Field
                name="password"
                children={(field) => (
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor={field.name}>Password</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      type="password"
                      placeholder="••••••••"
                      variant="secondary"
                      required
                    />
                  </div>
                )}
              />
              <Button
                type="submit"
                className="bg-accent text-accent-foreground mt-2"
                isPending={signInMutation.isPending}
              >
                {({ isPending }) => (
                  <>
                    {isPending && <Spinner color="current" size="sm" />}
                    {isPending ? "Authenticating..." : "Sign In"}
                  </>
                )}
              </Button>
            </form>
          </Tabs.Panel>

          {/* Sign Up Panel */}
          <Tabs.Panel className="pt-6" id="signup">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                signUpForm.handleSubmit();
              }}
              className="flex flex-col gap-5"
            >
              {/* Full Name Field */}
              <signUpForm.Field
                name="name"
                children={(field) => (
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor={field.name}>Full Name</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Alex Tutor"
                      variant="secondary"
                      required
                    />
                    {field.state.meta.errors ? (
                      <em className="text-xs text-danger">
                        {field.state.meta.errors.join(", ")}
                      </em>
                    ) : null}
                  </div>
                )}
              />

              {/* Email Field */}
              <signUpForm.Field
                name="email"
                children={(field) => (
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor={field.name}>Email</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="email"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="new@tutortrack.com"
                      variant="secondary"
                      required
                    />
                    {field.state.meta.errors ? (
                      <em className="text-xs text-danger">
                        {field.state.meta.errors.join(", ")}
                      </em>
                    ) : null}
                  </div>
                )}
              />

              {/* Password Field */}
              <signUpForm.Field
                name="password"
                children={(field) => (
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor={field.name}>Password</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="password"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="••••••••"
                      variant="secondary"
                      required
                    />
                    {field.state.meta.errors ? (
                      <em className="text-xs text-danger">
                        {field.state.meta.errors.join(", ")}
                      </em>
                    ) : null}
                  </div>
                )}
              />

              <Button
                type="submit"
                className="bg-accent text-accent-foreground mt-2"
                isPending={signUpMutation.isPending}
              >
                {({ isPending }) => (
                  <>
                    {isPending && <Spinner color="current" size="sm" />}
                    {isPending ? "Creating Account..." : "Create Account"}
                  </>
                )}
              </Button>
            </form>
          </Tabs.Panel>
        </Tabs>
      </div>
    </div>
  );
}
