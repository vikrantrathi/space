import { NextRequest, NextResponse } from 'next/server';

// This is a compatibility layer to redirect old API calls to the new client API
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const url = new URL(request.url);
  const searchParams = url.searchParams.toString();
  const targetUrl = `/api/client/quotation/${id}${searchParams ? `?${searchParams}` : ''}`;

  // Forward the request to the client API
  const response = await fetch(`${url.origin}${targetUrl}`, {
    method: 'GET',
    headers: request.headers,
  });

  return response;
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const url = new URL(request.url);
  const targetUrl = `/api/client/quotation/${id}/action`;

  const response = await fetch(`${url.origin}${targetUrl}`, {
    method: 'POST',
    headers: request.headers,
    body: await request.text(),
  });

  return response;
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const url = new URL(request.url);
  const targetUrl = `/api/client/quotation/${id}/action`;

  const response = await fetch(`${url.origin}${targetUrl}`, {
    method: 'PUT',
    headers: request.headers,
    body: await request.text(),
  });

  return response;
}