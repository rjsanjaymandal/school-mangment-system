"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

import { User } from "@supabase/supabase-js";
import { Bell } from "lucide-react";
import { LiveCollectionPill } from "@/components/finance/LiveCollectionPill";
import { GlobalSearch } from "@/components/search/GlobalSearch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/ui/breadcrumb";

interface NavbarProps {
  user: User | null;
  userRole?: string | null;
}

export function Navbar({ user, userRole }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const role = userRole || "student";
  
  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const pathSegments = pathname.split("/").filter(Boolean);
  const breadcrumbs = pathSegments.map((segment, index) => {
    const href = "/" + pathSegments.slice(0, index + 1).join("/");
    const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
    return {
      label,
      href: index < pathSegments.length - 1 ? href : undefined,
    };
  });

  return (
    <header className="h-16 border-b border-slate-200 bg-white/95 backdrop-blur-sm flex items-center justify-between px-6 fixed top-0 right-0 left-0 md:left-64 z-50 shadow-sm">
      <div className="flex-1">
        <Breadcrumb items={breadcrumbs} />
      </div>

      <div className="flex items-center gap-4">
        <LiveCollectionPill />
        <GlobalSearch />
        
        <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-md">
          <Bell className="h-4 w-4 text-slate-500" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-9 w-9 p-0 rounded-md overflow-hidden">
              <Avatar className="h-9 w-9">
                <AvatarImage src="" alt="User" />
                <AvatarFallback className="bg-slate-900 text-white text-sm">
                  {user?.email?.toLowerCase().startsWith('r') ? 'S' : (user?.email?.charAt(0).toUpperCase() || 'U')}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" sideOffset={4}>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/profile")}>
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/settings")}>
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600"
              onClick={handleSignOut}
            >
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}