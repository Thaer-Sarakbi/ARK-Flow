export interface Report {
    userId: string;
    note: string;
    date: string
}

export interface Task {
    id: string;
    assignedTo: string
    duration: number
    location: string
    status: string
    title: string
}