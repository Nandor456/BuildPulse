export function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-3 py-2">
      <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-card border border-border px-3 py-2.5">
        <span
          className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce"
          style={{ animationDelay: "-0.3s" }}
        />
        <span
          className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce"
          style={{ animationDelay: "-0.15s" }}
        />
        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce" />
      </div>
    </div>
  );
}
