import { NavLink, useLocation } from "react-router-dom";
import { Home, ListTodo, Search, Settings } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { title: "Home", url: "/", icon: Home },
  { title: "Lists", url: "/lists", icon: ListTodo },
  { title: "Search", url: "/search", icon: Search },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state, isMobile, setOpenMobile } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) =>
    path === "/" ? currentPath === path : currentPath.startsWith(path);

  return (
    <Sidebar collapsible="icon" className={state === "collapsed" ? "w-14" : "w-60"}>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>TaskFlow</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink to={item.url} end={item.url === "/"} onClick={() => { if (isMobile) setOpenMobile(false); }}>
                      <item.icon className="mr-2 h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
