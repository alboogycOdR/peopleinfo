import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Lock, AlertCircle } from "lucide-react";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");

  const loginMutation = trpc.admin.login.useMutation();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const result = await loginMutation.mutateAsync(credentials);
      if (result.success) {
        toast.success("Login successful!");
        setLocation("/admin/dashboard");
      } else {
        setError(result.message || "Login failed");
        toast.error(result.message || "Invalid credentials");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      toast.error("An error occurred. Please try again.");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900 relative overflow-hidden flex items-center justify-center p-4">
      {/* Blueprint grid background */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(0deg, transparent 24%, rgba(255,255,255,.05) 25%, rgba(255,255,255,.05) 26%, transparent 27%, transparent 74%, rgba(255,255,255,.05) 75%, rgba(255,255,255,.05) 76%, transparent 77%, transparent),
            linear-gradient(90deg, transparent 24%, rgba(255,255,255,.05) 25%, rgba(255,255,255,.05) 26%, transparent 27%, transparent 74%, rgba(255,255,255,.05) 75%, rgba(255,255,255,.05) 76%, transparent 77%, transparent)
          `,
          backgroundSize: "50px 50px",
        }}
      />

      {/* Decorative technical elements */}
      <div className="absolute top-20 right-20 w-40 h-40 border-2 border-white/10 opacity-50" />
      <div className="absolute bottom-32 left-10 w-32 h-32 border-2 border-white/10 opacity-50" />
      <div className="absolute top-1/3 right-1/4 w-1 h-32 bg-white/20" />

      <div className="relative z-10">
        <Card className="w-full max-w-md bg-slate-950/80 border-white/20 backdrop-blur-sm">
          <CardHeader className="border-b border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <Lock className="w-6 h-6 text-white" />
              <div>
                <CardTitle className="text-white text-2xl font-bold tracking-tight">
                  ADMIN ACCESS
                </CardTitle>
                <CardDescription className="text-white/60 text-sm mt-1">
                  Secure authentication required
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-3 p-3 bg-red-950/30 border border-red-500/30 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <p className="text-red-200 text-sm">{error}</p>
                </div>
              )}

              {/* Username Field */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-white font-semibold text-sm">
                  Username
                </Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  value={credentials.username}
                  onChange={handleInputChange}
                  placeholder="Enter username"
                  required
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:bg-white/10 focus:border-white/40"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white font-semibold text-sm">
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={credentials.password}
                  onChange={handleInputChange}
                  placeholder="Enter password"
                  required
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:bg-white/10 focus:border-white/40"
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full bg-white text-blue-950 hover:bg-white/90 font-bold py-2 mt-8"
              >
                {loginMutation.isPending ? "Authenticating..." : "LOGIN"}
              </Button>

              {/* Info Text */}
              <div className="text-center text-white/50 text-xs pt-4 border-t border-white/10">
                <p>Secure access to person records database</p>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Technical footer decoration */}
        <div className="mt-8 flex items-center justify-center gap-2 text-white/30 text-xs">
          <div className="w-8 h-px bg-white/30" />
          <span>AUTHENTICATION PORTAL v1.0</span>
          <div className="w-8 h-px bg-white/30" />
        </div>
      </div>
    </div>
  );
}
