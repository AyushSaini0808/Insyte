// app/api/generate-chart/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";

// Chart type definitions
export type ChartType =
    | "number-card"
    | "bar-chart"
    | "line-chart"
    | "pie-chart"
    | "area-chart"
    | "donut-chart"
    | "radial-chart"
    | "table";

interface ChartConfig {
    type: ChartType;
    title: string;
    description: string;
    dataKey: string;
    categoryKey?: string;
    valueKey?: string;
    color?: string;
}

export async function POST(request: Request) {
    try {
        const { query, chartType } = await request.json();

        if (!query) {
            return NextResponse.json({ error: "Query is required" }, { status: 400 });
        }

        const db = await connectDB();

        // Get schema for context
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

        // Generate SQL and chart config using LLM
        const result = await generateChartWithGroq(query, schemaInfo, chartType);

        // Validate and execute SQL
        const isValid = await validateSQL(result.sqlQuery, db);
        if (!isValid.valid) {
            return NextResponse.json({
                error: "Generated SQL query is invalid",
                details: isValid.error
            }, { status: 400 });
        }

        // Execute query to get data
        const [data] = await db.execute(result.sqlQuery);

        return NextResponse.json({
            sqlQuery: result.sqlQuery,
            chartConfig: result.chartConfig,
            data: data,
            naturalLanguageQuery: query
        });

    } catch (error) {
        console.error("Chart generation error:", error);
        return NextResponse.json(
            { error: "Failed to generate chart" },
            { status: 500 }
        );
    }
}

