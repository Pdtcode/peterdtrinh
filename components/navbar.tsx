"use client";

import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
} from "@heroui/navbar";
import NextLink from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import clsx from "clsx";

import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";

export const Navbar = () => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <HeroUINavbar
      classNames={{
        base: "border-b border-line bg-paper/80 backdrop-blur-md",
        wrapper: "px-6 sm:px-8 max-w-7xl",
      }}
      isMenuOpen={isMenuOpen}
      maxWidth="xl"
      position="sticky"
      onMenuOpenChange={setIsMenuOpen}
    >
      <NavbarContent className="basis-auto" justify="start">
        <NavbarBrand className="max-w-fit">
          <NextLink
            className="flex items-center gap-2.5 group"
            href="/"
            onClick={() => setIsMenuOpen(false)}
          >
            <Image
              alt=""
              className="rounded-md"
              height={36}
              src="/duck.png"
              width={36}
            />
            <span className="font-display text-lg leading-none text-ink transition-colors group-hover:text-accent">
              Peter Đ. Trinh
            </span>
          </NextLink>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden lg:flex gap-7" justify="center">
        {siteConfig.navItems.map((item) => (
          <NavbarItem key={item.href} isActive={isActive(item.href)}>
            <NextLink
              className={clsx(
                "link-underline font-mono text-xs uppercase tracking-label transition-colors",
                isActive(item.href)
                  ? "text-accent"
                  : "text-muted hover:text-ink",
              )}
              href={item.href}
            >
              {item.label}
            </NextLink>
          </NavbarItem>
        ))}
      </NavbarContent>

      <NavbarContent className="basis-auto gap-4" justify="end">
        <ThemeSwitch />

        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="lg:hidden text-ink"
        />
      </NavbarContent>

      <NavbarMenu className="bg-paper/95 backdrop-blur-md pt-8">
        <div className="flex flex-col gap-1">
          {siteConfig.navMenuItems.map((item) => (
            <NavbarMenuItem key={item.href} isActive={isActive(item.href)}>
              <NextLink
                className={clsx(
                  "block py-2 text-2xl font-semibold tracking-tight transition-colors",
                  isActive(item.href)
                    ? "text-accent"
                    : "text-ink hover:text-accent",
                )}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </NextLink>
            </NavbarMenuItem>
          ))}
        </div>
      </NavbarMenu>
    </HeroUINavbar>
  );
};
