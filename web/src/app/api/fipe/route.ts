import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

let catalogCache: any[] | null = null;

export async function GET(request: Request) {
  try {
    if (!catalogCache) {
      let filePath = path.join(process.cwd(), "public/fleetos_catalog.json");
      if (!fs.existsSync(filePath)) {
        filePath = path.join(process.cwd(), "../fleetos_catalog.json");
      }
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
    const brands = searchParams.get("brands");
    const brand = searchParams.get("brand");
    const model = searchParams.get("model");
    const q = searchParams.get("q");

    if (brands === "true") {
      const uniqueBrands = Array.from(new Set((catalogCache || []).map((item) => item.brand))).sort();
      return NextResponse.json(uniqueBrands);
    }

    if (brand && !model) {
      const brandItems = (catalogCache || []).filter(
        (item) => item.brand.toLowerCase() === brand.toLowerCase()
      );
      return NextResponse.json(brandItems);
    }

    if (brand && model) {
      const versions = (catalogCache || []).filter(
        (item) =>
          item.brand.toLowerCase() === brand.toLowerCase() &&
          item.model.toLowerCase() === model.toLowerCase()
      );
      return NextResponse.json(versions);
    }

    if (q) {
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
    }

    return NextResponse.json([]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
