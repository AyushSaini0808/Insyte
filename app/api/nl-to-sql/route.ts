// app/api/nl-to-sql/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";

export async function POST(request: Request) {
    try {
        const { query } = await request.json();

        if (!query) {
            return NextResponse.json({ error: "Query is required" }, { status: 400 });
        }

        // Get the database schema to provide context to the LLM
        const db = await connectDB();
        const [columns] = await db.execute(`
            SELECT COLUMN_NAME, DATA_TYPE, COLUMN_KEY
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_NAME = 'sales_data'
            AND TABLE_SCHEMA = DATABASE()
            ORDER BY ORDINAL_POSITION;
        `);

        const schemaInfo = (columns as any[]).map((col: any) => ({
            name: col.COLUMN_NAME,
            type: col.DATA_TYPE,
            isPrimaryKey: col.COLUMN_KEY === 'PRI'
        }));

        // Call Groq API
        const sqlQuery = await generateSQLWithGroq(query, schemaInfo);

        // Validate the SQL query
        const isValid = await validateSQL(sqlQuery, db);

        if (!isValid.valid) {
            return NextResponse.json({
                error: "Generated SQL query is invalid",
                details: isValid.error,
                generatedSQL: sqlQuery
            }, { status: 400 });
        }

        return NextResponse.json({
            sqlQuery: sqlQuery,
            naturalLanguageQuery: query,
            schema: schemaInfo
        });

    } catch (error) {
        console.error("NL to SQL error:", error);
        return NextResponse.json(
            { error: "Failed to convert natural language to SQL" },
            { status: 500 }
        );
    }
}

async function generateSQLWithGroq(
    naturalLanguageQuery: string,
    schema: any[]
): Promise<string> {
    const systemPrompt = `You are a SQL expert. Convert natural language queries to valid MySQL SQL queries.

Database Schema for table 'sales_data':
${schema.map(col => `- ${col.name} (${col.type})${col.isPrimaryKey ? ' PRIMARY KEY' : ''}`).join('\n')}

Rules:
1. Only generate SELECT queries
2. Always use proper SQL syntax for MySQL
3. Use appropriate WHERE clauses for filtering
4. Use ORDER BY for sorting
5. Use LIMIT for restricting results
6. Return ONLY the SQL query without any explanation or markdown formatting
7. Do not include semicolons at the end
8. Use single quotes for string literals
9. Table name is always 'sales_data'
10. Be precise and use exact column names from the schema

Examples:
Natural: "Show me all products"
SQL: SELECT * FROM sales_data

Natural: "Get products with price greater than 100"
SQL: SELECT * FROM sales_data WHERE price > 100

Natural: "Show top 5 expensive products"
SQL: SELECT * FROM sales_data ORDER BY price DESC LIMIT 5

Natural: "Find electronics"
SQL: SELECT * FROM sales_data WHERE category = 'Electronics'`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
            model: 'llama-3.3-70b-versatile', // Fast and accurate
            // Alternative models:
            // 'llama-3.1-70b-versatile' - Very capable
            // 'mixtral-8x7b-32768' - Good for complex queries
            // 'gemma2-9b-it' - Faster, lighter
            messages: [
                {
                    role: 'system',
                    content: systemPrompt
                },
                {
                    role: 'user',
                    content: naturalLanguageQuery
                }
            ],
            temperature: 0.1,
            max_tokens: 200,
            top_p: 0.95
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Groq API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    let sqlQuery = data.choices[0].message.content.trim();

    // Clean up the response
    sqlQuery = sqlQuery
        .replace(/```sql\n?/g, '')
        .replace(/```\n?/g, '')
        .replace(/;+$/g, '')
        .trim();

    // If multiple lines, take only the SQL query line
    const lines = sqlQuery.split('\n');
    for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine.toUpperCase().startsWith('SELECT')) {
            sqlQuery = trimmedLine;
            break;
        }
    }

    return sqlQuery;
}

async function validateSQL(sqlQuery: string, db: any): Promise<{ valid: boolean; error?: string }> {
    try {
        // Check if it's a SELECT query
        const trimmedQuery = sqlQuery.trim().toUpperCase();
        if (!trimmedQuery.startsWith('SELECT')) {
            return {
                valid: false,
                error: 'Only SELECT queries are allowed'
            };
        }

        // Check for dangerous keywords
        const dangerousKeywords = [
            'DROP', 'DELETE', 'INSERT', 'UPDATE', 'ALTER',
            'CREATE', 'TRUNCATE', 'GRANT', 'REVOKE', 'EXEC',
            'EXECUTE', 'DECLARE', 'INTO OUTFILE', 'INTO DUMPFILE'
        ];

        for (const keyword of dangerousKeywords) {
            const regex = new RegExp(`\\b${keyword}\\b`, 'i');
            if (regex.test(trimmedQuery)) {
                return {
                    valid: false,
                    error: `Query contains forbidden keyword: ${keyword}`
                };
            }
        }

        // Verify table name is correct
        if (!trimmedQuery.includes('SALES_DATA')) {
            return {
                valid: false,
                error: 'Query must reference the sales_data table'
            };
        }

        // Try to explain the query (this validates syntax without executing)
        await db.execute(`EXPLAIN ${sqlQuery}`);

        return { valid: true };

    } catch (error: any) {
        return {
            valid: false,
            error: error.message || 'SQL syntax error'
        };
    }
}