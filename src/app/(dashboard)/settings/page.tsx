"use client";

import { useState, useEffect } from "react";
import {
  User,
  Settings as SettingsIcon,
  Shield,
  Bell,
  Palette,
  Globe,
  Save,
  RefreshCw,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { UserService } from "@/lib/services/user";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const data = await UserService.getCurrentProfile();
      if (data && !("error" in data)) {
        setProfile(data);
      }
      setLoading(false);
    }
    loadProfile();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const first_name = formData.get("firstName") as string;
    const last_name = formData.get("lastName") as string;

    setSaving(true);
    const res = await UserService.updateProfile({ first_name, last_name });

    if (res && !("error" in res)) {
      toast.success("Profile updated successfully");
      setProfile(res);
    } else {
      toast.error("Failed to update profile");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700 pb-20">
      <div>
        <h2 className="text-4xl font-black tracking-tight text-slate-900">
          User Preferences
        </h2>
        <p className="text-slate-500 font-medium tracking-tight">
          Manage your account identity, security, and global system
          configurations.
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="bg-transparent h-auto p-0 gap-x-4 mb-8 flex-wrap justify-start">
          <TabsTrigger
            value="profile"
            className="rounded-2xl px-6 py-3 font-bold border-b-2 border-transparent data-[state=active]:border-slate-900 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
          >
            <User className="h-4 w-4 mr-2" />
            Identity
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="rounded-2xl px-6 py-3 font-bold border-b-2 border-transparent data-[state=active]:border-slate-900 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
          >
            <Shield className="h-4 w-4 mr-2" />
            Security & Access
          </TabsTrigger>
          <TabsTrigger
            value="preferences"
            className="rounded-2xl px-6 py-3 font-bold border-b-2 border-transparent data-[state=active]:border-slate-900 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
          >
            <Palette className="h-4 w-4 mr-2" />
            Preferences
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-2 border-none glass futuristic-card bg-white/40 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-xl font-bold">
                  Personal Profile
                </CardTitle>
                <CardDescription>
                  Update your public identity details.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="firstName"
                        className="text-xs font-black uppercase tracking-widest text-slate-400"
                      >
                        First Name
                      </Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        defaultValue={profile?.first_name}
                        className="rounded-xl border-white/20 bg-white/50 focus:ring-slate-900"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="lastName"
                        className="text-xs font-black uppercase tracking-widest text-slate-400"
                      >
                        Last Name
                      </Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        defaultValue={profile?.last_name}
                        className="rounded-xl border-white/20 bg-white/50 focus:ring-slate-900"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-xs font-black uppercase tracking-widest text-slate-400"
                    >
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      defaultValue={profile?.email}
                      disabled
                      className="rounded-xl border-white/20 bg-slate-100/50 cursor-not-allowed"
                    />
                    <p className="text-[10px] text-slate-400 font-medium italic">
                      Contact your administrator to change your primary email.
                    </p>
                  </div>
                  <Button
                    type="submit"
                    disabled={saving}
                    className="rounded-2xl bg-slate-900 text-white font-bold h-12 px-8 neon-blue hover:scale-[1.02] transition-transform"
                  >
                    {saving ? (
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Commit Changes
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="border-none glass futuristic-card bg-slate-900 text-white flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-linear-to-br from-blue-500/10 to-transparent pointer-events-none" />
              <div className="h-24 w-24 rounded-3xl bg-linear-to-br from-blue-600 to-purple-600 flex items-center justify-center text-4xl font-black mb-6 shadow-2xl relative z-10">
                {profile?.first_name?.[0]}
                {profile?.last_name?.[0]}
              </div>
              <h3 className="text-xl font-bold relative z-10">
                {profile?.first_name} {profile?.last_name}
              </h3>
              <Badge
                variant="futuristic"
                className="mt-2 text-blue-400 border-blue-400/20 bg-blue-500/10 uppercase font-black relative z-10"
              >
                {profile?.role}
              </Badge>
              <p className="mt-4 text-xs text-slate-400 font-medium opacity-60 relative z-10">
                Member since{" "}
                {new Date(profile?.created_at).toLocaleDateString()}
              </p>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-none glass futuristic-card bg-white/40 shadow-2xl">
              <CardHeader>
                <div className="flex items-center gap-x-2">
                  <ShieldCheck className="h-5 w-5 text-green-500" />
                  <CardTitle className="text-lg font-bold">
                    Two-Factor Authentication
                  </CardTitle>
                </div>
                <CardDescription>
                  Add an extra layer of protection to your account.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-x-3">
                    <Smartphone className="h-5 w-5 text-slate-400" />
                    <div className="text-sm">
                      <p className="font-bold text-slate-900">
                        SMS Authentication
                      </p>
                      <p className="text-xs text-slate-500">Not configured</p>
                    </div>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>

            <Card className="border-none glass futuristic-card bg-white/40 shadow-2xl">
              <CardHeader>
                <div className="flex items-center gap-x-2">
                  <Bell className="h-5 w-5 text-blue-500" />
                  <CardTitle className="text-lg font-bold">
                    Security Alerts
                  </CardTitle>
                </div>
                <CardDescription>
                  Get notified about suspicious activity.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-x-3">
                    <Globe className="h-5 w-5 text-slate-400" />
                    <div className="text-sm">
                      <p className="font-bold text-slate-900">
                        New Sign-in Alerts
                      </p>
                      <p className="text-xs text-slate-500">
                        Notify me on new device login
                      </p>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card className="border-none glass futuristic-card bg-white/40 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-xl font-bold">
                System Preferences
              </CardTitle>
              <CardDescription>
                Configure how the system behaves for your session.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-bold">
                      Dark Orchestration Mode
                    </Label>
                    <p className="text-xs text-slate-500">
                      Enable high-contrast neural interface.
                    </p>
                  </div>
                  <Switch />
                </div>
                <Separator className="bg-slate-100" />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-bold">
                      Neural Insights Fallback
                    </Label>
                    <p className="text-xs text-slate-500">
                      Show legacy analytics when neural engine is processing.
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
