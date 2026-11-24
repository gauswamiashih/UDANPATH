import { redirect } from 'next/navigation';

export default async function ExamRedirectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  redirect(`/student/exams/${slug}`);
}
