import Link from "next/link";

import SocialIcon from "@/components/SocialIcon";
import {
  CONTACT_EMAIL,
  GITHUB_URL,
  LINKEDIN_URL,
  PORTFOLIO_URL,
} from "@/lib/links";

const footerLinks = [
  { href: "/dashboard", label: "Upload" },
  { href: "/signin", label: "Sign in" },
  { href: "/signup", label: "Sign up" },
];

const Footer = () => {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto flex flex-col px-4 py-12 sm:py-16">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
          <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-5">
            <SocialIcon name="github" href={GITHUB_URL} label="GitHub" />
            <SocialIcon name="linkedin" href={LINKEDIN_URL} label="LinkedIn" />
            <SocialIcon
              name="email"
              href={`mailto:${CONTACT_EMAIL}`}
              label="Email"
            />
            <SocialIcon
              name="portfolio"
              href={PORTFOLIO_URL}
              label="Portfolio"
            />
          </div>
        </div>

        <p className="mt-8 text-xs text-muted-foreground">
          Lapis Archive. A small open source tool for flinging files around.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
