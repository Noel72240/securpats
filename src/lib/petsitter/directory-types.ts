export type DirectoryPetsitter = {
  userId: string
  firstName: string
  lastName: string
  photo?: string
  bio: string
  phone: string
  email: string
  address: string
  availableDays: string[]
  availableHours: string
  serviceArea: string
  departmentCode?: string
}
