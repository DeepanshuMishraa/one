'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { CalendarEvent } from '../calendar-types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useCalendarContext } from '../calendar-context'
import { format } from 'date-fns'
import { DateTimePicker } from '@/components/form/date-time-picker'
import { createCalendarEvents } from '../../../../actions/actions'
import { useToastManager } from '@/components/ui/toast'
import { Loader2 } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const formSchema = z
  .object({
    title: z.string().min(1, 'Title is required'),
    start: z.string(),
    end: z.string(),
  })
  .refine(
    (data) => {
      const start = new Date(data.start)
      const end = new Date(data.end)
      return end >= start
    },
    {
      message: 'End time must be after start time',
      path: ['end'],
    }
  )

export default function CalendarNewEventDialog() {
  const { newEventDialogOpen, setNewEventDialogOpen, date, events, setEvents } =
    useCalendarContext()

  const toast = useToastManager();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      start: format(date, "yyyy-MM-dd'T'HH:mm"),
      end: format(date, "yyyy-MM-dd'T'HH:mm"),
    },
  })


  const { mutate } = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      try {
        const newEvent = await createCalendarEvents({
          title: values.title,
          start: new Date(values.start),
          end: new Date(values.end),
          id: crypto.randomUUID(),
        });

        if (newEvent.status === 200 && newEvent.event) {
          toast.add({
            title: `Event created successfully`,
            description: `Event created successfully`,
          });

          const transformedEvent: CalendarEvent = {
            id: newEvent.event.id as string,
            title: newEvent.event.summary || values.title,
            description: newEvent.event.description || undefined,
            start: new Date(newEvent.event.start?.dateTime || values.start),
            end: new Date(newEvent.event.end?.dateTime || values.end),
          };

          setEvents([...events, transformedEvent]);
          setNewEventDialogOpen(false);
          form.reset();
        }
      } catch (error) {
        toast.add({
          title: `Error creating event`,
          description: `Error creating event`,
        });
      }
    },
    mutationKey: ['create-event'],
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['calendar-events'] })
  })

  return (
    <Dialog open={newEventDialogOpen} onOpenChange={setNewEventDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create event</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((values) => mutate(values))} className="space-y-4">
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
 const { mutate, isPending } = useMutation({
...
 <Button type="submit" disabled={isPending}>
   {isPending ? <Loader2 className="animate-spin" /> : "Create event"}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
