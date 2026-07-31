"use client";
import React, { FC } from "react";
// import logo from "@/app/assets/logo.jpg";
// import menu from "@/app/assets/menu.svg";
// import profilePic from "@/app/assets/profile-pic.svg";
// import arrowDown from "@/app/assets/arrow-down.svg";
// import arrowUp from "@/app/assets/arrow-up.svg";
// import Image from "next/image";
// import Link from "next/link";
// import DisconnectModal from "./DisconnectModal";
// import SideNav from "@/components/SideNav";
import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { LogOut, Settings } from "lucide-react";
import { useToast } from "@/hooks/useToast";

interface IProps {
  className?: string;
}

const Navbar: FC<IProps> = ({ className }: IProps) => {
  // const [disconnectModal, setDisconnectModal] = useState(false);

  // const toggleDisconnectModal = () => setDisconnectModal(!disconnectModal);

  // const [navOpen, setNavOpen] = useState(false);

  // const toggleNav = () => {
  //   setNavOpen(!navOpen);
  // };
  const router = useRouter();
  const { toast } = useToast();
  const pathname = usePathname();

  const isAdminPage = pathname === "/admin";
  const isSigninPage = pathname === "/signin";
  const isSignupPage = pathname === "/signup";

  const handleLogout = () => {
    localStorage.clear();
    toast({
      title: "Logged out",
      description: "You've been successfully logged out.",
    });
    router.push("/");
  };

  // Hide navbar on signin/signup pages
  if (isSigninPage || isSignupPage) {
    return null;
  }

  return (
    <>
      <header
        className={cn(
          "fixed left-0 top-0 z-10 w-full border-b border-border bg-card shadow-sm",
          className,
        )}
      >
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-10 py-4">
          <div>
            <h1 className="text-2xl font-bold text-primary"> 📁 Lapis Archive</h1>
            <p className="text-sm text-muted-foreground">
              {isAdminPage
                ? "Dashboard & Management"
                : "Open Source File Sharing & Collaboration Platform"}
            </p>
          </div>
          {isAdminPage && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
              <Button variant="destructive" size="sm" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          )}
        </div>
      </header>
      {/* <nav className="sticky top-0 z-50 mb-8 w-full bg-background px-6 py-4 md:pt-0">
        <div className="flex w-full items-center justify-between md:hidden">
          <Link href="/">
            <Image
              src={logo}
              alt="logo"
              width={100}
              height={100}
              className="h-10 w-10"
            />
          </Link>
          <span className="flex items-center justify-center">
            <Image src={profilePic} alt="profile" width={48} height={48} />
            <span
              onClick={toggleDisconnectModal}
              className="relative flex h-6 w-6 cursor-pointer items-center justify-center gap-2"
            >
              <Image
                src={arrowDown}
                alt="down"
                width={10}
                height={10}
                className={`translate-x-2 transition-opacity duration-300 ${disconnectModal ? "opacity-100" : "opacity-0"}`}
              />
              <Image
                src={arrowUp}
                alt="up"
                width={10}
                height={10}
                className={`-translate-x-[9px] transition-opacity duration-300 ${disconnectModal ? "opacity-0" : "opacity-100"}`}
              />
              <DisconnectModal
                isOpen={disconnectModal}
                toggler={toggleDisconnectModal}
              />
            </span>
            <Image
              onClick={toggleNav}
              src={menu}
              alt="menu"
              width={30}
              height={30}
            />
          </span>
        </div>

        <span className="absolute left-0 top-16 my-4 flex h-[2px] w-full bg-border md:hidden" />

        <section className="relative flex">
          <SideNav navOpen={navOpen} toggleNav={toggleNav} />
        </section>
      </nav>*/}
    </>
  );
};

export default Navbar;
