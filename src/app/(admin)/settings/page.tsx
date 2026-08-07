"use client";

import { useState, type FormEvent } from "react";
import { PageHeader } from "@/components/ui/Feedback";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { FormField, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

export default function SettingsPage() {
  const { user, updateProfile, changePassword } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const handleProfileSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    updateProfile({ name, email });
    setIsSavingProfile(false);
    showToast("Profile updated.");
  };

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords don't match.");
      return;
    }

    setIsSavingPassword(true);
    const result = await changePassword(currentPassword, newPassword);
    setIsSavingPassword(false);

    if (!result.ok) {
      setPasswordError(result.error ?? "Something went wrong.");
      return;
    }
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    showToast("Password updated.");
  };

  return (
    <div>
      <PageHeader title="Account settings" description="Manage your admin profile and login." />

      <div className="space-y-6">
        <Card>
          <CardHeader title="Profile" />
          <form onSubmit={handleProfileSubmit}>
            <CardBody className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar name={name || "Admin"} size="lg" />
                <div>
                  <p className="text-sm font-medium text-ink">{user?.role === "owner" ? "Owner" : "Editor"}</p>
                  <p className="text-xs text-ink-muted">Role is managed by the account owner</p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label="Full name" htmlFor="profile-name" required>
                  <Input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} required />
                </FormField>
                <FormField label="Email" htmlFor="profile-email" required>
                  <Input
                    id="profile-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </FormField>
              </div>
            </CardBody>
            <div className="flex justify-end border-t border-line px-5 py-3">
              <Button type="submit" isLoading={isSavingProfile}>
                Save profile
              </Button>
            </div>
          </form>
        </Card>

        <Card>
          <CardHeader title="Change password" />
          <form onSubmit={handlePasswordSubmit}>
            <CardBody className="space-y-4">
              {passwordError && (
                <p className="rounded-lg border border-coral-200 bg-coral-50 px-3 py-2 text-sm text-coral-700">
                  {passwordError}
                </p>
              )}
              <FormField label="Current password" htmlFor="current-password" required>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </FormField>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label="New password" htmlFor="new-password" required hint="At least 8 characters">
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </FormField>
                <FormField label="Confirm new password" htmlFor="confirm-password" required>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </FormField>
              </div>
            </CardBody>
            <div className="flex justify-end border-t border-line px-5 py-3">
              <Button type="submit" isLoading={isSavingPassword}>
                Update password
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
