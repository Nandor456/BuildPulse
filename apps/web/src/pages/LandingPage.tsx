import {
  BadgeCheck,
  Building2,
  CalendarDays,
  FileText,
  MessageSquare,
  QrCode,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

import { PublicHeader } from "@/components/public-header";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/hooks/useI18n";
import {
  isExternalRequestAccessUrl,
  REQUEST_ACCESS_URL,
} from "@/lib/publicLinks";
import { cn } from "@/lib/utils";

const features = [
  {
    title: "Workpoint control",
    description: "Plan and manage job sites, assigned workers, documents, and daily attendance from one place.",
    icon: Building2,
  },
  {
    title: "QR attendance",
    description: "Workers scan on site while managers review hours, missing check-outs, and Excel exports.",
    icon: QrCode,
  },
  {
    title: "Team operations",
    description: "Invite leaders and workers, keep roles clear, and organize communication around real work.",
    icon: Users,
  },
  {
    title: "Leave and documents",
    description: "Handle leave requests, worker files, and workpoint documents without spreadsheet drift.",
    icon: FileText,
  },
] as const;

const operations = [
  { label: "Workpoints", value: "12", tone: "text-blue-600 dark:text-blue-300" },
  { label: "Checked in", value: "48", tone: "text-emerald-600 dark:text-emerald-300" },
  { label: "Pending leave", value: "5", tone: "text-amber-600 dark:text-amber-300" },
] as const;

export default function LandingPage() {
  const { t } = useI18n();
  const hasRequestAccessUrl = REQUEST_ACCESS_URL.length > 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicHeader />
      <main>
        <section className="relative isolate min-h-[86svh] overflow-hidden border-b border-border bg-slate-950 text-white dark:bg-black">
          <HeroBackdrop />
          <div className="relative z-10 mx-auto flex min-h-[86svh] w-full max-w-7xl flex-col justify-center px-4 py-16 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-white/20 bg-white/10 px-3 py-1 text-sm text-white/90 backdrop-blur">
                <ShieldCheck className="h-4 w-4 text-emerald-300" />
                {t("Construction operations for teams in motion")}
              </div>
              <h1 className="text-4xl font-semibold sm:text-5xl lg:text-6xl">
                {t("BuildPulse")}
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg">
                {t(
                  "Coordinate workpoints, QR attendance, worker documents, leave requests, and team messaging in one focused construction operations system.",
                )}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                {hasRequestAccessUrl ? (
                  <Button asChild size="lg" className="h-11 bg-white text-slate-950 hover:bg-slate-100">
                    <a
                      href={REQUEST_ACCESS_URL}
                      target={isExternalRequestAccessUrl() ? "_blank" : undefined}
                      rel={isExternalRequestAccessUrl() ? "noreferrer" : undefined}
                    >
                      {t("Request access")}
                    </a>
                  </Button>
                ) : (
                  <Button type="button" size="lg" className="h-11 bg-white text-slate-950" disabled>
                    {t("Request access")}
                  </Button>
                )}
                <Button asChild variant="outline" size="lg" className="h-11 border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white">
                  <Link to="/register">{t("Register")}</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-11 border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white">
                  <Link to="/login">{t("Login")}</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-border bg-background px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3">
            {operations.map((item) => (
              <div key={item.label} className="rounded-md border bg-card p-5">
                <p className="text-sm text-muted-foreground">{t(item.label)}</p>
                <p className={cn("mt-2 text-3xl font-semibold", item.tone)}>{item.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-background px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-semibold sm:text-3xl">
                {t("Built for the daily rhythm of construction work")}
              </h2>
              <p className="mt-3 text-base leading-7 text-muted-foreground">
                {t(
                  "BuildPulse keeps field work, office review, and worker self-service connected without adding another messy spreadsheet.",
                )}
              </p>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <article key={feature.title} className="rounded-md border bg-card p-5">
                    <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-semibold">{t(feature.title)}</h3>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      {t(feature.description)}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function HeroBackdrop() {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-slate-950" />
      <div className="absolute -right-20 top-16 hidden w-[720px] max-w-[58vw] rotate-2 lg:block">
        <div className="rounded-md border border-white/15 bg-slate-900/90 p-4 shadow-2xl">
          <div className="grid gap-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <div className="h-3 w-28 rounded-sm bg-white/60" />
                <div className="mt-2 h-2 w-40 rounded-sm bg-white/20" />
              </div>
              <div className="flex gap-2">
                <span className="h-8 w-8 rounded-md bg-emerald-400/25" />
                <span className="h-8 w-8 rounded-md bg-amber-400/25" />
                <span className="h-8 w-8 rounded-md bg-blue-400/25" />
              </div>
            </div>
            <div className="grid grid-cols-[1.1fr_0.9fr] gap-3">
              <div className="space-y-3 rounded-md border border-white/10 bg-white/5 p-3">
                {[0, 1, 2, 3].map((item) => (
                  <div key={item} className="grid grid-cols-[1fr_80px_70px] items-center gap-3 rounded-md bg-white/5 p-3">
                    <div>
                      <div className="h-2.5 w-32 rounded-sm bg-white/50" />
                      <div className="mt-2 h-2 w-48 rounded-sm bg-white/15" />
                    </div>
                    <div className="h-2 rounded-sm bg-emerald-300/60" />
                    <div className="h-7 rounded-md bg-white/10" />
                  </div>
                ))}
              </div>
              <div className="space-y-3 rounded-md border border-white/10 bg-white/5 p-3">
                <div className="flex items-center gap-3 rounded-md bg-white/5 p-3">
                  <QrCode className="h-14 w-14 text-white/70" />
                  <div className="flex-1">
                    <div className="h-2.5 w-24 rounded-sm bg-white/50" />
                    <div className="mt-2 h-2 w-32 rounded-sm bg-white/15" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-md bg-blue-400/20 p-4">
                    <CalendarDays className="h-5 w-5 text-blue-200" />
                    <div className="mt-5 h-2 w-16 rounded-sm bg-white/40" />
                  </div>
                  <div className="rounded-md bg-rose-400/20 p-4">
                    <MessageSquare className="h-5 w-5 text-rose-200" />
                    <div className="mt-5 h-2 w-16 rounded-sm bg-white/40" />
                  </div>
                </div>
                <div className="rounded-md bg-amber-400/20 p-4">
                  <BadgeCheck className="h-5 w-5 text-amber-200" />
                  <div className="mt-5 h-2 w-40 rounded-sm bg-white/40" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-8 right-4 grid w-[260px] gap-3 sm:right-8 lg:hidden">
        <div className="rounded-md border border-white/15 bg-slate-900/90 p-4 shadow-2xl">
          <div className="flex items-center gap-3">
            <QrCode className="h-10 w-10 text-emerald-200" />
            <div className="flex-1">
              <div className="h-2.5 w-24 rounded-sm bg-white/50" />
              <div className="mt-2 h-2 w-32 rounded-sm bg-white/15" />
            </div>
          </div>
        </div>
        <div className="rounded-md border border-white/15 bg-slate-900/90 p-4 shadow-2xl">
          <div className="grid grid-cols-3 gap-2">
            <span className="h-8 rounded-md bg-blue-400/25" />
            <span className="h-8 rounded-md bg-emerald-400/25" />
            <span className="h-8 rounded-md bg-amber-400/25" />
          </div>
        </div>
      </div>
    </div>
  );
}
