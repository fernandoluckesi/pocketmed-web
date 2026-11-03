import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { clickableProps } from "../../utils/clickableProps";

/**
 * Covers the helper that makes non-semantic clickable containers usable
 * without a mouse (legal audit item 11 — Lei 13.146/2015, art. 63).
 *
 * The happy path here is the cheap part. What earns the suite its keep is
 * the bubbling guard: several of these containers wrap real buttons (a
 * calendar day cell wraps the appointment buttons inside it), and `keydown`
 * bubbles. Without the guard, Enter on a nested button fired the nested
 * action AND the container's — so opening an appointment also navigated
 * away from it. The mouse path never showed the bug because the children
 * call `stopPropagation()` on click.
 */
describe("clickableProps", () => {
  it("exposes the element as a button to assistive technology", () => {
    render(
      <div {...clickableProps(() => {}, { label: "Abrir paciente" })}>
        conteúdo
      </div>,
    );

    expect(screen.getByRole("button", { name: "Abrir paciente" })).toBeTruthy();
  });

  it("is reachable by Tab", async () => {
    const user = userEvent.setup();
    render(<div {...clickableProps(() => {}, { label: "Alvo" })}>x</div>);

    await user.tab();

    expect(document.activeElement).toBe(screen.getByRole("button"));
  });

  it("activates on click, Enter and Space", async () => {
    const user = userEvent.setup();
    const onActivate = vi.fn();
    render(<div {...clickableProps(onActivate, { label: "Alvo" })}>x</div>);
    const target = screen.getByRole("button");

    await user.click(target);
    expect(onActivate).toHaveBeenCalledTimes(1);

    target.focus();
    await user.keyboard("{Enter}");
    expect(onActivate).toHaveBeenCalledTimes(2);

    await user.keyboard(" ");
    expect(onActivate).toHaveBeenCalledTimes(3);
  });

  it("ignores other keys", async () => {
    const user = userEvent.setup();
    const onActivate = vi.fn();
    render(<div {...clickableProps(onActivate, { label: "Alvo" })}>x</div>);

    screen.getByRole("button").focus();
    await user.keyboard("{ArrowDown}{Escape}{Tab}a");

    expect(onActivate).not.toHaveBeenCalled();
  });

  it("prevents the default on Space so the page does not scroll", () => {
    const onActivate = vi.fn();
    const props = clickableProps(onActivate, { label: "Alvo" });
    const preventDefault = vi.fn();

    props.onKeyDown?.({
      key: " ",
      preventDefault,
      target: 1,
      currentTarget: 1,
    } as unknown as React.KeyboardEvent);

    expect(preventDefault).toHaveBeenCalled();
    expect(onActivate).toHaveBeenCalledTimes(1);
  });

  // --- the regression that motivated the guard -----------------------------

  it("does not fire when the key event came from a nested control", async () => {
    const user = userEvent.setup();
    const onContainer = vi.fn();
    const onInner = vi.fn();

    render(
      <div {...clickableProps(onContainer, { label: "Dia 12" })}>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onInner();
          }}
        >
          consulta das 14h
        </button>
      </div>,
    );

    screen.getByRole("button", { name: "consulta das 14h" }).focus();
    await user.keyboard("{Enter}");

    expect(onInner).toHaveBeenCalledTimes(1);
    expect(onContainer).not.toHaveBeenCalled();
  });

  it("still fires when the container itself has focus, nested control aside", async () => {
    const user = userEvent.setup();
    const onContainer = vi.fn();

    render(
      <div {...clickableProps(onContainer, { label: "Dia 12" })}>
        <button type="button">consulta das 14h</button>
      </div>,
    );

    screen.getByRole("button", { name: "Dia 12" }).focus();
    await user.keyboard("{Enter}");

    expect(onContainer).toHaveBeenCalledTimes(1);
  });

  // --- disabled ------------------------------------------------------------

  it("when disabled, stays out of the tab order and does not activate", async () => {
    const user = userEvent.setup();
    const onActivate = vi.fn();

    render(
      <>
        <button type="button">antes</button>
        <div {...clickableProps(onActivate, { disabled: true })}>x</div>
        <button type="button">depois</button>
      </>,
    );

    await user.tab();
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "antes" }),
    );

    // The next Tab must skip the disabled container entirely — a focus stop
    // that does nothing is worse than no focus stop, because the user gets
    // no feedback and no way to tell why.
    await user.tab();
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "depois" }),
    );
  });

  it("when disabled, announces the disabled state instead of going silent", () => {
    render(<div {...clickableProps(() => {}, { disabled: true })}>x</div>);

    const target = screen.getByRole("button", { hidden: true });
    expect(target.getAttribute("aria-disabled")).toBe("true");
    expect(target.getAttribute("tabindex")).toBe("-1");
  });

  it("when disabled, attaches no click handler at all", async () => {
    const user = userEvent.setup();
    const onActivate = vi.fn();

    render(
      <div
        {...clickableProps(onActivate, { disabled: true })}
        data-testid="inert"
      >
        x
      </div>,
    );

    await user.click(screen.getByTestId("inert"));

    expect(onActivate).not.toHaveBeenCalled();
  });
});
