"use client";

import { useState } from "react";
import {
  Trophy,
  Users,
  Calendar,
  Music,
  Palette,
  Zap,
  Star,
  Search,
  Plus,
  Dumbbell,
  Flag,
  ArrowRight,
  Dribbble,
  TrendingUp,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const mockClubs = [
  {
    id: "1",
    name: "Robotics & AI Society",
    category: "Technology",
    members: 42,
    activity: "Autonomous Drone Build",
    icon: Zap,
    color: "blue",
  },
  {
    id: "2",
    name: "Elite Chess Vanguard",
    category: "Strategy",
    members: 28,
    activity: "Grandmaster Invitational",
    icon: Star,
    color: "indigo",
  },
  {
    id: "3",
    name: "Neural Arts Collective",
    category: "Creative",
    members: 35,
    activity: "Metaverse Gallery Setup",
    icon: Palette,
    color: "purple",
  },
  {
    id: "4",
    name: "Institutional Orchestra",
    category: "Arts",
    members: 56,
    activity: "Annual Winter Concerto",
    icon: Music,
    color: "teal",
  },
];

const upcomingFixtures = [
  {
    id: "101",
    team: "EduSmart Lions (Varsity)",
    opponent: "Green-Valley High",
    sport: "Basketball",
    venue: "North Court",
    time: "Friday, 04:00 PM",
  },
  {
    id: "102",
    team: "Soccer Vanguard",
    opponent: "St. Jude Acad.",
    sport: "Football",
    venue: "Institutional Field",
    time: "Saturday, 10:00 AM",
  },
];

export default function ExtracurricularPulse() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-x-4">
          <div className="h-14 w-14 rounded-2xl bg-yellow-500 border border-white/10 flex items-center justify-center text-white shadow-lg shadow-yellow-200">
            <Trophy className="h-7 w-7" />
          </div>
          <div>
            <h2 className="text-4xl font-black tracking-tight text-slate-900">
              The Activity Pulse
            </h2>
            <p className="text-slate-500 font-medium tracking-tight">
              Orchestrating the Creative & Athletic Life of the Institution
            </p>
          </div>
        </div>
        <div className="flex gap-x-3">
          <Button
            variant="outline"
            className="rounded-2xl border-slate-200 bg-white font-bold gap-x-2"
          >
            <Calendar className="h-4 w-4" />
            Hall Bookings
          </Button>
          <Button className="rounded-2xl bg-slate-900 text-white font-bold gap-x-2 neon-blue">
            <Plus className="h-4 w-4" />
            Found Society
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="border-none glass futuristic-card p-6 bg-slate-900 text-white overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Users className="h-24 w-24 text-blue-400" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">
            Club Participation
          </p>
          <h3 className="text-3xl font-black mt-2 text-white">82%</h3>
          <div className="mt-4 flex items-center gap-x-2 text-xs font-bold text-blue-300">
            Active in 1+ Societies
          </div>
        </Card>

        <Card className="border-none glass futuristic-card p-6 border-yellow-100 bg-yellow-50/10">
          <p className="text-[10px] font-black uppercase tracking-widest text-yellow-600">
            Institutional Trophies
          </p>
          <h3 className="text-3xl font-black mt-2 text-slate-900">42</h3>
          <div className="mt-4 flex items-center gap-x-2 text-xs font-bold text-yellow-600">
            Current Term Wins: 05
          </div>
        </Card>

        <Card className="border-none glass futuristic-card p-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Total Societies
          </p>
          <h3 className="text-3xl font-black mt-2 text-slate-900">24</h3>
          <div className="mt-4 flex items-center gap-x-2 text-xs font-bold text-slate-400">
            4 Tier-1 Chapters
          </div>
        </Card>

        <Card className="border-none glass futuristic-card p-6 border-blue-100">
          <p className="text-[10px] font-black uppercase tracking-widest text-blue-500">
            Event Budget
          </p>
          <h3 className="text-3xl font-black mt-2 text-slate-900">$12,500</h3>
          <div className="mt-4 flex items-center gap-x-2 text-xs font-bold text-blue-400">
            Utilized: 64%
          </div>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Societies Explorer */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-x-2">
              <Flag className="h-4 w-4" />
              Society Directory
            </h3>
            <div className="relative w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search clubs & societies..."
                className="pl-9 rounded-xl h-10 text-xs"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {mockClubs.map((club) => (
              <Card
                key={club.id}
                className="border-none glass futuristic-card p-6 group cursor-pointer hover:bg-white transition-all hover:shadow-xl"
              >
                <div className="flex justify-between items-start mb-6">
                  <div
                    className={cn(
                      "h-14 w-14 rounded-2xl flex items-center justify-center transition-all group-hover:rotate-12",
                      club.color === "blue"
                        ? "bg-blue-50 text-blue-500"
                        : club.color === "indigo"
                          ? "bg-indigo-50 text-indigo-500"
                          : club.color === "purple"
                            ? "bg-purple-50 text-purple-500"
                            : "bg-teal-50 text-teal-500",
                    )}
                  >
                    <club.icon className="h-7 w-7" />
                  </div>
                  <Badge
                    variant="ghost"
                    className="text-[10px] font-black uppercase text-slate-400 border-none px-0"
                  >
                    {club.members} MEMBERS
                  </Badge>
                </div>
                <h4 className="text-xl font-black text-slate-900 mb-1 leading-tight">
                  {club.name}
                </h4>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">
                  {club.category}
                </p>
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 group-hover:bg-white transition-colors">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">
                      Current Active Phase
                    </p>
                    <p className="text-xs font-bold text-slate-900 line-clamp-1">
                      {club.activity}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    className="w-full text-blue-500 font-black text-[10px] uppercase tracking-widest justify-start p-0 h-auto gap-x-2"
                  >
                    VIEW MEMBERSHIP <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Athletic Intelligence */}
        <div className="space-y-6">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-x-2">
            <Dumbbell className="h-4 w-4 text-slate-900" />
            Athletic Fixtures
          </h3>

          <Card className="border-none glass futuristic-card overflow-hidden">
            <CardHeader className="bg-slate-900 text-white p-6">
              <CardTitle className="text-xs font-black uppercase tracking-[0.2em] opacity-60">
                Upcoming Challenges
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {upcomingFixtures.map((fix) => (
                  <div
                    key={fix.id}
                    className="p-5 space-y-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-x-3">
                      <div className="h-10 w-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                        <Trophy className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-black text-slate-900 text-sm tracking-tight">
                          {fix.team}
                        </h4>
                        <p className="text-[10px] font-bold text-slate-400">
                          VS {fix.opponent}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-400 uppercase">
                          Sport / Venue
                        </span>
                        <span className="text-[11px] font-bold text-slate-900">
                          {fix.sport} • {fix.venue}
                        </span>
                      </div>
                      <Badge className="bg-blue-50 text-blue-600 border-none text-[8px] font-black">
                        HOME GAME
                      </Badge>
                    </div>
                    <Button className="w-full h-10 rounded-xl bg-white border border-slate-100 hover:bg-slate-50 text-slate-900 font-black text-[10px] uppercase tracking-widest shadow-none">
                      LIVE TELEMETRY
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="p-4 bg-slate-50 flex flex-col gap-y-2 border-t border-slate-100">
              <p className="text-[10px] text-slate-400 font-medium text-center italic leading-tight">
                Athletic rosters are auto-synced with academic performance
                eligibility.
              </p>
            </CardFooter>
          </Card>

          <Card className="border-none glass futuristic-card p-6">
            <CardHeader className="p-0 mb-4 flex items-center justify-between">
              <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-400">
                Participation Analytics
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase">
                  <span className="text-slate-400">
                    Creative Hub utilization
                  </span>
                  <span className="text-slate-900">92%</span>
                </div>
                <Progress
                  value={92}
                  className="h-1.5"
                  indicatorClassName="bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase">
                  <span className="text-slate-400">Athletic Engagement</span>
                  <span className="text-slate-900">65%</span>
                </div>
                <Progress
                  value={65}
                  className="h-1.5"
                  indicatorClassName="bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
