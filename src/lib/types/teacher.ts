import type { Subject } from "./class";

export interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  subjects: Subject[];
  classIds: string[];
  bio: string;
  qualifications: string[];
  joinedDate: string;
  hourlyRate: number;
}
