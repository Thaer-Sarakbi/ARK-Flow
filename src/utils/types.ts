import { Timestamp } from "@react-native-firebase/firestore";
export interface Report {
    userId: string;
    note: string;
    date: string
}

export interface Task {
    id: string;
    description: string,
    assignedBy: string
    assignedTo: string
    assignedToId: string
    duration: number
    location: string
    status: string
    title: string
    creationDate: Timestamp
}

export type Update = {
    event: string,
    id: string,
    assignedToId: string, 
    description: string, 
    images: string[], 
    taskId: string, 
    creationDate: Timestamp,
    title: string,
    updatedBy: string,
    deviceToken: string,
    latitude: number,
    longitude: number
  }
export interface Comment {
    id: string
    comment: string
    commenter: string
    date: Timestamp
}

export interface User {
  accountCreated: string | undefined,
  email: string | null,
  id: string,
  profile:{
    admin: boolean,
    email: string,
    fullName: string,
    password: string,
    phoneNumber: string,
    verified: boolean
   }
}