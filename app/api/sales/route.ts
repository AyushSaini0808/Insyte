import { connectDB, User } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const db = await connectDB();
        const [rows] = await db.execute<User[]>("SELECT * FROM sales_data LIMIT 5;");
        return NextResponse.json(rows);
    } catch (error) {
        console.error("Database error:", error);
        return NextResponse.json({ error: "Failed to fetch sales" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { query } = await request.json();

        if (!query) {
            return NextResponse.json({ error: "Query is required" }, { status: 400 });
        }

        // Basic SQL injection prevention - only allow SELECT statements
        const trimmedQuery = query.trim().toUpperCase();
        if (!trimmedQuery.startsWith("SELECT")) {
            return NextResponse.json({ error: "Only SELECT queries are allowed" }, { status: 400 });
        }

        const db = await connectDB();
        const [rows] = await db.execute<User[]>(query);
        return NextResponse.json(rows);
    } catch (error) {
        console.error("Database error:", error);
        return NextResponse.json({ error: "Failed to execute query" }, { status: 500 });
    }
}