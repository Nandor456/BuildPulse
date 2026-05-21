import { useState } from "react";
import { Pencil, Trash2, Users } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    useDeleteWorker,
    useUpdateWorker,
    useWorkers,
} from "../hooks/useWorkers";
import type { WorkerSummary } from "../services/api/workerApi";

const EDITABLE_ROLES = ["WORKER", "LEADER"];

export default function WorkerManagementPage() {
    const { data: workers = [], isLoading } = useWorkers();
    const updateWorkerMutation = useUpdateWorker();
    const deleteWorkerMutation = useDeleteWorker();

    const [editWorker, setEditWorker] = useState<WorkerSummary | null>(null);
    const [editUsername, setEditUsername] = useState("");
    const [editEmail, setEditEmail] = useState("");
    const [editRole, setEditRole] = useState("");
    const [editWage, setEditWage] = useState("");
    const [editError, setEditError] = useState<string | null>(null);

    const [deleteWorker, setDeleteWorker] = useState<WorkerSummary | null>(null);

    function openEditDialog(worker: WorkerSummary) {
        setEditWorker(worker);
        setEditUsername(worker.username);
        setEditEmail(worker.email);
        setEditRole(worker.role);
        setEditWage(worker.hourlyWage != null ? String(worker.hourlyWage) : "");
        setEditError(null);
    }

    function closeEditDialog() {
        setEditWorker(null);
        setEditError(null);
    }

    async function handleEditSave() {
        if (!editWorker) return;
        setEditError(null);
        const parsedWage = editWage.trim() !== "" ? parseFloat(editWage) : null;
        try {
            await updateWorkerMutation.mutateAsync({
                workerId: editWorker.id,
                data: {
                    username: editUsername.trim(),
                    email: editEmail.trim(),
                    role: editRole,
                    hourlyWage: parsedWage,
                },
            });
            closeEditDialog();
        } catch (err: unknown) {
            const message =
                (err as { response?: { data?: { error?: string } } })?.response?.data
                    ?.error ?? "Failed to update worker";
            setEditError(message);
        }
    }

    async function handleDeleteConfirm() {
        if (!deleteWorker) return;
        await deleteWorkerMutation.mutateAsync(deleteWorker.id);
        setDeleteWorker(null);
    }

    return (
        <div className="container mx-auto max-w-6xl px-4 py-8">
            <div className="mb-6 flex items-center gap-3">
                <Users className="h-8 w-8 text-primary" />
                <div>
                    <h1 className="text-3xl font-semibold">Workers</h1>
                    <p className="text-sm text-muted-foreground">
                        Manage registered workers — edit their details or remove their
                        accounts.
                    </p>
                </div>
            </div>

            {isLoading && (
                <div className="flex justify-center py-12">
                    <Spinner size={36} />
                </div>
            )}

            {!isLoading && workers.length === 0 && (
                <Alert>No workers registered yet.</Alert>
            )}

            {!isLoading && workers.length > 0 && (
                <div className="overflow-hidden rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Username</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead className="text-center">Work Points</TableHead>
                                <TableHead className="text-right">Hourly wage</TableHead>
                                <TableHead className="text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {workers.map((worker) => (
                                <TableRow key={worker.id}>
                                    <TableCell className="font-medium">
                                        {worker.username}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {worker.email}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{worker.role}</Badge>
                                    </TableCell>
                                    <TableCell className="text-center text-sm text-muted-foreground">
                                        {worker.assignedWorkPointCount}
                                    </TableCell>
                                    <TableCell className="text-right text-sm tabular-nums">
                                        {worker.hourlyWage != null ? (
                                            `${worker.hourlyWage.toFixed(2)} RON/h`
                                        ) : (
                                            <span className="text-muted-foreground">—</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex justify-center gap-1">
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => openEditDialog(worker)}
                                                        aria-label="Edit worker"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>Edit worker</TooltipContent>
                                            </Tooltip>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-destructive hover:text-destructive"
                                                        onClick={() => setDeleteWorker(worker)}
                                                        aria-label="Delete worker"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>Delete worker</TooltipContent>
                                            </Tooltip>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            <Dialog
                open={editWorker !== null}
                onOpenChange={(open) => !open && closeEditDialog()}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit worker</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="edit-username">Username</Label>
                            <Input
                                id="edit-username"
                                value={editUsername}
                                onChange={(e) => setEditUsername(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="edit-email">Email</Label>
                            <Input
                                id="edit-email"
                                type="email"
                                value={editEmail}
                                onChange={(e) => setEditEmail(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="edit-role">Role</Label>
                            <Select value={editRole} onValueChange={setEditRole}>
                                <SelectTrigger id="edit-role">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {EDITABLE_ROLES.map((role) => (
                                        <SelectItem key={role} value={role}>
                                            {role.charAt(0) + role.slice(1).toLowerCase().replace("_", " ")}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="edit-wage">Hourly wage (RON)</Label>
                            <Input
                                id="edit-wage"
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="e.g. 35.50"
                                value={editWage}
                                onChange={(e) => setEditWage(e.target.value)}
                            />
                        </div>
                        {editError && <Alert variant="destructive">{editError}</Alert>}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={closeEditDialog}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleEditSave}
                            disabled={updateWorkerMutation.isPending}
                        >
                            {updateWorkerMutation.isPending && <Spinner size={16} />}
                            {updateWorkerMutation.isPending ? "Saving…" : "Save"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog
                open={deleteWorker !== null}
                onOpenChange={(open) => !open && setDeleteWorker(null)}
            >
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Delete worker</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        Are you sure you want to delete{" "}
                        <strong>{deleteWorker?.username}</strong>? This action cannot be
                        undone.
                    </p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteWorker(null)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteConfirm}
                            disabled={deleteWorkerMutation.isPending}
                        >
                            {deleteWorkerMutation.isPending && <Spinner size={16} />}
                            {deleteWorkerMutation.isPending ? "Deleting…" : "Delete"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
