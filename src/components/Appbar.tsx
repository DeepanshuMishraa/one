'use client';

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuContent,
  ListItem,
} from '@/components/ui/navigation-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import {
  IconBrandGithub,
  IconBrandTwitter,
  IconBrandLinkedin,
  IconBrandDiscord
} from '@tabler/icons-react';
import Image from 'next/image';

const resources = [
  {
    title: 'GitHub',
    href: 'https://github.com/DeepanshuMishraa/one',
    description: 'Check out our open-source projects and contributions.',
    platform: 'github' as const,
  },
  {
    title: 'Twitter',
    href: 'https://x.com/Deepanshudipxsy',
    description: 'Follow us for the latest updates and announcements.',
    platform: 'twitter' as const,
  },
  {
    title: 'LinkedIn',
    href: 'https://www.linkedin.com/in/deepanshum',
    description: 'Connect with us professionally and stay updated.',
    platform: 'linkedin' as const,
  },
  {
    title: 'Discord',
    href: 'https://discord.gg/@dipxsy',
    description: 'Join our community and chat with the team.',
    platform: 'discord' as const,
  },
];

const aboutLinks = [
  {
    title: 'About',
    href: '/about',
    description: 'Learn more about One and our mission.',
  },
  {
    title: 'Privacy',
    href: '/privacy',
    description: 'Read our privacy policy and data handling practices.',
  },
  {
    title: 'Terms of Service',
    href: '/terms',
    description: 'Review our terms of service and usage guidelines.',
  },
];

export default function Appbar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop Navigation - Hidden on mobile */}
      <header className="fixed z-50 hidden w-full items-center justify-center px-4 pt-6 md:flex">
        <nav className="border-input/50 bg-popover flex w-full max-w-3xl items-center justify-between gap-2 rounded-xl border-t p-2 px-4">
          <div className="flex items-center gap-6">
            <a href="/" className="flex h-[40px] items-center justify-center">
              <Image src="/logo.svg" alt="One" width={35} height={35} priority className="object-contain" />
            </a>
            <NavigationMenu className="flex items-center">
              <NavigationMenuList className="gap-1">
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent">Company</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-1 lg:w-[600px]">
                      {aboutLinks.map((link) => (
                        <ListItem key={link.title} title={link.title} href={link.href}>
                          {link.description}
                        </ListItem>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent">Resources</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                      {resources.map((resource) => (
                        <ListItem
                          key={resource.title}
                          title={resource.title}
                          href={resource.href}
                          platform={resource.platform}
                        >
                          {resource.description}
                        </ListItem>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
          <div className="flex gap-2">
            <a href="/login">
              <Button variant="ghost" className="h-8">
                Sign in
              </Button>
            </a>
            <Link target="_blank" prefetch href="/contact">
              <Button className="h-8 font-medium">Contact Us</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Mobile Navigation Sheet */}
      <div className="md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="fixed left-4 top-6 z-50">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] bg-[#111111] sm:w-[400px]">
            <SheetHeader className="flex flex-row items-center justify-between">
              <SheetTitle>
                <Image src="/logo.svg" alt="One" width={35} height={35} className="object-contain" />
              </SheetTitle>
              <a href="/login">
                <Button variant="outline" className="w-24">Sign in</Button>
              </a>
            </SheetHeader>
            <div className="mt-8 flex flex-col space-y-4">
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground">Company</h4>
                {aboutLinks.map((link) => (
                  <a
                    key={link.title}
                    href={link.href}
                    className="block py-2 text-sm font-medium hover:text-primary"
                  >
                    {link.title}
                  </a>
                ))}
              </div>
              <Link
                target="_blank"
                prefetch
                href="/contact"
                className="block py-2 text-sm font-medium hover:text-primary"
              >
                Contact Us
              </Link>
            </div>
            <Separator className="my-8" />
            <div className="flex flex-row items-center justify-center gap-8">
              {resources.map((resource) => (
                <Link
                  key={resource.title}
                  href={resource.href}
                  target="_blank"
                  className="flex items-center hover:opacity-80 transition-opacity"
                >
                  {resource.platform === 'github' && <IconBrandGithub className="w-6 h-6 opacity-75 hover:opacity-100" />}
                  {resource.platform === 'twitter' && <IconBrandTwitter className="w-6 h-6 opacity-75 hover:opacity-100" />}
                  {resource.platform === 'linkedin' && <IconBrandLinkedin className="w-6 h-6 opacity-75 hover:opacity-100" />}
                  {resource.platform === 'discord' && <IconBrandDiscord className="w-6 h-6 opacity-75 hover:opacity-100" />}
                </Link>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
