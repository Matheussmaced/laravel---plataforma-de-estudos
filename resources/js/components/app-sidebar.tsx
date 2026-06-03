import { Link } from '@inertiajs/react';
import { BookMarked, FolderGit2, Github, GraduationCap, LayoutList, Layers, User2 } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { guide, learn, reference, starter } from '@/routes';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Aprender',
        href: learn(),
        icon: GraduationCap,
    },
    {
        title: 'Referência',
        href: reference(),
        icon: BookMarked,
    },
    {
        title: 'Guia API CRUD',
        href: guide(),
        icon: LayoutList,
    },
    {
        title: 'Como funciona',
        href: starter(),
        icon: Layers,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Linkedin',
        href: 'https://www.linkedin.com/in/matheusgregoriodev/',
        icon: User2,
    },
    {
        title: 'GitHub',
        href: 'https://github.com/Matheussmaced',
        icon: Github,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="floating">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={learn()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
