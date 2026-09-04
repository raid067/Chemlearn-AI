import ClientPage from './ClientPage';

export default function Page({ params }: { params: Promise<{ chapterId: string, topicId: string }> }) {
  return <ClientPage params={params} />;
}
