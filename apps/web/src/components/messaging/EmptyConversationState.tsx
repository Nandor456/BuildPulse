import { MessagesSquare } from "lucide-react";

export function EmptyConversationState() {
  return (
    <div className="flex flex-1 items-center justify-center p-6 md:p-10">
      <div className="flex max-w-sm flex-col items-center gap-4 rounded-[1.75rem] border border-dashed border-border/70 bg-muted/20 px-8 py-10 text-center shadow-sm">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <MessagesSquare className="h-10 w-10 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <p className="text-base font-medium text-foreground">No conversation selected</p>
          <p className="text-sm text-muted-foreground">
            Choose a conversation from the list or start a new one.
          </p>
        </div>
      </div>
    </div>
  );
}
