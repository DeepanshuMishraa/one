'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { ColorPicker } from '@/components/form/color-picker'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateCalendarEvent, deleteCalendarEvent } from '../../../../actions/actions'
import { useToastManager } from '@/components/ui/toast'
import { Loader2 } from 'lucide-react'
import { CalendarEvent } from '../calendar-types'

const formSchema = z
  .object({
    title: z.string().min(1, 'Title is required'),
    start: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid start date',
    }),
    end: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid end date',
    }),
  })
  .refine(
    (data) => {
      try {
        const start = new Date(data.start)
        const end = new Date(data.end)
        return end >= start
      } catch {
        return false
      }
    },
    {
      message: 'End time must be after start time',
      path: ['end'],
    }
  )

export default function CalendarManageEventDialog() {
  const {
    manageEventDialogOpen,
    setManageEventDialogOpen,
    selectedEvent,
    setSelectedEvent,
    events,
    setEvents,
  } = useCalendarContext()

  const toast = useToastManager()
  const queryClient = useQueryClient()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      start: '',
      end: '',
    },
  })

  useEffect(() => {
    if (selectedEvent) {
      form.reset({
        title: selectedEvent.title,
        start: format(selectedEvent.start, "yyyy-MM-dd'T'HH:mm"),
        end: format(selectedEvent.end, "yyyy-MM-dd'T'HH:mm"),

      })
    }
  }, [selectedEvent, form])

  const updateMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      if (!selectedEvent) return

      const updatedEvent = {
        ...selectedEvent,
        title: values.title,
        start: new Date(values.start),
        end: new Date(values.end),
      }

      const response = await updateCalendarEvent(updatedEvent)

      if (response.error) {
        throw new Error(response.message as string)
      }

      return response.event
    },
    onSuccess: (data) => {
      if (!selectedEvent || !data) return

      const updatedEvent: CalendarEvent = {
        id: data.id || selectedEvent.id,
        title: data.summary || selectedEvent.title,
        description: data.description || undefined,
        start: new Date(data.start?.dateTime || selectedEvent.start),
        end: new Date(data.end?.dateTime || selectedEvent.end),
      }

      setEvents(
        events.map((event) =>
          event.id === selectedEvent.id ? updatedEvent : event
        )
      )

      toast.add({
        title: 'Success',
        description: 'Event updated successfully',
      })

      handleClose()
    },
    onError: (error) => {
      toast.add({
        title: 'Error',
        description: error.message || 'Failed to update event',
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!selectedEvent) {
        throw new Error('No event selected')
      }

      const response = await deleteCalendarEvent(selectedEvent.id)

      if (response.error) {
        throw new Error(response.message as string || 'Failed to delete event')
      }

      return response
    },
    onSuccess: () => {
      if (!selectedEvent) return
      setEvents(events.filter((event) => event.id !== selectedEvent.id))

      toast.add({
        title: 'Success',
        description: 'Event deleted successfully',
      })
      handleClose()
    },
    onError: (error) => {
      toast.add({
        title: 'Error',
        description: error.message || 'Failed to delete event',
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] })
    },
  })

  function handleClose() {
    setManageEventDialogOpen(false)
    setSelectedEvent(null)
    form.reset()
  }

  const isLoading = updateMutation.isPending || deleteMutation.isPending

  return (
    <Dialog open={manageEventDialogOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage event</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => updateMutation.mutate(values))}
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


            <DialogFooter className="flex justify-between gap-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    type="button"
                    disabled={isLoading}
                  >
                    {isLoading && deleteMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete event</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this event? This action
                      cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => deleteMutation.mutate()}
                      disabled={isLoading}
                    >
                      {isLoading && deleteMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Button type="submit" disabled={isLoading}>
                {isLoading && updateMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Update event
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
