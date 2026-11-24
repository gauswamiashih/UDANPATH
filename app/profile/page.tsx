import { redirect } from 'next/navigation';

export default function ProfileRedirect() {
  redirect('/student/profile');
}
