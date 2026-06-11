import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

let catalogCache: any[] | null = null;

export async function GET(request: Request) {
  try {
    if (!catalogCache) {
      let filePath = path.join(process.cwd(), "../fleetos_catalog.json");
      if (!fs.existsSync(filePath)) {
        filePath = path.join(process.cwd(), "fleetos_catalog.json");
      }
      if (!fs.existsSync(filePath)) {
        filePath = path.resolve(process.cwd(), "..", "fleetos_catalog.json");
      }
      
      if (!fs.existsSync(filePath)) {
        return NextResponse.json(
          { error: `File fleetos_catalog.json not found. Current Cwd: ${process.cwd()}` },
          { status: 404 }
        );
      }

      const fileContent = fs.readFileSync(filePath, "utf-8");
      catalogCache = JSON.parse(fileContent);
    }

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");

    if (!q) {
      return NextResponse.json([]);
    }

    const query = q.toLowerCase().trim();
    const searchWords = query.split(/\s+/).filter(Boolean);

    if (searchWords.length === 0) {
      return NextResponse.json([]);
    }

    const filtered = (catalogCache || []).filter((item) => {
      const itemText = `${item.brand} ${item.family || ""} ${item.model} ${item.year} ${item.fipeCode || ""}`.toLowerCase();
      return searchWords.every((word) => itemText.includes(word));
    });

    return NextResponse.json(filtered.slice(0, 25));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
