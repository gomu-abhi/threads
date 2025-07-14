"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../lib/axios";
import { loginSchema } from "../../validators/authSchemas";
import { z } from "zod";
import { InputField } from "../components/InputField";
import { Button } from "../components/Button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    const parsed = loginSchema.safeParse({ email, password });

    if (!parsed.success) {
      const tree = z.treeifyError(parsed.error);
      const formatted: Record<string, string> = {};

      const props = tree.properties || {};
      for (const [key, val] of Object.entries(props)) {
        if (val.errors?.length) {
          formatted[key] = val.errors[0] ?? "Invalid input";
        }
      }

      setFieldErrors(formatted);
      return;
    }

    try {
      await api.post("/auth/login", parsed.data);
      router.push("/feed");
    } catch (err: any) {
      setError("Invalid Credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4">
      <form
        onSubmit={handleLogin}
        noValidate
        className="bg-white p-8 rounded shadow max-w-md w-full space-y-4"
      >
        <h1 className="text-2xl font-bold mb-2 text-accent text-center">Login</h1>

        {error && <p className="text-error text-sm">{error}</p>}

        <InputField
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={fieldErrors.email}
        />

        <InputField
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={fieldErrors.password}
        />

        <Button type="submit">Login</Button>

        <Button
          type="button"
          variant="secondary"
          onClick={() =>
            (window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`)
          }
        >
          Continue with Google
        </Button>

        <p className="text-sm text-center mt-2">
          Don't have an account?{" "}
          <a href="/register" className="text-accent underline">
            Register
          </a>
        </p>
      </form>
    </div>
  );
}
