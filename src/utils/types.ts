import { Timestamp } from "@react-native-firebase/firestore";
export interface Report {
    userId: string;
    note: string;
    date: string
}

export interface Task {
    id: string;
    assignedBy: string
    assignedTo: string
    duration: number
    location: string
    status: string
    title: string
    creationDate: Date
}

export type Updates = {
    event: string,
    updateId: string,
    assigenId: string, 
    description: string, 
    images: string[], 
    taskId: string, 
    time: Timestamp,
    title: string,
    updatedBy: string,
    deviceToken: string,
    latitude: number,
    longitude: number
  }