"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../lib/axios";
import { z } from "zod";
import { registerSchema } from "../../validators/authSchemas";
import { InputField } from "../components/InputField";
import { Button } from "../components/Button";

export default function RegisterPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setFieldErrors({});

        const parsed = registerSchema.safeParse({ email, name, password });

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
            await api.post("/auth/register", parsed.data);
            router.push("/feed");
        } catch (err: any) {
            setError(err.response?.data?.message || "Registration failed");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted px-4">
            <form
                onSubmit={handleRegister}
                noValidate
                className="bg-white px-12 pt-10 pb-8 rounded-xl shadow max-w-md w-full"
            >
                <h1 className="text-2xl font-bold mb-6 text-primary text-center">Register</h1>

                {error && <p className="text-error mb-4">{error}</p>}

                <InputField
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    error={fieldErrors.name}
                    required
                />

                <InputField
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={fieldErrors.email}
                    required
                />

                <InputField
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={fieldErrors.password}
                    required
                />

                <Button type="submit" className="mb-4">Register</Button>

                <Button
                    type="button"
                    variant="secondary"
                    onClick={() =>
                        (window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`)
                    }
                >
                    Continue with Google
                </Button>

                <p className="text-sm mt-6 text-center text-secondary">
                    Already have an account?{" "}
                    <a href="/login" className="text-accent underline">
                        Login
                    </a>
                </p>
            </form>
        </div>
    );
}