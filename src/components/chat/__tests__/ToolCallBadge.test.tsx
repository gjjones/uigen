import { test, expect, afterEach, describe } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolCallBadge } from "../ToolCallBadge";

afterEach(() => {
  cleanup();
});

describe("ToolCallBadge - str_replace_editor commands", () => {
  test("displays 'Creating' message for create command", () => {
    const toolInvocation = {
      toolCallId: "1",
      toolName: "str_replace_editor",
      args: {
        command: "create",
        path: "/components/Card.jsx",
        file_text: "export default function Card() {}",
      },
      state: "result",
      result: "Success",
    };

    render(<ToolCallBadge toolInvocation={toolInvocation} />);

    expect(screen.getByText("Creating Card.jsx")).toBeDefined();
  });

  test("displays 'Editing' message for str_replace command", () => {
    const toolInvocation = {
      toolCallId: "2",
      toolName: "str_replace_editor",
      args: {
        command: "str_replace",
        path: "/App.jsx",
        old_str: "old code",
        new_str: "new code",
      },
      state: "result",
      result: "Success",
    };

    render(<ToolCallBadge toolInvocation={toolInvocation} />);

    expect(screen.getByText("Editing App.jsx")).toBeDefined();
  });

  test("displays 'Editing' message for insert command", () => {
    const toolInvocation = {
      toolCallId: "3",
      toolName: "str_replace_editor",
      args: {
        command: "insert",
        path: "/utils/helpers.js",
        insert_line: 10,
        new_str: "new code",
      },
      state: "result",
      result: "Success",
    };

    render(<ToolCallBadge toolInvocation={toolInvocation} />);

    expect(screen.getByText("Editing helpers.js")).toBeDefined();
  });

  test("displays 'Editing' message for undo_edit command", () => {
    const toolInvocation = {
      toolCallId: "4",
      toolName: "str_replace_editor",
      args: {
        command: "undo_edit",
        path: "/App.jsx",
      },
      state: "result",
      result: "Success",
    };

    render(<ToolCallBadge toolInvocation={toolInvocation} />);

    expect(screen.getByText("Editing App.jsx")).toBeDefined();
  });

  test("displays 'Viewing' message for view command", () => {
    const toolInvocation = {
      toolCallId: "5",
      toolName: "str_replace_editor",
      args: {
        command: "view",
        path: "/components/Header.jsx",
        view_range: [1, 50],
      },
      state: "result",
      result: "file contents",
    };

    render(<ToolCallBadge toolInvocation={toolInvocation} />);

    expect(screen.getByText("Viewing Header.jsx")).toBeDefined();
  });

  test("displays 'Updating' message for unknown command", () => {
    const toolInvocation = {
      toolCallId: "6",
      toolName: "str_replace_editor",
      args: {
        command: "unknown_command",
        path: "/App.jsx",
      },
      state: "result",
      result: "Success",
    };

    render(<ToolCallBadge toolInvocation={toolInvocation} />);

    expect(screen.getByText("Updating App.jsx")).toBeDefined();
  });
});

describe("ToolCallBadge - file_manager commands", () => {
  test("displays 'Renaming' message with arrow for rename command", () => {
    const toolInvocation = {
      toolCallId: "7",
      toolName: "file_manager",
      args: {
        command: "rename",
        path: "/components/OldCard.jsx",
        new_path: "/components/NewCard.jsx",
      },
      state: "result",
      result: "Success",
    };

    render(<ToolCallBadge toolInvocation={toolInvocation} />);

    expect(screen.getByText("Renaming OldCard.jsx → NewCard.jsx")).toBeDefined();
  });

  test("displays 'Deleting' message for delete command", () => {
    const toolInvocation = {
      toolCallId: "8",
      toolName: "file_manager",
      args: {
        command: "delete",
        path: "/components/Unused.jsx",
      },
      state: "result",
      result: "Success",
    };

    render(<ToolCallBadge toolInvocation={toolInvocation} />);

    expect(screen.getByText("Deleting Unused.jsx")).toBeDefined();
  });

  test("displays 'Managing' message for unknown command", () => {
    const toolInvocation = {
      toolCallId: "9",
      toolName: "file_manager",
      args: {
        command: "unknown_command",
        path: "/App.jsx",
      },
      state: "result",
      result: "Success",
    };

    render(<ToolCallBadge toolInvocation={toolInvocation} />);

    expect(screen.getByText("Managing App.jsx")).toBeDefined();
  });
});

