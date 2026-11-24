import { redirect } from 'next/navigation';

export default function ExamsRedirectIndex() {
  redirect('/student/exams/discover');
}