async function generateChartWithGroq(
    naturalLanguageQuery: string,
    schema: any[],
    requestedChartType?: ChartType
): Promise<{ sqlQuery: string; chartConfig: ChartConfig }> {

    const systemPrompt = `You are a data visualization expert. Given a natural language query, generate:
1. A MySQL SELECT query to get the data
2. A chart configuration specifying the best visualization

Database Schema for table 'sales_data':
${schema.map(col => `- ${col.name} (${col.type})`).join('\n')}

IMPORTANT DATE FORMAT INFORMATION:
- All dates are stored in 'YYYY-MM-DD' format (e.g., '2023-01-15')
- NEVER use LIKE '%MonthName%' for date filtering
- Use proper MySQL date functions:
  * YEAR(date_column) = 2023
  * MONTH(date_column) = 1 (for January)
  * QUARTER(date_column) = 1
  * DATE_FORMAT(date_column, '%Y-%m') = '2023-01'
  * DATE_FORMAT(date_column, '%M') = 'January' (for display only)
  * WHERE date_column BETWEEN '2023-01-01' AND '2023-01-31'

Available chart types:
- number-card: Single metric/KPI (e.g., "total sales", "average price")
- bar-chart: Comparing categories (e.g., "sales by region")
- line-chart: Trends over time (e.g., "sales over months")
- area-chart: Cumulative trends over time
- pie-chart: Parts of a whole (e.g., "market share by category")
- donut-chart: Similar to pie chart
- radial-chart: Circular progress/comparison
- table: Detailed data view

${requestedChartType ? `User requested chart type: ${requestedChartType}` : 'Suggest the most appropriate chart type.'}

Return ONLY a JSON object in this exact format:
{
  "sqlQuery": "SELECT statement here",
  "chartConfig": {
    "type": "chart-type",
    "title": "Chart Title",
    "description": "Brief description",
    "dataKey": "column_name_for_values",
    "categoryKey": "column_name_for_categories",
  }
}

Rules for SQL:
- Use aggregate functions for number-card (COUNT, SUM, AVG, etc.)
- For charts with categories, include GROUP BY
- For time series, ensure proper date ordering
- Use aliases for clarity (e.g., AS total_sales)
- No semicolons
- For time-based queries, use proper date functions, NOT string matching

Examples:

Query: "What's the total revenue?"
Response:
{
  "sqlQuery": "SELECT SUM(price * quantity) AS total_revenue FROM sales_data",
  "chartConfig": {
    "type": "number-card",
    "title": "Total Revenue",
    "description": "All-time revenue",
    "dataKey": "total_revenue",
  }
}

Query: "Show sales by category"
Response:
{
  "sqlQuery": "SELECT category, SUM(price * quantity) AS total_sales FROM sales_data GROUP BY category ORDER BY total_sales DESC",
  "chartConfig": {
    "type": "bar-chart",
    "title": "Sales by Category",
    "description": "Total sales broken down by product category",
    "dataKey": "total_sales",
    "categoryKey": "category",
  }
}

Query: "Sales by month for 2023"
Response:
{
  "sqlQuery": "SELECT DATE_FORMAT(sales_date, '%Y-%m') AS month, SUM(price * quantity) AS total_sales FROM sales_data WHERE YEAR(sales_date) = 2023 GROUP BY DATE_FORMAT(sales_date, '%Y-%m') ORDER BY month",
  "chartConfig": {
    "type": "line-chart",
    "title": "Monthly Sales 2023",
    "description": "Sales trends by month",
    "dataKey": "total_sales",
    "categoryKey": "month",
  }
}

Query: "Revenue in March 2023"
Response:
{
  "sqlQuery": "SELECT SUM(price * quantity) AS total_revenue FROM sales_data WHERE YEAR(sales_date) = 2023 AND MONTH(sales_date) = 3",
  "chartConfig": {
    "type": "number-card",
    "title": "March 2023 Revenue",
    "description": "Total revenue for March 2023",
    "dataKey": "total_revenue",
  }
}

Query: "Quarterly sales"
Response:
{
  "sqlQuery": "SELECT CONCAT('Q', QUARTER(sales_date), ' ', YEAR(sales_date)) AS quarter, SUM(price * quantity) AS total_sales FROM sales_data GROUP BY YEAR(sales_date), QUARTER(sales_date) ORDER BY YEAR(sales_date), QUARTER(sales_date)",
  "chartConfig": {
    "type": "bar-chart",
    "title": "Quarterly Sales",
    "description": "Sales by quarter",
    "dataKey": "total_sales",
    "categoryKey": "quarter",
  }
}

Query: "Annual sales trend"
Response:
{
  "sqlQuery": "SELECT YEAR(sales_date) AS year, SUM(price * quantity) AS total_sales FROM sales_data GROUP BY YEAR(sales_date) ORDER BY year",
  "chartConfig": {
    "type": "line-chart",
    "title": "Annual Sales Trend",
    "description": "Sales growth by year",
    "dataKey": "total_sales",
    "categoryKey": "year",
  }
}`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
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
            max_tokens: 500,
            response_format: { type: "json_object" }
        })
    });

    if (!response.ok) {
        throw new Error(`Groq API error: ${response.statusText}`);
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);

    // If user requested specific chart type, override LLM suggestion
    if (requestedChartType) {
        result.chartConfig.type = requestedChartType;
    }

    return result;
}

async function validateSQL(sqlQuery: string, db: any): Promise<{ valid: boolean; error?: string }> {
    try {
        const trimmedQuery = sqlQuery.trim().toUpperCase();
        if (!trimmedQuery.startsWith('SELECT')) {
            return { valid: false, error: 'Only SELECT queries are allowed' };
        }

        const dangerousKeywords = [
            'DROP', 'DELETE', 'INSERT', 'UPDATE', 'ALTER',
            'CREATE', 'TRUNCATE', 'GRANT', 'REVOKE'
        ];

        for (const keyword of dangerousKeywords) {
            if (trimmedQuery.includes(keyword)) {
                return { valid: false, error: `Forbidden keyword: ${keyword}` };
            }
        }

        await db.execute(`EXPLAIN ${sqlQuery}`);
        return { valid: true };

    } catch (error: any) {
        return { valid: false, error: error.message || 'SQL syntax error' };
    }
}