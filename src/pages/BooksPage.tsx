import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { deleteBook, getBooks } from "@/http/api";
import { Book } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { CirclePlus, LoaderCircle, MoreHorizontal } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

const BooksPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Get params from URL
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  //   10 ka matlab → Base (Radix)

  // parseInt() ka second argument radix hota hai.
  // Radix = kisi number ka numerical base.

  // Example:

  // Base 10 → Decimal (normal human numbers 0–9)
  // Base 2 → Binary (0,1)
  // Base 16 → Hexadecimal (0–9 + A–F)

  const searchQuery = searchParams.get("search") || "";

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["books"],
    queryFn: getBooks,
    staleTime: 10000,
    refetchOnMount: "always",
  });

  const books: Book[] = data?.data ?? [];

  // Filter books based on search query
  const filteredBooks = searchQuery
    ? books.filter((book) => {
        const query = searchQuery.toLowerCase();
        return (
          book.title.toLowerCase().includes(query) ||
          book.genre.toLowerCase().includes(query) ||
          book.author?.name.toLowerCase().includes(query)
        );
      })
    : books;

  // Pagination
  const pageSize = 5;
  const totalPages = Math.ceil(filteredBooks.length / pageSize);
  const start = (currentPage - 1) * pageSize;
  // Start index = (page number - 1) × items per page
  // (Because index starting from 0)
  const end = start + pageSize;
  const paginatedBooks = filteredBooks.slice(start, end);

  // Index: 0 1 2 3 4 | 5 6 7 8 9 | 10 11 12 13 14
  // Page :     1     |     2     |       3

  // Dialog state
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [selectedBookTitle, setSelectedBookTitle] = useState<string>("");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Update URL params
  const updateSearchParams = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    // Reset to page 1 when searching
    if (key === "search") {
      newParams.set("page", "1");
    }
    setSearchParams(newParams);
  };

  // DELETE BOOK MUTATION
  const mutation = useMutation({
    mutationFn: ({ id }: { id: string }) => deleteBook(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
      setOpenDialog(false);
      setSelectedBook(null);
      setSelectedBookTitle("");
    },
  });

  function handleDelete() {
    if (!selectedBook) return;
    mutation.mutate({ id: selectedBook });
  }

  return (
    <>
      {/* PAGE CONTENT */}
      <div className="select-none">
        <div className="flex items-center justify-between">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard/home">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Books</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <Link to="/dashboard/books/create">
            <Button>
              <CirclePlus size={20} />
              <span className="ml-2">Add book</span>
            </Button>
          </Link>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Books</CardTitle>
            <CardDescription>
              Manage your books and view their sales performance.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="hidden w-[100px] sm:table-cell">
                    <span className="sr-only">Image</span>
                  </TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Genre</TableHead>
                  <TableHead className="hidden md:table-cell">Author</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Created at
                  </TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {paginatedBooks.map((book) => (
                  <TableRow key={book._id}>
                    <TableCell className="hidden sm:table-cell">
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        className="aspect-square rounded-md object-cover"
                        width={64}
                        height={64}
                      />
                    </TableCell>

                    <TableCell className="font-medium">{book.title}</TableCell>

                    <TableCell>
                      <Badge variant="outline">{book.genre}</Badge>
                    </TableCell>

                    <TableCell className="hidden md:table-cell">
                      {book.author?.name}
                    </TableCell>

                    <TableCell className="hidden md:table-cell">
                      {new Date(book.createdAt)
                        .toLocaleString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })
                        .replace(" am", " AM")
                        .replace(" pm", " PM")}
                    </TableCell>

                    <TableCell>
                      <DropdownMenu
                        open={openDialog ? false : openDropdown === book._id}
                        onOpenChange={(isOpen) => {
                          setOpenDropdown(isOpen ? book._id : null);
                        }}
                      >
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="cursor-pointer"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent
                          align="end"
                          className="cursor-pointer select-none"
                        >
                          <DropdownMenuLabel className="select-none">
                            Actions
                          </DropdownMenuLabel>

                          {/* EDIT */}
                          <DropdownMenuItem
                            onClick={() =>
                              navigate("/dashboard/books/edit", {
                                state: { id: book._id },
                              })
                            }
                            className="cursor-pointer select-none"
                          >
                            Edit
                          </DropdownMenuItem>

                          {/* DELETE */}
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600 cursor-pointer select-none"
                            onSelect={(e) => {
                              e.preventDefault();
                              setSelectedBook(book._id);
                              setSelectedBookTitle(book.title);
                              setOpenDialog(true);
                              setOpenDropdown(null);
                            }}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>

          <CardFooter>
            <p className="text-xs text-muted-foreground">
              Displaying{" "}
              <strong>
                {start + 1}-{Math.min(end, filteredBooks.length)}
              </strong>{" "}
              of <strong>{filteredBooks.length}</strong> book
              {filteredBooks.length !== 1 ? "s" : ""}
              {searchQuery && (
                <span>
                  {" "}
                  · Filtered from <strong>{books.length}</strong> total
                </span>
              )}
            </p>
          </CardFooter>
        </Card>

        {totalPages > 1 && (
          <Pagination className="mt-8">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => {
                    if (currentPage > 1) {
                      updateSearchParams("page", String(currentPage - 1));
                    }
                  }}
                  className={`cursor-pointer select-none ${
                    currentPage === 1 ? "pointer-events-none opacity-50" : ""
                  }`}
                />
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (pageNum) => {
                  // Show first page, last page, current page, and pages around current
                  const showPage =
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1);

                  if (!showPage) {
                    // Show ellipsis
                    if (
                      pageNum === currentPage - 2 ||
                      pageNum === currentPage + 2
                    ) {
                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }
                    return null;
                  }

                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        onClick={
                          () => updateSearchParams("page", String(pageNum))
                          // Page change = URL changes → React Router re-renders this page → pagination logic re-runs → correct books display.
                        }
                        isActive={currentPage === pageNum}
                        className="cursor-pointer select-none"
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                }
              )}

              <PaginationItem>
                <PaginationNext
                  onClick={() => {
                    if (currentPage < totalPages) {
                      updateSearchParams("page", String(currentPage + 1));
                    }
                  }}
                  className={`cursor-pointer select-none ${
                    currentPage === totalPages
                      ? "pointer-events-none opacity-50"
                      : ""
                  }`}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}

        {/* LOADING / ERROR */}
        <div className="min-h-[40px] w-full mt-8 flex justify-center items-center">
          {isLoading && <LoaderCircle className="animate-spin" />}

          {isError && (
            <div className="text-destructive border border-border rounded-lg p-4 shadow-sm text-base font-semibold bg-background">
              <p>
                {isAxiosError(error)
                  ? error.response?.data?.message ?? "Something went wrong"
                  : (error as Error).message}
              </p>

              <button
                onClick={() => refetch()}
                className="bg-primary text-primary-foreground px-3 py-2 rounded-lg mt-3 hover:opacity-90"
              >
                Retry
              </button>
            </div>
          )}
        </div>
      </div>

      {/* CUSTOM MODAL DIALOG */}
      {openDialog && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center"
          onClick={(e) => {
            if (!mutation.isPending && e.target === e.currentTarget) {
              setOpenDialog(false);
              setSelectedBook(null);
            }
          }}
          style={{ pointerEvents: mutation.isPending ? "auto" : "auto" }}
        >
          <div
            className="bg-card text-card-foreground rounded-lg shadow-lg p-6 max-w-md w-full mx-4 pointer-events-auto border border-border"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold mb-2">
              Are you absolutely sure?
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              {`This action cannot be undone. This will permanently delete the
              book with title "${selectedBookTitle}".`}
            </p>

            <div className="flex gap-3 justify-end">
              <button
                className="px-4 py-2 rounded border border-border hover:bg-accent disabled:opacity-50 select-none"
                disabled={mutation.isPending}
                onClick={() => {
                  if (!mutation.isPending) {
                    setOpenDialog(false);
                    setSelectedBook(null);
                    setSelectedBookTitle("");
                  }
                }}
              >
                Cancel
              </button>
              <button
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground flex items-center gap-2 px-4 py-2 rounded disabled:opacity-50 select-none"
                disabled={mutation.isPending}
                onClick={() => {
                  handleDelete();
                }}
              >
                {mutation.isPending && (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                )}
                {mutation.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BooksPage;
