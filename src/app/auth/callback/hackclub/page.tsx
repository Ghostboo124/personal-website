type CallbackSearchParams = {
  code: string;
};

type PageProps = {
  searchParams: Promise<CallbackSearchParams>;
};

export default async function HackClubCallback({ searchParams }: PageProps) {
  const search_params = await searchParams;
  return <p>{search_params.code}</p>;
}
