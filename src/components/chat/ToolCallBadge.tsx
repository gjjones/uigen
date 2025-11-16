import { Loader2 } from "lucide-react";

interface ToolInvocation {
  toolCallId: string;
  toolName: string;
  args: Record<string, any>;
  state: string;
  result?: any;
}

interface ToolCallBadgeProps {
  toolInvocation: ToolInvocation;
}

/**
 * Formats a tool call into a user-friendly message
 * @param toolInvocation - The tool invocation object from the AI SDK
 * @returns A formatted message describing the operation
 */
function formatToolCallMessage(toolInvocation: ToolInvocation): string {
  const { toolName, args } = toolInvocation;

  // Extract filename from path (e.g., "/components/Card.jsx" -> "Card.jsx")
  const getFilename = (path: string): string => {
    if (!path) return "";
    return path.split("/").pop() || path;
  };

  if (toolName === "str_replace_editor") {
    const command = args.command;
    const filename = getFilename(args.path);

    switch (command) {
      case "create":
        return `Creating ${filename}`;
      case "str_replace":
      case "insert":
      case "undo_edit":
        return `Editing ${filename}`;
      case "view":
        return `Viewing ${filename}`;
      default:
        return `Updating ${filename}`;
    }
  }

  if (toolName === "file_manager") {
    const command = args.command;
    const filename = getFilename(args.path);

    switch (command) {
      case "rename":
        const newFilename = getFilename(args.new_path);
        return `Renaming ${filename} → ${newFilename}`;
      case "delete":
        return `Deleting ${filename}`;
      default:
        return `Managing ${filename}`;
    }
  }

  // Fallback for unknown tools
  return toolName;
}

/**
 * Badge component that displays a formatted message for AI tool calls
 * Shows a spinner when the tool is running and a green dot when complete
 */
export function ToolCallBadge({ toolInvocation }: ToolCallBadgeProps) {
  const message = formatToolCallMessage(toolInvocation);
  const isComplete = toolInvocation.state === "result" && toolInvocation.result;

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {isComplete ? (
        <>
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          <span className="text-neutral-700">{message}</span>
        </>
      ) : (
        <>
          <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
          <span className="text-neutral-700">{message}</span>
        </>
      )}
    </div>
  );
}
