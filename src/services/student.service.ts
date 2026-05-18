/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { headers } from 'next/headers';

const getCookieHeader = async () => (await headers()).get('cookie') ?? '';

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

  const res = await fetch(`${baseUrl}/api/students?${params.toString()}`, {
    method: 'GET',
    cache: 'no-store',
    headers: {
      cookie: await getCookieHeader(),
    },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch students');
  }

  return res.json();
}

export async function getSingleStudent(id: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/students/${id}`, {
      cache: 'no-store',
      headers: {
        cookie: await getCookieHeader(),
      },
    });

    if (!res.ok) {
      throw new Error('Failed to fetch student');
    }

    const data = await res.json();
    return {
      success: true,
      data: data.data,
    };
  } catch (error: any) {
    console.error('Get single student error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch student',
      data: null,
    };
  }
}
