import PlaceholderImage from "@/components/PlaceholderImage";
import LogoMark from "@/components/LogoMark";
import { CONTACT_EMAIL, GITHUB_URL, PORTFOLIO_URL } from "@/lib/links";

// Coinbase "Zero trading fees" layout: image card on the left, badge +
// big heading + story + one strong button on the right.
const CreatorSection = () => {
  return (
    <section className="container mx-auto px-4 py-16 sm:py-24">
      <div className="grid gap-10 md:grid-cols-2 md:items-center md:gap-16">
        <div className="rounded-[2.5rem] bg-muted p-8 sm:rounded-[3rem] sm:p-14">
          <PlaceholderImage
            label="Phone mockup: the share success screen with a file name, its access code on a little card, soft shadow, light UI"
            gradient="from-white via-secondary to-muted"
            aspect="aspect-[3/4]"
            className="mx-auto max-w-xs rounded-[2rem] shadow-lg"
          />
        </div>

        <div className="flex flex-col items-start">
          <span className="mb-8 inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            <LogoMark className="h-4 w-4" />
            From the creator
          </span>

          <h2 className="mb-6 text-4xl font-bold leading-[1.05] text-foreground sm:text-5xl lg:text-6xl">
            Made by one mildly annoyed person.
          </h2>

          <p className="mb-4 max-w-md text-base text-muted-foreground sm:text-lg">
            Hi, I'm the person behind Lapis Archive. I used to move files
            around with WeTransfer, until one day it tucked everything
            behind a subscription and sending a single file started to
            feel like a negotiation.
          </p>
          <p className="mb-8 max-w-md text-base text-muted-foreground sm:text-lg">
            So I made this instead: a fun little tool for getting files
            between devices that refuse to talk to each other. It's open
            source, and I'd love to hear what you think of it.
          </p>

          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="rounded-full bg-black px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-black/80"
          >
            Send me a message
          </a>

          <p className="mt-6 text-sm text-muted-foreground">
            You can also find me on{" "}
            <a
              href={GITHUB_URL}
              className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
            >
              GitHub
            </a>{" "}
            or visit{" "}
            <a
              href={PORTFOLIO_URL}
              className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
            >
              my website
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  );
};

export default CreatorSection;
