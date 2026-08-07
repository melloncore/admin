"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, CalendarX2 } from "lucide-react";
import { PageHeader, PageLoading } from "@/components/ui/Feedback";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { FormField, Input } from "@/components/ui/Field";
import { Toggle } from "@/components/ui/Toggle";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useSettings } from "@/hooks/useSettings";
import { useCollection } from "@/hooks/useCollection";
import { availabilityApi, blockedDatesApi } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { formatDate } from "@/lib/utils/date";
import type { BlockedDate, DayAvailability } from "@/types";

export default function CalendarPage() {
  const { data, isLoading, isSaving, saveAll } = useSettings<DayAvailability[]>(availabilityApi);
  const { items, create, remove } = useCollection<BlockedDate>(blockedDatesApi);
  const { showToast } = useToast();
  const [days, setDays] = useState<DayAvailability[] | null>(null);
  const [newDate, setNewDate] = useState("");
  const [newReason, setNewReason] = useState("");
  const [pendingDelete, setPendingDelete] = useState<BlockedDate | null>(null);

  useEffect(() => {
    if (data) setDays(data);
  }, [data]);

  if (isLoading || !days) return <PageLoading />;

  const updateDay = (index: number, patch: Partial<DayAvailability>) => {
    setDays((prev) => {
      if (!prev) return prev;
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  };

  const handleSave = async () => {
    await saveAll(days);
    showToast("Availability updated.");
  };

  const handleAddBlockedDate = async () => {
    if (!newDate) return;
    await create({ date: newDate, reason: newReason || "Unavailable" });
    setNewDate("");
    setNewReason("");
    showToast("Blocked date added.");
  };

  return (
    <div>
      <PageHeader title="Availability" description="Set weekly hours and block specific dates for bookings." />

      <div className="space-y-6">
        <Card>
          <CardHeader title="Weekly hours" description="Days and times clients can book a call" />
          <CardBody className="space-y-2">
            {days.map((day, index) => (
              <div
                key={day.day}
                className="flex flex-col gap-3 rounded-lg border border-line px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <Toggle checked={day.isAvailable} onChange={(v) => updateDay(index, { isAvailable: v })} />
                  <span className="w-10 text-sm font-medium text-ink">{day.day}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="time"
                    value={day.startTime}
                    onChange={(e) => updateDay(index, { startTime: e.target.value })}
                    disabled={!day.isAvailable}
                    className="w-32"
                  />
                  <span className="text-sm text-ink-muted">to</span>
                  <Input
                    type="time"
                    value={day.endTime}
                    onChange={(e) => updateDay(index, { endTime: e.target.value })}
                    disabled={!day.isAvailable}
                    className="w-32"
                  />
                </div>
              </div>
            ))}
          </CardBody>
          <div className="flex justify-end border-t border-line px-5 py-3">
            <Button onClick={handleSave} isLoading={isSaving}>
              Save availability
            </Button>
          </div>
        </Card>

        <Card>
          <CardHeader title="Blocked dates" description="Holidays or days you're fully unavailable" />
          <CardBody>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end">
              <FormField label="Date" htmlFor="blocked-date">
                <Input id="blocked-date" type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
              </FormField>
              <FormField label="Reason" htmlFor="blocked-reason">
                <Input
                  id="blocked-reason"
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  placeholder="Holiday, team offsite…"
                />
              </FormField>
              <Button variant="outline" onClick={handleAddBlockedDate}>
                <Plus size={14} /> Add
              </Button>
            </div>

            {items.length === 0 ? (
              <p className="flex items-center gap-2 text-sm text-ink-muted">
                <CalendarX2 size={16} /> No blocked dates.
              </p>
            ) : (
              <ul className="divide-y divide-line rounded-lg border border-line">
                {items.map((blocked) => (
                  <li key={blocked.id} className="flex items-center justify-between px-4 py-2.5">
                    <div>
                      <p className="text-sm font-medium text-ink">{formatDate(blocked.date)}</p>
                      <p className="text-xs text-ink-muted">{blocked.reason}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setPendingDelete(blocked)}>
                      <Trash2 size={14} className="text-coral-600" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>

      <ConfirmDialog
        isOpen={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        title="Remove this blocked date?"
        confirmLabel="Remove"
        onConfirm={async () => {
          if (!pendingDelete) return;
          await remove(pendingDelete.id);
          showToast("Blocked date removed.", "info");
        }}
      />
    </div>
  );
}
