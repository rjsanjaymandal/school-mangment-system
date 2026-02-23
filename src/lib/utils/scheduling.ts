"use client"

/**
 * Scheduling Collision Detection Engine (DSA)
 * Uses a greedy constraint check to identify conflicts in institutional scheduling.
 */

export interface ScheduleSlot {
  day: string;
  startTime: string; // "HH:mm"
  endTime: string;   // "HH:mm"
  teacherId: string;
  classId: string;
  roomId: string;
}

export type CollisionType = 'TEACHER_CONFLICT' | 'ROOM_CONFLICT' | 'CLASS_CONFLICT' | 'NONE';

export interface CollisionResult {
  hasCollision: boolean;
  type: CollisionType;
  conflictingSlot?: ScheduleSlot;
}

/**
 * Checks for collisions against an existing set of schedules.
 * O(N) complexity where N is the number of slots in the same day.
 */
export function validateSchedule(
  newSlot: ScheduleSlot,
  existingSlots: ScheduleSlot[]
): CollisionResult {
  // Filter for same day
  const dailySlots = existingSlots.filter(s => s.day === newSlot.day);

  for (const slot of dailySlots) {
    // Check for time overlap
    const isOverlapping = 
        newSlot.startTime < slot.endTime && 
        slot.startTime < newSlot.endTime;

    if (isOverlapping) {
      if (newSlot.teacherId === slot.teacherId) {
        return { hasCollision: true, type: 'TEACHER_CONFLICT', conflictingSlot: slot };
      }
      if (newSlot.roomId === slot.roomId) {
        return { hasCollision: true, type: 'ROOM_CONFLICT', conflictingSlot: slot };
      }
      if (newSlot.classId === slot.classId) {
        return { hasCollision: true, type: 'CLASS_CONFLICT', conflictingSlot: slot };
      }
    }
  }

  return { hasCollision: false, type: 'NONE' };
}

/**
 * Suggests a valid slot using a simple backtracking/search approach.
 * Optimization: This could be scaled to use graph coloring for full timetable generation.
 */
export function suggestSlot(
    preferredDay: string,
    existingSlots: ScheduleSlot[],
    teacherId: string,
    classId: string,
    roomId: string,
    durationHours: number = 1
): ScheduleSlot | null {
    const timeRanges = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00"];
    
    for (const start of timeRanges) {
        const [h, m] = start.split(":").map(Number);
        const end = `${String(h + durationHours).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
        
        const candidate: ScheduleSlot = {
            day: preferredDay,
            startTime: start,
            endTime: end,
            teacherId,
            classId,
            roomId
        };

        if (!validateSchedule(candidate, existingSlots).hasCollision) {
            return candidate;
        }
    }

    return null;
}
