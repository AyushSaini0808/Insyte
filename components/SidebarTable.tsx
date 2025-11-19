"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { IconChevronLeft, IconChevronRight, IconChevronsLeft, IconChevronsRight } from "@tabler/icons-react";

export default function TableSection() {
    const [query, setQuery] = useState("");
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [generatedSQL, setGeneratedSQL] = useState("");
    const [isNaturalLanguage, setIsNaturalLanguage] = useState(true);

    // Fetch data on component mount
    useEffect(() => {
        fetchData("SELECT * FROM sales_data;");
    }, []);

    const fetchData = async (sqlQuery) => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch('/api/sales', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: sqlQuery }),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }

            const result = await response.json();
            setData(result);
            setPageIndex(0); // Reset to first page on new query
        } catch (err) {
            setError(err.message || "Error fetching data");
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && query.trim()) {
            handleExecute();
        }
    };

    const handleExecute = async () => {
        if (!query.trim()) return;

        if (isNaturalLanguage) {
            // Convert natural language to SQL first
            try {
                setLoading(true);
                setError("");

                const nlResponse = await fetch('/api/nl-to-sql', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ query }),
                });

                if (!nlResponse.ok) {
                    const errorData = await nlResponse.json();
                    throw new Error(errorData.error || 'Failed to generate SQL');
                }

                const { sqlQuery } = await nlResponse.json();
                setGeneratedSQL(sqlQuery);

                // Now execute the generated SQL
                await fetchData(sqlQuery);
            } catch (err) {
                setError(err.message || "Error converting to SQL");
                setLoading(false);
            }
        } else {
            // Direct SQL execution
            setGeneratedSQL("");
            fetchData(query);
        }
    };

    // Get column names from first row of data
    const columns = data.length > 0 ? Object.keys(data[0]) : [];

    // Pagination logic
    const pageCount = Math.ceil(data.length / pageSize);
    const paginatedData = data.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);
    const canPreviousPage = pageIndex > 0;
    const canNextPage = pageIndex < pageCount - 1;

    return (
        <div className="flex h-screen flex-col">
            {/* Header */}

            {/* Main Section */}
            <div className="flex flex-1 flex-col overflow-hidden">
                <div className="flex flex-col flex-1 px-4 py-6 lg:px-6 overflow-auto">
                    <div className="w-full max-w-7xl mx-auto space-y-4">
                        {/* Mode Toggle */}
                        <div className="flex items-center gap-2">
                            <Button
                                variant={isNaturalLanguage ? "default" : "outline"}
                                size="sm"
                                onClick={() => {
                                    setIsNaturalLanguage(true);
                                    setQuery("");
                                    setGeneratedSQL("");
                                }}
                            >
                                Natural Language
                            </Button>
                            <Button
                                variant={!isNaturalLanguage ? "default" : "outline"}
                                size="sm"
                                onClick={() => {
                                    setIsNaturalLanguage(false);
                                    setQuery("");
                                    setGeneratedSQL("");
                                }}
                            >
                                SQL Query
                            </Button>
                        </div>

                        {/* Query Input */}
                        <div className="flex gap-2">
                            <Input
                                type="text"
                                placeholder={
                                    isNaturalLanguage
                                        ? "Ask a question... (e.g., Show me all electronics with price over 100)"
                                        : "Run SQL query... (e.g., SELECT * FROM sales_data WHERE price > 100)"
                                }
                                className="text-sm flex-1"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyPress={handleKeyPress}
                            />
                            <Button onClick={handleExecute} disabled={loading} variant="outline" size="sm">
                                {loading ? "Running..." : "Execute"}
                            </Button>
                        </div>

                        {/* Generated SQL Display */}
                        {generatedSQL && (
                            <div className="p-3 bg-muted rounded-lg border">
                                <div className="text-xs font-medium text-muted-foreground mb-1">
                                    Generated SQL:
                                </div>
                                <code className="text-sm">{generatedSQL}</code>
                            </div>
                        )}

                        {/* Error Message */}
                        {error && (
                            <div className="text-red-500 text-sm p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900">
                                {error}
                            </div>
                        )}

                        {/* Row Count */}
                        <div className="text-sm text-muted-foreground">
                            {loading ? "Loading..." : `Showing ${paginatedData.length} of ${data.length} rows`}
                        </div>

                        {/* Table */}
                        <div className="overflow-hidden rounded-lg border">
                            <Table>
                                <TableHeader className="bg-muted sticky top-0 z-10">
                                    <TableRow>
                                        {columns.map((column) => (
                                            <TableHead key={column} className="capitalize">
                                                {column.replace(/_/g, ' ')}
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={columns.length} className="h-24 text-center">
                                                Loading data...
                                            </TableCell>
                                        </TableRow>
                                    ) : paginatedData.length > 0 ? (
                                        paginatedData.map((row, idx) => (
                                            <TableRow key={idx} className="hover:bg-muted/50">
                                                {columns.map((column) => (
                                                    <TableCell key={column}>
                                                        {typeof row[column] === 'number' && column.toLowerCase().includes('price')
                                                            ? `$${row[column].toLocaleString()}`
                                                            : row[column]?.toString() || '-'}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={columns.length} className="h-24 text-center">
                                                No data found
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        {data.length > 0 && (
                            <div className="flex items-center justify-between px-4">
                                <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
                                    Showing {pageIndex * pageSize + 1} to {Math.min((pageIndex + 1) * pageSize, data.length)} of {data.length} rows
                                </div>
                                <div className="flex w-full items-center gap-8 lg:w-fit">
                                    <div className="hidden items-center gap-2 lg:flex">
                                        <Label htmlFor="rows-per-page" className="text-sm font-medium">
                                            Rows per page
                                        </Label>
                                        <Select
                                            value={`${pageSize}`}
                                            onValueChange={(value) => {
                                                setPageSize(Number(value));
                                                setPageIndex(0);
                                            }}
                                        >
                                            <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                                                <SelectValue placeholder={pageSize} />
                                            </SelectTrigger>
                                            <SelectContent side="top">
                                                {[10, 20, 30, 40, 50].map((size) => (
                                                    <SelectItem key={size} value={`${size}`}>
                                                        {size}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex w-fit items-center justify-center text-sm font-medium">
                                        Page {pageIndex + 1} of {pageCount}
                                    </div>
                                    <div className="ml-auto flex items-center gap-2 lg:ml-0">
                                        <Button
                                            variant="outline"
                                            className="hidden h-8 w-8 p-0 lg:flex"
                                            onClick={() => setPageIndex(0)}
                                            disabled={!canPreviousPage}
                                        >
                                            <span className="sr-only">Go to first page</span>
                                            <IconChevronsLeft />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="size-8"
                                            size="icon"
                                            onClick={() => setPageIndex(pageIndex - 1)}
                                            disabled={!canPreviousPage}
                                        >
                                            <span className="sr-only">Go to previous page</span>
                                            <IconChevronLeft />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="size-8"
                                            size="icon"
                                            onClick={() => setPageIndex(pageIndex + 1)}
                                            disabled={!canNextPage}
                                        >
                                            <span className="sr-only">Go to next page</span>
                                            <IconChevronRight />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="hidden size-8 lg:flex"
                                            size="icon"
                                            onClick={() => setPageIndex(pageCount - 1)}
                                            disabled={!canNextPage}
                                        >
                                            <span className="sr-only">Go to last page</span>
                                            <IconChevronsRight />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}