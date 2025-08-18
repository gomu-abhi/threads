"use client";

import { useRouter } from "next/navigation";

export default function RedirectToLogin() {
    const router = useRouter();
    router.push("/login");
}