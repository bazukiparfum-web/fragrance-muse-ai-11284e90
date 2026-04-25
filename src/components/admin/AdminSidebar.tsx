import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Layers,
  Beaker,
  Database,
  Tag,
  HelpCircle,
  ShoppingBag,
  Factory,
  MessageSquare,
  Star,
  Users,
  FlaskConical,
} from 'lucide-react';
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
} from '@/components/ui/sidebar';

const groups = [
  {
    label: 'Overview',
    items: [{ title: 'Dashboard', url: '/admin/dashboard', icon: LayoutDashboard }],
  },
  {
    label: 'Catalog',
    items: [
      { title: 'Notes', url: '/admin/notes', icon: Layers },
      { title: 'Ingredients', url: '/admin/ingredients', icon: Beaker },
      { title: 'Rules', url: '/admin/rules', icon: Database },
      { title: 'Scents', url: '/admin/scents', icon: Tag },
      { title: 'Questions', url: '/admin/questions', icon: HelpCircle },
    ],
  },
  {
    label: 'Operations',
    items: [
      { title: 'Orders', url: '/admin/orders', icon: ShoppingBag },
      { title: 'Production Queue', url: '/admin/production-queue', icon: Factory },
      { title: 'Consultations', url: '/admin/consultations', icon: MessageSquare },
      { title: 'Reviews', url: '/admin/reviews', icon: Star },
    ],
  },
  {
    label: 'Access',
    items: [{ title: 'Users & Roles', url: '/admin/users', icon: Users }],
  },
  {
    label: 'Tools',
    items: [{ title: 'Manual Testing', url: '/admin/testing', icon: FlaskConical }],
  },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        {groups.map((group) => (
          <SidebarGroup key={group.label}>
            {!collapsed && <SidebarGroupLabel>{group.label}</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const active =
                    location.pathname === item.url ||
                    (item.url === '/admin/dashboard' && location.pathname === '/admin');
                  return (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton asChild isActive={active}>
                        <NavLink to={item.url} end>
                          <item.icon className="h-4 w-4" />
                          {!collapsed && <span>{item.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
