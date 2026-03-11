import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, LogIn } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const [, navigate] = useLocation();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Ingresa email y contraseña");
      return;
    }
    const success = login(email, password);
    if (success) {
      navigate("/app/dashboard");
    } else {
      setError("Credenciales inválidas");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <svg
              viewBox="0 0 48 48"
              className="w-16 h-16"
              fill="none"
              aria-label="CorruMetrics"
            >
              <rect x="3" y="3" width="42" height="42" rx="6" stroke="hsl(184 80% 22%)" strokeWidth="3" />
              <path d="M12 33 L18 18 L24 27 L30 12 L36 24" stroke="hsl(184 80% 22%)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="18" cy="18" r="2" fill="hsl(184 80% 22%)" />
              <circle cx="30" cy="12" r="2" fill="hsl(184 80% 22%)" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight" data-testid="text-login-title">
            CorruMetrics
          </h1>
          <p className="text-sm text-muted-foreground">
            Sistema operativo visual para planta
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive" data-testid="alert-login-error">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@corrumetrics.mx"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  data-testid="input-email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="admin123"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  data-testid="input-password"
                />
              </div>

              <Button type="submit" className="w-full gap-2" data-testid="button-login">
                <LogIn className="w-4 h-4" />
                Iniciar sesión
              </Button>

              <p className="text-[11px] text-muted-foreground text-center pt-2">
                Demo: admin@corrumetrics.mx / admin123
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
