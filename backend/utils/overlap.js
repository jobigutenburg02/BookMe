import { timeToMinutes } from "./time.js";

export const timesOverlap = (firstStart, firstEnd, secondStart, secondEnd) => {
    return timeToMinutes(firstStart) < timeToMinutes(secondEnd)
    && timeToMinutes(firstEnd) > timeToMinutes(secondStart)
}