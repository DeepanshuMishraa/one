import { Button } from "@/components/ui/button";
import { RiMoreFill } from "@remixicon/react";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Participant {
  email: string;
  displayName?: string;
  photoUrl?: string;
  responseStatus: string;
  optional: boolean;
  organizer: boolean;
}

interface ParticipantsProps {
  participants: Participant[];
  maxDisplay?: number;
}

export default function Participants({ participants, maxDisplay = 4 }: ParticipantsProps) {
  const displayParticipants = participants.slice(0, maxDisplay);
  const remainingCount = Math.max(0, participants.length - maxDisplay);

  return (
    <TooltipProvider>
      <div className="flex -space-x-[0.45rem]">
        {displayParticipants.map((participant, index) => (
          <Tooltip key={participant.email}>
            <TooltipTrigger asChild>
              <div className="relative">
                <Avatar className="size-6 ring-background ring-1">
                  <AvatarImage
                    src={participant.photoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${participant.displayName || participant.email}`}
                    alt={participant.displayName || participant.email}
                  />
                  <AvatarFallback>
                    {(participant.displayName || participant.email).charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {participant.organizer && (
                  <div className="absolute -bottom-1 -right-1 size-2.5 rounded-full bg-primary ring-1 ring-background" />
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{participant.displayName || participant.email}</p>
              <p className="text-xs text-muted-foreground">
                {participant.organizer ? "Organizer" : participant.responseStatus}
              </p>
            </TooltipContent>
          </Tooltip>
        ))}

        {remainingCount > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                className="flex size-6 items-center justify-center rounded-full text-xs ring-1 ring-background border-transparent shadow-none text-muted-foreground/80 dark:bg-background dark:hover:bg-background dark:border-transparent"
                size="icon"
              >
                +{remainingCount}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{remainingCount} more participants</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}
