export type MainStackParamsList = {
  BottomNav: undefined,
  DayDetails: {
    date: number;
    userId: string
  },
  ReportDetails: {
    date: string;
    report: Report,
    userId: string
  },
  LeaveDetails: {
    date: string;
    leave: Report
    userId: string
  },
  CheckInOut: {
    checkIn: {
      time: Date
    },
    checkOut: {
      time: Date
    }
  },
  TaskDetails: {
    taskId: string, 
    assignedToId: string, 
    notificationId?: string, 
    notificationStatus?: string 
  },
  UpdateDetails: {
    updateId: string
    taskId: string
    userId: string | undefined
    userName: string | undefined
    assignedBy: string
    assignedToId: string
    assignedById: string
  },
  UserDetails: {
    image: string | undefined, 
    name: string, 
    role: string | undefined, 
    place: string | undefined, 
    email: string | undefined, 
    phone: string | undefined
  },
  SearchScreen: undefined,
  NotificationsScreen: undefined,
  ChatScreen: undefined;
  PlaceDetails: {
    place: string; 
    latitude: number | undefined; 
    longitude: number | undefined;
  }
}