import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { updateMe, changePassword } from "../../services/userService";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Alert from "../../components/common/Alert";
import Card from "../../components/common/Card";
import { getErrorMessage } from "../../utils/helpers";

export default function AccountPage() {
  const { user, isAuthenticated, setUser, logout } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [profileMsg, setProfileMsg] = useState("");
  const [profileError, setProfileError] = useState("");
  const [saving, setSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passMsg, setPassMsg] = useState("");
  const [passError, setPassError] = useState("");
  const [updating, setUpdating] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
          Profile
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Please sign in to view your profile.
        </p>
        <Link
          to="/sign-in"
          className="inline-block px-6 py-3 text-sm font-medium text-white bg-lagoon-gradient rounded-lg hover:opacity-90"
        >
          Sign in
        </Link>
      </div>
    );
  }

  const handleProfile = async (e) => {
    e.preventDefault();
    setProfileMsg("");
    setProfileError("");
    setSaving(true);
    try {
      const res = await updateMe({ name, email });
      setUser(res.data);
      setProfileMsg("Profile updated");
    } catch (err) {
      setProfileError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    setPassMsg("");
    setPassError("");
    if (newPassword !== confirmPassword) {
      setPassError("Passwords do not match");
      return;
    }
    setUpdating(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setPassMsg("Password changed");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      logout();
      navigate("/sign-in");
    } catch (err) {
      setPassError(getErrorMessage(err));
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">
        Profile
      </h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
        Manage your account details.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <form onSubmit={handleProfile} className="space-y-4">
          <Card shape="lg" className="space-y-4">
            <h2 className="text-lg font-semibold">Account details</h2>
            {profileMsg && <Alert type="success">{profileMsg}</Alert>}
            {profileError && <Alert>{profileError}</Alert>}
            <Input id="acct-name" label="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
            <Input id="acct-email" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Button type="submit" loading={saving}>Save Changes</Button>
          </Card>
        </form>

        <form onSubmit={handlePassword} className="space-y-4">
          <Card shape="lg" className="space-y-4">
            <h2 className="text-lg font-semibold">Change password</h2>
            {passMsg && <Alert type="success">{passMsg}</Alert>}
            {passError && <Alert>{passError}</Alert>}
            <Input id="acct-cur" label="Current Password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required autoComplete="current-password" />
            <Input id="acct-new" label="New Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} autoComplete="new-password" />
            <Input id="acct-conf" label="Confirm New Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required autoComplete="new-password" />
            <Button type="submit" loading={updating}>Update Password</Button>
          </Card>
        </form>
      </div>
    </div>
  );
}