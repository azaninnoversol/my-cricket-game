"use client";
import React, { useEffect, useRef, useState } from "react";

// images
import { IMAGES } from "@/utils/resourses";

// components
import { AnimatedH1, AnimatedH2 } from "../AnimatedText/Typography";
import Input from "../Input/Input";
import AnimatedButton from "../AnimatedButton/AnimatedButton";

// gsap
import gsap from "gsap";

// next
import { usePathname } from "next/navigation";
import Link from "next/link";
import Loader from "../Loader/Loader";
import { showError, showSuccess } from "../Toast/Toast";
import { localStorageHelper } from "@/utils/helper-functions/helper-functions";

interface FormData {
  username: { value: string; error: string };
  password: { value: string; error: string };
  email: { value: string; error: string };
}

function AuthForm() {
  const defaultFormData = {
    username: { value: "", error: "" },
    password: { value: "", error: "" },
    email: { value: "", error: "" },
  };

  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const pathname = usePathname();
  const formRef = useRef<HTMLFormElement>(null);

  const isSignupPage = pathname === "/auth/sign-up";

  useEffect(() => {
    if (!formRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from(formRef.current!.children, {
        opacity: 0,
        y: 30,
        stagger: 0.1,
        duration: 0.6,
        ease: "power3.out",
        clearProps: "all",
      });
    }, formRef);

    return () => ctx.revert();
  }, [pathname]);

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: { ...prev[field], value, error: "" },
    }));
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLFormElement, MouseEvent>) => {
    if (!formRef.current) return;
    const { left, top, width, height } = formRef.current.getBoundingClientRect();
    const x = e.clientX - left - width / 2;
    const y = e.clientY - top - height / 2;

    gsap.to(formRef.current, {
      rotationY: x * 0.05,
      rotationX: -y * 0.05,
      transformPerspective: 1000,
      transformOrigin: "center",
      ease: "power2.out",
    });
  };

  const handleMouseLeave = async () => {
    if (!formRef.current) return;
    gsap.to(formRef.current, { rotationY: 0, rotationX: 0, ease: "power3.out" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let valid = true;
    const newFormData = { ...formData };

    Object.keys(formData).forEach((key) => {
      const field = key as keyof FormData;

      if (isSignupPage || field !== "username") {
        if (!formData[field].value) {
          newFormData[field].error = `${field} is required`;
          valid = false;
        }
      }
    });

    setFormData(newFormData);

    if (!valid) {
      if (formRef.current) {
        gsap.fromTo(formRef.current, { x: -10 }, { x: 10, duration: 0.1, repeat: 5, yoyo: true, ease: "power1.inOut" });
      }
      showError("Missing Information", "Please complete all required fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      const url = isSignupPage ? "/api/auth/register" : "/api/auth/login";

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isSignupPage
            ? {
                email: formData.email.value,
                password: formData.password.value,
                username: formData.username.value,
              }
            : {
                email: formData.email.value,
                password: formData.password.value,
              },
        ),
      });

      const result = await res.json();

      if (result.success) {
        localStorageHelper.setItem("users", result.data);

        showSuccess(
          isSignupPage ? "Account Created!" : "Login Successful!",
          isSignupPage ? "Your account has been created successfully 🎉" : "Welcome back 🎉",
        );

        setFormData(defaultFormData);

        window.location.href = "/";
      } else {
        showError(isSignupPage ? "Signup Failed" : "Login Failed", result.message || "Something went wrong.");
      }
    } catch (err: any) {
      showError(isSignupPage ? "Signup Failed" : "Login Failed", err.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="auth-form"
      className="relative min-h-screen overflow-hidden w-full bg-cover bg-no-repeat"
      style={{ backgroundImage: `url(${IMAGES.backGroundImg.src})` }}
    >
      <main className="w-7xl mx-auto">
        <AnimatedH1 animation="stagger" className="text-white text-center pt-10">
          Circket BLAST
        </AnimatedH1>

        <div className="flex items-center justify-center mt-10">
          <form
            ref={formRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onSubmit={handleSubmit}
            className="relative w-full max-w-lg p-10 bg-gray-800/80 backdrop-blur-md rounded-3xl shadow-2xl flex flex-col gap-6"
          >
            <AnimatedH2 animation="stagger" className="text-white text-center overflow-visible! visible">
              {isSignupPage ? "Sign Up" : "Login"}
            </AnimatedH2>

            <Input
              readOnly={isSubmitting}
              placeholder="Email"
              type="email"
              value={formData.email.value}
              onChange={(e) => handleChange("email", e.target.value)}
              animation="pulse"
              error={formData.email.error}
              className="placeholder:text-white text-white"
            />

            {isSignupPage && (
              <Input
                readOnly={isSubmitting}
                placeholder="Username"
                type="text"
                value={formData.username.value}
                onChange={(e) => handleChange("username", e.target.value)}
                animation="pulse"
                error={formData.username.error}
                className="placeholder:text-white text-white"
              />
            )}

            <Input
              readOnly={isSubmitting}
              placeholder="Password"
              type="password"
              value={formData.password.value}
              onChange={(e) => handleChange("password", e.target.value)}
              animation="pulse"
              error={formData.password.error}
              className="placeholder:text-white text-white"
            />

            <AnimatedButton type="submit" variant="primary" animationType="pulse" hoverEffect="colorShift" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader color="white" size={15} /> Submitting
                </span>
              ) : isSignupPage ? (
                "Create Account"
              ) : (
                "Login"
              )}
            </AnimatedButton>

            {isSignupPage ? (
              <p className="text-white">
                Already have an account?{" "}
                <Link href={"/auth/login"} className="text-sm text-blue-300 underline">
                  Log in here
                </Link>{" "}
                to start playing!
              </p>
            ) : (
              <p className="text-white">
                New here?{" "}
                <Link href={"/auth/sign-up"} className="text-sm text-blue-300 underline">
                  Sign up now
                </Link>{" "}
                and join the action!
              </p>
            )}
          </form>
        </div>
      </main>
    </section>
  );
}

export default React.memo(AuthForm);
