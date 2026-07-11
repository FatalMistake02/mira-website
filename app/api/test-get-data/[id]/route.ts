// app/api/test-get-data/[id]/route.ts 
// This is an example for protected data access.

import { getAuthenticatedUser } from "@/lib/auth";
import { NextResponse } from "next/server";

interface Document {
  id: string;
  ownerId: string; // This links the doc to the LocalUser.id
  title: string;
  content: string;
}

// FAKE DATABASE FOR DOCUMENTS
const FAKE_DOCUMENTS_DB: Record<string, Document> = {
  "doc_1": { id: "doc_1", ownerId: "local_abc123", title: "My Secret Notes", content: "Hello World" },
  "doc_2": { id: "doc_2", ownerId: "local_xyz789", title: "Bob's Diary", content: "I love cats" },
};

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const docId = params.id;

  // 1. AUTHENTICATION: Who is this?
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized: Please login" }, { status: 401 });
  }

  // 2. DATA RETRIEVAL: Does the document exist?
  const document = FAKE_DOCUMENTS_DB[docId];
  if (!document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  // 3. AUTHORIZATION: Does this user OWN this document?
  if (document.ownerId !== user.id) {
    return NextResponse.json(
      { error: "Forbidden: You do not have permission to view this document" }, 
      { status: 403 }
    );
  }

  // 4. SUCCESS
  return NextResponse.json(document);
}
