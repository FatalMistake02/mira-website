"use client";

import { SignInModal } from "@/components/auth/sign-in-modal";

interface SignInModalWrapperProps {
  isOpen: boolean;
}

export function SignInModalWrapper({ isOpen }: SignInModalWrapperProps) {
  const handleClose = () => {
    // Remove the signin param from URL
    const url = new URL(window.location.href);
    url.searchParams.delete("signin");
    window.location.href = url.toString();
  };

  return <SignInModal isOpen={isOpen} onClose={handleClose} />;
}
