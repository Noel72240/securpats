import CaregiverRegisterPage from './CaregiverRegisterPage'
import CaregiverLoginPage from './CaregiverLoginPage'
import CaregiverDashboard from './CaregiverDashboard'
import CaregiverProfilePage from './CaregiverProfilePage'
import CaregiverAvailabilityPage from './CaregiverAvailabilityPage'

export function FosterRegisterPage() {
  return <CaregiverRegisterPage kind="foster_family" />
}
export function FosterLoginPage() {
  return <CaregiverLoginPage kind="foster_family" />
}
export function FosterDashboard() {
  return <CaregiverDashboard kind="foster_family" />
}
export function FosterProfilePage() {
  return <CaregiverProfilePage kind="foster_family" />
}
export function FosterAvailabilityPage() {
  return <CaregiverAvailabilityPage kind="foster_family" />
}

export function VolunteerRegisterPage() {
  return <CaregiverRegisterPage kind="volunteer" />
}
export function VolunteerLoginPage() {
  return <CaregiverLoginPage kind="volunteer" />
}
export function VolunteerDashboard() {
  return <CaregiverDashboard kind="volunteer" />
}
export function VolunteerProfilePage() {
  return <CaregiverProfilePage kind="volunteer" />
}
export function VolunteerAvailabilityPage() {
  return <CaregiverAvailabilityPage kind="volunteer" />
}
