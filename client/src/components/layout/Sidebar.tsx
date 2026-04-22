import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Bot, Plus, CreditCard, LogOut, MessageSquare } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { useClerk } from "@clerk/clerk-react";
import { useUser as useAppUser } from "../../hooks/useUser";
import { cn } from "../../utils/helpers";

const Sidebar: React.FC = () => {
  const { user } = useUser();
  const { signOut } = useClerk();
  const location = useLocation();
  const { useProfileQuery } = useAppUser();
  const { data: profile, isLoading: profileLoading } = useProfileQuery();

  const sections = [
    {
      title: "BOTS",
      items: [
        { icon: Bot, label: "My Bots", path: "/dashboard" },
        { icon: Plus, label: "New Bot", path: "/bots/new" },
      ],
    },
    {
      title: "ACCOUNT",
      items: [{ icon: CreditCard, label: "Billing", path: "/billing" }],
    },
  ];

  return (
    <aside className="w-72 bg-sidebar border-r border-sidebar-border hidden md:flex flex-col h-full">
      {/* Header */}
      <div className="p-8 flex items-center gap-3">
        <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center shadow-lg shadow-brand/20">
          <MessageSquare className="text-primary-foreground w-6 h-6" />
        </div>
        <span className="text-xl font-extrabold text-sidebar-foreground tracking-tight">
          SupportBot
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-2 space-y-8 overflow-y-auto mt-4">
        {sections.map((section) => (
          <div key={section.title} className="space-y-3">
            <h3 className="px-4 text-[10px] font-black text-sidebar-foreground/40 uppercase tracking-widest leading-none">
              {section.title}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => {
                return (
                  <NavLink
                    key={item.label}
                    to={item.path}
                    className={({ isActive: linkActive }) =>
                      cn(
                        "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all group",
                        linkActive
                          ? "bg-sidebar-accent text-sidebar-foreground shadow-sm"
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground",
                      )
                    }
                  >
                    <item.icon
                      className={cn(
                        "w-5 h-5 transition-transform group-hover:scale-110",
                        item.path === location.pathname
                          ? "text-sidebar-primary"
                          : "",
                      )}
                    />
                    {item.label}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 space-y-4">
        {/* Plan Information */}
        <div
          className={cn(
            "rounded-2xl p-4 border transition-all duration-500",
            profile?.plan === "free"
              ? "bg-warning-bg border-warning/20 text-warning"
              : "bg-sidebar-accent border-sidebar-border",
          )}
        >
          <p
            className={cn(
              "text-[11px] font-black uppercase tracking-wider mb-2",
              profile?.plan === "free"
                ? "text-warning"
                : "text-sidebar-primary",
            )}
          >
            CURRENT PLAN
          </p>

          {profileLoading ? (
            <div className="space-y-2 animate-shimmer h-12 rounded-lg"></div>
          ) : (
            <div className="flex items-center justify-between">
              <p
                className={cn(
                  "text-sm font-bold capitalize",
                  profile?.plan === "free"
                    ? "text-warning"
                    : "text-sidebar-foreground",
                )}
              >
                {profile?.plan || "Free"} Plan
              </p>
              <span
                className={cn(
                  "text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-tight",
                  profile?.plan === "free"
                    ? "bg-warning/10 text-warning"
                    : "bg-sidebar-primary/10 text-sidebar-primary",
                )}
              >
                {profile?.usage.bots}/{profile?.limits.bots} BOTS
              </span>
            </div>
          )}
        </div>

        {/* Profile Card */}
        <div className="flex items-center gap-3 p-3 bg-sidebar-accent/50 rounded-2xl border border-sidebar-border group">
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm border-2 border-background">
            <img
              src={user?.imageUrl}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black text-sidebar-foreground truncate leading-tight">
              {user?.fullName || "User"}
            </p>
            <p className="text-[10px] font-bold text-sidebar-foreground/40 truncate tracking-tight">
              {user?.primaryEmailAddress?.emailAddress}
            </p>
          </div>
          <button
            onClick={() => signOut()}
            className="p-2 text-sidebar-foreground/40 hover:text-danger hover:bg-danger-bg rounded-xl transition-all"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