describe("ToolCallBadge - visual states", () => {
  test("shows green dot when tool call is complete", () => {
    const toolInvocation = {
      toolCallId: "10",
      toolName: "str_replace_editor",
      args: {
        command: "create",
        path: "/App.jsx",
      },
      state: "result",
      result: "Success",
    };

    const { container } = render(<ToolCallBadge toolInvocation={toolInvocation} />);

    // Check for green dot element
    const greenDot = container.querySelector(".bg-emerald-500");
    expect(greenDot).toBeDefined();
    expect(greenDot?.className).toContain("rounded-full");
  });

  test("shows spinner when tool call is in progress", () => {
    const toolInvocation = {
      toolCallId: "11",
      toolName: "str_replace_editor",
      args: {
        command: "create",
        path: "/App.jsx",
      },
      state: "in-progress",
    };

    render(<ToolCallBadge toolInvocation={toolInvocation} />);

    // The Loader2 component renders with animate-spin class
    const container = screen.getByText("Creating App.jsx").closest("div");
    expect(container?.querySelector(".animate-spin")).toBeDefined();
  });

  test("shows spinner when tool call has no result", () => {
    const toolInvocation = {
      toolCallId: "12",
      toolName: "str_replace_editor",
      args: {
        command: "create",
        path: "/App.jsx",
      },
      state: "result",
      result: null,
    };

    render(<ToolCallBadge toolInvocation={toolInvocation} />);

    const container = screen.getByText("Creating App.jsx").closest("div");
    expect(container?.querySelector(".animate-spin")).toBeDefined();
  });
});

describe("ToolCallBadge - edge cases", () => {
  test("handles unknown tool name by displaying tool name", () => {
    const toolInvocation = {
      toolCallId: "13",
      toolName: "unknown_tool",
      args: {
        command: "some_command",
        path: "/App.jsx",
      },
      state: "result",
      result: "Success",
    };

    render(<ToolCallBadge toolInvocation={toolInvocation} />);

    expect(screen.getByText("unknown_tool")).toBeDefined();
  });

  test("handles missing path gracefully", () => {
    const toolInvocation = {
      toolCallId: "14",
      toolName: "str_replace_editor",
      args: {
        command: "create",
        path: "",
      },
      state: "result",
      result: "Success",
    };

    render(<ToolCallBadge toolInvocation={toolInvocation} />);

    // Should display "Creating " (with empty filename)
    expect(screen.getByText("Creating")).toBeDefined();
  });

  test("extracts filename from nested path", () => {
    const toolInvocation = {
      toolCallId: "15",
      toolName: "str_replace_editor",
      args: {
        command: "create",
        path: "/src/components/ui/Button.jsx",
      },
      state: "result",
      result: "Success",
    };

    render(<ToolCallBadge toolInvocation={toolInvocation} />);

    // Should show only the filename, not the full path
    expect(screen.getByText("Creating Button.jsx")).toBeDefined();
  });

  test("handles path without leading slash", () => {
    const toolInvocation = {
      toolCallId: "16",
      toolName: "str_replace_editor",
      args: {
        command: "create",
        path: "components/Card.jsx",
      },
      state: "result",
      result: "Success",
    };

    render(<ToolCallBadge toolInvocation={toolInvocation} />);

    expect(screen.getByText("Creating Card.jsx")).toBeDefined();
  });

  test("applies correct styling classes", () => {
    const toolInvocation = {
      toolCallId: "17",
      toolName: "str_replace_editor",
      args: {
        command: "create",
        path: "/App.jsx",
      },
      state: "result",
      result: "Success",
    };

    const { container } = render(<ToolCallBadge toolInvocation={toolInvocation} />);

    const badge = container.querySelector(".inline-flex");
    expect(badge?.className).toContain("items-center");
    expect(badge?.className).toContain("gap-2");
    expect(badge?.className).toContain("bg-neutral-50");
    expect(badge?.className).toContain("rounded-lg");
    expect(badge?.className).toContain("text-xs");
    expect(badge?.className).toContain("font-mono");
    expect(badge?.className).toContain("border-neutral-200");
  });
});

describe("ToolCallBadge - file paths with special characters", () => {
  test("handles filename with dots", () => {
    const toolInvocation = {
      toolCallId: "18",
      toolName: "str_replace_editor",
      args: {
        command: "view",
        path: "/config/app.config.js",
      },
      state: "result",
      result: "Success",
    };

    render(<ToolCallBadge toolInvocation={toolInvocation} />);

    expect(screen.getByText("Viewing app.config.js")).toBeDefined();
  });

  test("handles filename with hyphens and underscores", () => {
    const toolInvocation = {
      toolCallId: "19",
      toolName: "str_replace_editor",
      args: {
        command: "create",
        path: "/utils/my-awesome_helper.ts",
      },
      state: "result",
      result: "Success",
    };

    render(<ToolCallBadge toolInvocation={toolInvocation} />);

    expect(screen.getByText("Creating my-awesome_helper.ts")).toBeDefined();
  });
});
