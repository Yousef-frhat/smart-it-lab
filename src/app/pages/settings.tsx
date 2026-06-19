import { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/app/contexts/language-context";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import {
  User, Mail, Shield, Bell, Moon, Sun, Globe,
  Save, Key, Trash2, Camera, Loader2, Monitor,
} from "lucide-react";
import { useAuth } from "@/app/contexts/auth-context";
import { useTheme } from "@/app/contexts/theme-context";
import type { Theme } from "@/app/contexts/theme-context";
import api from "@/app/services/api";
import { toast } from "sonner";
import { Language } from '@/app/utils/translations';
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/app/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/app/components/ui/select";
import { Switch } from "@/app/components/ui/switch";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from "@/app/components/ui/alert-dialog";

export default function Settings() {
  const { user, updateUser } = useAuth();
  const { language: currentLanguage, setLanguage, t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Profile settings
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [bio, setBio] = useState("");
  
  // Password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [labReminders, setLabReminders] = useState(true);
  const [achievementAlerts, setAchievementAlerts] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(false);
  
  // Privacy settings
  const [profileVisible, setProfileVisible] = useState(true);
  const [showProgress, setShowProgress] = useState(true);
  const [showLeaderboard, setShowLeaderboard] = useState(true);

  // ── Load settings from backend ─────────────────────────────────
  useEffect(() => {
    api
      .get('/settings')
      .then((res) => {
        const s = res.data.data?.settings ?? res.data.data ?? {};
        const notifs = s.notifications ?? {};
        const priv = s.privacy ?? {};
        setEmailNotifications(notifs.email ?? true);
        setLabReminders(notifs.labReminders ?? true);
        setAchievementAlerts(notifs.achievements ?? true);
        setWeeklyReport(notifs.push ?? false);
        setTheme(s.theme || 'dark');
        setLanguage(s.language || 'en');
        setProfileVisible(priv.showProfile ?? true);
        setShowProgress(priv.showActivity ?? true);
        setShowLeaderboard(priv.showLeaderboard ?? true);
      })
      .catch(() => {
        // Settings might not exist yet, use defaults
      })
      .finally(() => setIsLoadingSettings(false));
  }, []);

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      await api.patch('/settings/profile', { name });
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    
    setIsLoading(true);
    try {
      await api.patch('/settings/password', {
        currentPassword,
        newPassword,
      });
      toast.success("Password changed successfully! Please log in again.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        localStorage.removeItem('accessToken');
        window.location.href = '/auth';
      }, 2000);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    setIsLoading(true);
    try {
      await api.patch('/settings', {
        notifications: {
          email: emailNotifications,
          push: weeklyReport,
          labReminders,
          achievements: achievementAlerts,
        },
      });
      toast.success("Notification preferences saved!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save notifications");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAppearance = async () => {
    setIsLoading(true);
    try {
      await api.patch('/settings', { theme, language: currentLanguage });
      setTheme(theme as Theme);
      toast.success("Appearance settings saved!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePrivacy = async () => {
    setIsLoading(true);
    try {
      await api.patch('/settings', {
        privacy: {
          showProfile: profileVisible,
          showLeaderboard,
          showActivity: showProgress,
        },
      });
      toast.success("Privacy settings saved!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save privacy settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await api.delete('/settings/account');
      toast.success("Account deleted successfully");
      setTimeout(() => {
        localStorage.removeItem('accessToken');
        window.location.href = '/';
      }, 1500);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete account");
    }
  };

  if (isLoadingSettings) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-[#3B82F6] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-[#94A3B8]">Manage your account preferences and privacy settings</p>
      </div>

      {/* Settings Tabs */}
      <Card className="bg-[#1E293B] border-[#334155]">
        <CardContent className="pt-6">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-[#0F172A] mb-6">
              <TabsTrigger value="profile">{t('profile')}</TabsTrigger>
              <TabsTrigger value="notifications">{t('notifications')}</TabsTrigger>
              <TabsTrigger value="appearance">{t('appearance')}</TabsTrigger>
              <TabsTrigger value="privacy">{t('privacy')}</TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <div className="flex items-center gap-6 pb-6 border-b border-[#334155]">
                <div
                  className="relative cursor-pointer group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Avatar className="w-24 h-24 bg-gradient-to-br from-[#3B82F6] to-[#00FF41]">
                    {(avatarPreview || user?.avatar) ? (
                      <AvatarImage src={avatarPreview || user?.avatar} alt={user?.name} />
                    ) : null}
                    <AvatarFallback className="bg-transparent text-white text-2xl font-semibold">
                      {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    {avatarUploading ? (
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                    ) : (
                      <Camera className="w-6 h-6 text-white" />
                    )}
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setAvatarPreview(URL.createObjectURL(file));
                    setAvatarUploading(true);
                    try {
                      const formData = new FormData();
                      formData.append("avatar", file);
                      const { data } = await api.patch("/settings/avatar", formData, {
                        headers: { "Content-Type": "multipart/form-data" },
                      });
                      const url = data.data?.avatarUrl ?? data.avatarUrl;
                      updateUser({ avatar: url });
                      setAvatarPreview(null);
                      toast.success("Avatar updated!");
                    } catch {
                      setAvatarPreview(null);
                      toast.error("Failed to upload avatar");
                    } finally {
                      setAvatarUploading(false);
                      e.target.value = "";
                    }
                  }}
                />
                <div>
                  <Button
                    className="bg-[#3B82F6] hover:bg-[#2563EB]"
                    disabled={avatarUploading}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {avatarUploading ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading...</>
                    ) : (
                      <><Camera className="w-4 h-4 mr-2" /> Upload Photo</>
                    )}
                  </Button>
                  <p className="text-sm text-[#94A3B8] mt-2">JPG, PNG or WebP. Max size 2MB.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-[#0F172A] border-[#334155]"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-[#0F172A] border-[#334155] font-mono"
                      placeholder="your.email@university.edu"
                      disabled
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full min-h-[100px] px-3 py-2 bg-[#0F172A] border border-[#334155] rounded-md text-white placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Account Type</Label>
                  <div className="flex items-center gap-2 p-3 bg-[#0F172A] border border-[#334155] rounded-md">
                    <Shield className="w-4 h-4 text-[#3B82F6]" />
                    <span className="text-sm">{user?.role === 'admin' ? 'Administrator' : 'Student Account'}</span>
                    {user?.plan && (
                      <>
                        <span className="text-[#94A3B8]">•</span>
                        <span className="text-sm text-[#00FF41] uppercase font-semibold">{user.plan} Plan</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button 
                  onClick={handleSaveProfile} 
                  disabled={isLoading}
                  className="bg-[#00FF41] hover:bg-[#00DD35] text-[#0F172A] font-semibold"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading ? t('saving') : t('saveChanges')}
                </Button>
              </div>

              {/* Password Change Section */}
              <div className="pt-6 border-t border-[#334155]">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Key className="w-5 h-5 text-[#F59E0B]" />
                  Change Password
                </h3>
                <div className="space-y-4 max-w-md">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="bg-[#0F172A] border-[#334155]"
                      placeholder="Enter current password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="bg-[#0F172A] border-[#334155]"
                      placeholder="Enter new password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="bg-[#0F172A] border-[#334155]"
                      placeholder="Confirm new password"
                    />
                  </div>
                  <Button 
                    onClick={handleChangePassword}
                    disabled={isLoading || !currentPassword || !newPassword}
                    className="bg-[#F59E0B] hover:bg-[#D97706] text-[#0F172A] font-semibold"
                  >
                    <Key className="w-4 h-4 mr-2" />
                    {isLoading ? "Changing..." : "Change Password"}
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-[#0F172A] border border-[#334155] rounded-lg">
                  <div className="flex items-start gap-3">
                    <Bell className="w-5 h-5 text-[#3B82F6] mt-0.5" />
                    <div>
                      <h4 className="font-semibold mb-1">Email Notifications</h4>
                      <p className="text-sm text-[#94A3B8]">Receive notifications via email</p>
                    </div>
                  </div>
                  <Switch 
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-[#0F172A] border border-[#334155] rounded-lg">
                  <div className="flex items-start gap-3">
                    <Bell className="w-5 h-5 text-[#F59E0B] mt-0.5" />
                    <div>
                      <h4 className="font-semibold mb-1">Lab Reminders</h4>
                      <p className="text-sm text-[#94A3B8]">Get reminded about incomplete labs</p>
                    </div>
                  </div>
                  <Switch 
                    checked={labReminders}
                    onCheckedChange={setLabReminders}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-[#0F172A] border border-[#334155] rounded-lg">
                  <div className="flex items-start gap-3">
                    <Bell className="w-5 h-5 text-[#00FF41] mt-0.5" />
                    <div>
                      <h4 className="font-semibold mb-1">Achievement Alerts</h4>
                      <p className="text-sm text-[#94A3B8]">Notifications when you unlock achievements</p>
                    </div>
                  </div>
                  <Switch 
                    checked={achievementAlerts}
                    onCheckedChange={setAchievementAlerts}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-[#0F172A] border border-[#334155] rounded-lg">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-[#8B5CF6] mt-0.5" />
                    <div>
                      <h4 className="font-semibold mb-1">Weekly Progress Report</h4>
                      <p className="text-sm text-[#94A3B8]">Receive a summary of your weekly progress</p>
                    </div>
                  </div>
                  <Switch 
                    checked={weeklyReport}
                    onCheckedChange={setWeeklyReport}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button 
                  onClick={handleSaveNotifications} 
                  disabled={isLoading}
                  className="bg-[#00FF41] hover:bg-[#00DD35] text-[#0F172A] font-semibold"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading ? t('saving') : t('savePreferences')}
                </Button>
              </div>
            </TabsContent>

            {/* Appearance Tab */}
            <TabsContent value="appearance" className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{t('theme')}</Label>
                  <Select value={theme} onValueChange={(val) => setTheme(val as Theme)}>
                    <SelectTrigger className="bg-[#0F172A] border-[#334155]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1E293B] border-[#334155]">
                      <SelectItem value="dark">
                        <div className="flex items-center gap-2">
                          <Moon className="w-4 h-4" />
                          Dark Mode
                        </div>
                      </SelectItem>
                      <SelectItem value="light">
                        <div className="flex items-center gap-2">
                          <Sun className="w-4 h-4" />
                          Light Mode
                        </div>
                      </SelectItem>
                      <SelectItem value="auto">
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4" />
                          System Default
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-[#94A3B8]">{t('chooseColorScheme')}</p>
                </div>

                <div className="space-y-2">
                  <Label>{t('language')}</Label>
                  <Select value={currentLanguage} onValueChange={(val) => setLanguage(val as Language)}>
                    <SelectTrigger className="bg-[#0F172A] border-[#334155]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1E293B] border-[#334155]">
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ar">العربية (Arabic)</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                      <SelectItem value="zh">中文 (Chinese)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-[#94A3B8]">{t('selectLanguage')}</p>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button 
                  onClick={handleSaveAppearance} 
                  disabled={isLoading}
                  className="bg-[#00FF41] hover:bg-[#00DD35] text-[#0F172A] font-semibold"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading ? t('saving') : t('saveSettings')}
                </Button>
              </div>
            </TabsContent>

            {/* Privacy Tab */}
            <TabsContent value="privacy" className="space-y-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-[#0F172A] border border-[#334155] rounded-lg">
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-[#3B82F6] mt-0.5" />
                    <div>
                      <h4 className="font-semibold mb-1">Public Profile</h4>
                      <p className="text-sm text-[#94A3B8]">Make your profile visible to other users</p>
                    </div>
                  </div>
                  <Switch 
                    checked={profileVisible}
                    onCheckedChange={setProfileVisible}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-[#0F172A] border border-[#334155] rounded-lg">
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-[#00FF41] mt-0.5" />
                    <div>
                      <h4 className="font-semibold mb-1">Show Progress</h4>
                      <p className="text-sm text-[#94A3B8]">Display your lab progress to others</p>
                    </div>
                  </div>
                  <Switch 
                    checked={showProgress}
                    onCheckedChange={setShowProgress}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-[#0F172A] border border-[#334155] rounded-lg">
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-[#F59E0B] mt-0.5" />
                    <div>
                      <h4 className="font-semibold mb-1">Appear on Leaderboard</h4>
                      <p className="text-sm text-[#94A3B8]">Show your ranking on the leaderboard</p>
                    </div>
                  </div>
                  <Switch 
                    checked={showLeaderboard}
                    onCheckedChange={setShowLeaderboard}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button 
                  onClick={handleSavePrivacy} 
                  disabled={isLoading}
                  className="bg-[#00FF41] hover:bg-[#00DD35] text-[#0F172A] font-semibold"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading ? t('saving') : t('saveSettings')}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="bg-[#1E293B] border-[#EF4444]">
        <CardHeader>
          <CardTitle className="text-[#EF4444]">{t('dangerZone')}</CardTitle>
          <CardDescription className="text-[#94A3B8]">
            {t('dangerZoneDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-[#0F172A] border border-[#334155] rounded-lg">
            <div>
              <h4 className="font-semibold mb-1">Delete Account</h4>
              <p className="text-sm text-[#94A3B8]">Permanently delete your account and all data</p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="bg-[#EF4444] hover:bg-[#DC2626]">
                  <Trash2 className="w-4 h-4 mr-2" />
                  {t('deleteAccount')}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-[#1E293B] border-[#334155]">
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription className="text-[#94A3B8]">
                    This action cannot be undone. This will permanently delete your account
                    and remove all your data from our servers including:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>All lab progress and scores</li>
                      <li>Achievements and badges</li>
                      <li>Leaderboard rankings</li>
                      <li>Personal settings and preferences</li>
                    </ul>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-[#0F172A] border-[#334155] hover:bg-[#334155]">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDeleteAccount}
                    className="bg-[#EF4444] hover:bg-[#DC2626]"
                  >
                    Yes, Delete My Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}