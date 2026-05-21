import { useEffect } from "react";
import { Link as RouterLink, Navigate, useLocation, useParams } from "react-router-dom";
import { CheckCircle2, Clock, LogIn, XCircle } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/hooks/useAuth";
import { useCheckin } from "@/hooks/useAttendance";
import { formatDate, formatDateTime, formatHours, formatMoney } from "@/lib/format";

function getErrorMessage(error: unknown) {
  return (
    (error as { response?: { data?: { error?: string } } })?.response?.data?.error ??
    "Unable to record attendance."
  );
}

export default function CheckinPage() {
  const { qrToken } = useParams<{ qrToken: string }>();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const checkin = useCheckin();

  useEffect(() => {
    if (!isAuthenticated || !qrToken || checkin.isPending || checkin.data) return;

    const lockKey = `checkin:${qrToken}`;
    const lastAttempt = Number(window.sessionStorage.getItem(lockKey) ?? 0);
    if (Date.now() - lastAttempt < 3000) return;

    window.sessionStorage.setItem(lockKey, String(Date.now()));
    checkin.mutate(qrToken);
  }, [checkin, isAuthenticated, qrToken]);

  if (!isAuthenticated) {
    const redirect = encodeURIComponent(location.pathname);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }

  if (!qrToken) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
        <Alert variant="destructive" className="max-w-sm">
          Invalid QR code.
        </Alert>
      </main>
    );
  }

  const result = checkin.data;

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            {checkin.isError ? (
              <XCircle className="h-7 w-7" />
            ) : result ? (
              <CheckCircle2 className="h-7 w-7" />
            ) : (
              <Clock className="h-7 w-7" />
            )}
          </div>
          <div>
            <h1 className="text-xl font-semibold">Attendance check-in</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {checkin.isPending
                ? "Recording attendance..."
                : result
                  ? result.workPointName
                  : "Preparing scan"}
            </p>
          </div>
        </div>

        {checkin.isPending && (
          <div className="flex justify-center py-8">
            <Spinner size={36} />
          </div>
        )}

        {checkin.isError && (
          <div className="space-y-4">
            <Alert variant="destructive">{getErrorMessage(checkin.error)}</Alert>
            <Button
              className="w-full"
              onClick={() => {
                window.sessionStorage.removeItem(`checkin:${qrToken}`);
                checkin.mutate(qrToken);
              }}
            >
              <LogIn className="h-4 w-4" />
              Try again
            </Button>
          </div>
        )}

        {result && (
          <div className="space-y-4">
            <Alert className={result.event === "CHECK_IN" ? "border-emerald-500/30 text-emerald-700 dark:text-emerald-300" : undefined}>
              {result.event === "CHECK_IN" ? "Checked in" : "Checked out"}
            </Alert>
            <div className="rounded-md border">
              <div className="grid grid-cols-2 gap-3 border-b px-4 py-3 text-sm">
                <span className="text-muted-foreground">Date</span>
                <span className="text-right font-medium">{formatDate(result.date)}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 border-b px-4 py-3 text-sm">
                <span className="text-muted-foreground">Checked in</span>
                <span className="text-right font-medium">
                  {formatDateTime(result.checkedInAt)}
                </span>
              </div>
              {result.event === "CHECK_OUT" && (
                <>
                  <div className="grid grid-cols-2 gap-3 border-b px-4 py-3 text-sm">
                    <span className="text-muted-foreground">Checked out</span>
                    <span className="text-right font-medium">
                      {formatDateTime(result.checkedOutAt)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 border-b px-4 py-3 text-sm">
                    <span className="text-muted-foreground">Hours</span>
                    <span className="text-right font-medium">{formatHours(result.hours)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 px-4 py-3 text-sm">
                    <span className="text-muted-foreground">Earnings</span>
                    <span className="text-right font-medium">
                      {formatMoney(result.earnings)}
                    </span>
                  </div>
                </>
              )}
            </div>
            <Button asChild className="w-full">
              <RouterLink to="/messages">Done</RouterLink>
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
