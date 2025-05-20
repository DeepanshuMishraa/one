"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CalendarEvent } from "../calendar-types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCalendarContext } from "../calendar-context";
import { format } from "date-fns";
import { DateTimePicker } from "@/components/form/date-time-picker";
import { useToastManager } from "@/components/ui/toast";
import { Loader2 } from "lucide-react";
import { trpc } from "@/trpc/client";

const formSchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    start: z.string(),
    end: z.string(),
    description: z.string().optional(),
  })
  .refine(
    (data) => {
      const start = new Date(data.start);
      const end = new Date(data.end);
      return end >= start;
    },
    {
      message: "End time must be after start time",
      path: ["end"],
    },
  );

export default function CalendarNewEventDialog() {
  const { newEventDialogOpen, setNewEventDialogOpen, date, events, setEvents } =
    useCalendarContext();

  const toast = useToastManager();
  const utils = trpc.useContext();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      start: format(date, "yyyy-MM-dd'T'HH:mm"),
      end: format(date, "yyyy-MM-dd'T'HH:mm"),
    },
  });

  const { mutate: createEvent, isPending } =
    trpc.createCalendarEvent.useMutation({
      onSuccess: (response) => {
        if (response.status === 200 && response.event) {
          toast.add({
            title: "Event created successfully",
            description: "Event created successfully",
          });

          const transformedEvent: CalendarEvent = {
            id: response.event.id!,
            title: response.event.summary || form.getValues().title,
            description: response.event.description || undefined,
            start: new Date(response.event.start?.dateTime!),
            end: new Date(response.event.end?.dateTime!),
          };

          setEvents([...events, transformedEvent]);
          setNewEventDialogOpen(false);
          form.reset();
        }
      },
      onError: (error) => {
        toast.add({
          title: "Error creating event",
          description: error.message || "Something went wrong",
        });
      },
      onSettled: () => {
        utils.getCalendarEvents.invalidate();
      },
    });

  return (
    <Dialog open={newEventDialogOpen} onOpenChange={setNewEventDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create event</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => {
              createEvent({
                summary: values.title,
                description: values.description || "",
                start: values.start,
                end: values.end,
              });
            })}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Event title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="start"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Start</FormLabel>
                  <FormControl>
                    <DateTimePicker field={field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="end"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">End</FormLabel>
                  <FormControl>
                    <DateTimePicker field={field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "Create event"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
