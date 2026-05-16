export async function getAllStudentsService(page = 1, limit = 10, searchTerm = '') {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!baseUrl) {
    throw new Error('NEXT_PUBLIC_API_URL is not defined');
  }

  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    search: searchTerm,
  });

  const res = await fetch(`${baseUrl}/students?${params.toString()}`, {
    method: 'GET',
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch students');
  }

  return res.json();
}
