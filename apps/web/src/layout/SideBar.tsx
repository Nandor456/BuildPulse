import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

export default function SideBar({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="overflow-hidden">
                <div className="flex min-h-svh flex-col">
                    <header className="flex h-14 shrink-0 items-center border-b border-border/60 bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
                        <SidebarTrigger className="-ml-1 rounded-xl" />
                    </header>
                    <div className="flex-1 min-h-0 overflow-y-auto">
                        {children}
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
