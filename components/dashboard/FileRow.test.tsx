import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FileRow } from "@/components/dashboard/FileRow";

describe("FileRow", () => {
  it("renders the name, meta, and action", () => {
    render(
      <FileRow
        name="report.pdf"
        meta={<span>2MB</span>}
        action={<button>Download</button>}
      />,
    );
    expect(screen.getByText("report.pdf")).toBeTruthy();
    expect(screen.getByText("2MB")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Download" })).toBeTruthy();
  });

  it("renders a div by default and an li when asked", () => {
    const { container, rerender } = render(<FileRow name="a" meta={null} />);
    expect(container.firstElementChild?.tagName).toBe("DIV");
    rerender(<FileRow as="li" name="a" meta={null} />);
    expect(container.firstElementChild?.tagName).toBe("LI");
  });

  it("omits the action wrapper when there is no action", () => {
    const without = render(<FileRow name="a" meta={<span>m</span>} />);
    expect(without.container.firstElementChild?.children.length).toBe(1);

    const withAction = render(
      <FileRow name="a" meta={<span>m</span>} action={<button>x</button>} />,
    );
    expect(withAction.container.firstElementChild?.children.length).toBe(2);
  });
});
