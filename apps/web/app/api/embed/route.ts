import { generateEmbeddings } from "@/lib/embedding";
import { NextResponse } from "next/server";


export async function GET(req: Request) {
  const embedding = await generateEmbeddings("Hello , world my name is Deepanshu");
  return NextResponse.json(embedding);
}
