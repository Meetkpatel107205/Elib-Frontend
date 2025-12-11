import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { getSingleBook, editBook } from "@/http/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LoaderCircle } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const formSchema = z.object({
  title: z.string().min(2),
  genre: z.string().min(2),
  coverImage: z.any().optional(),
  file: z.any().optional(),
});

const EditBook = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const id = location.state?.id;

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["singleBook", id],
    queryFn: () => getSingleBook(id),
    enabled: !!id,
  });

  const book = data?.data;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      genre: "",
    },
  });

  // Always populate form when book arrives
  useEffect(() => {
    if (book) {
      form.reset({
        title: book.title,
        genre: book.genre,
      });
    }
  }, [book, form]);

  const mutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) =>
      editBook(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
      navigate("/dashboard/books");
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const fd = new FormData();

    fd.append("title", values.title);
    fd.append("genre", values.genre);

    // Only update image if user selected
    if (values.coverImage) {
      fd.append("coverImage", values.coverImage);
    }

    if (values.file) {
      fd.append("file", values.file);
    }

    mutation.mutate({ id, data: fd });
  }

  if (!id) return <div className="p-6 text-red-500">Invalid Book ID</div>;
  if (isLoading) return <div className="p-6">Loading book...</div>;

  return (
    <section className="select-none">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex items-center justify-between">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/dashboard/home">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/dashboard/books">Books</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Edit</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <div className="flex items-center gap-4">
              <Link to="/dashboard/books">
                <Button variant="outline">Cancel</Button>
              </Link>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending && (
                  <LoaderCircle className="animate-spin" />
                )}
                Update
              </Button>
            </div>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Edit Book</CardTitle>
              <CardDescription>Update book details below.</CardDescription>
            </CardHeader>

            <CardContent>
              <div className="grid gap-6">
                {/* Title */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Genre */}
                <FormField
                  control={form.control}
                  name="genre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Genre</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Cover Image */}
                <FormField
                  control={form.control}
                  name="coverImage"
                  render={({ field: { value, onChange, ...fieldProps } }) => (
                    <FormItem>
                      <FormLabel>Cover Image (optional)</FormLabel>
                      {book?.coverImage && (
                        <div className="mb-2">
                          <p className="text-sm text-foreground mb-2">
                            Current image:
                          </p>
                          <img
                            src={book.coverImage}
                            alt="Current cover"
                            className="w-32 h-40 object-cover rounded border border-border"
                          />
                        </div>
                      )}
                      <FormControl>
                        <Input
                          {...fieldProps}
                          value={value?.fileName}
                          type="file"
                          accept="image/*"
                          onChange={(event) => {
                            onChange(event.target.files?.[0] || undefined);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Book File */}
                <FormField
                  control={form.control}
                  name="file"
                  render={({ field: { value, onChange, ...fieldProps } }) => (
                    <FormItem>
                      <FormLabel>Book File (PDF) (optional)</FormLabel>
                      {book?.file && (
                        <div className="mb-2">
                          <p className="text-sm text-foreground">
                            Current file:
                            <a
                              href={book.file}
                              target="_blank"
                              rel="noopener noreferrer"
                              /* 
                                rel="noopener noreferrer" Explanation:
                              
                                When using target="_blank", the link opens in a new browser tab.
                                But this creates a security risk because the newly opened page can
                                access your original page through "window.opener". This can lead to
                                attacks such as reverse tabnabbing, where the new page can redirect
                                your site or run malicious scripts.
                              
                                noopener:
                                  - Prevents the new tab from accessing "window.opener".
                                  - Protects your website from being controlled or redirected.
                                  - Improves security when opening external links.
                              
                                noreferrer:
                                  - Hides the referrer information (your page URL) from the new site.
                                  - Also ensures "noopener" behavior in some browsers.
                                  - Provides extra privacy and security.
                              
                                Using both together:
                                  rel="noopener noreferrer"
                              
                                This is the recommended best practice for all links that use target="_blank".
                              */
                              className="text-blue-500 hover:text-blue-700 hover:underline ml-1"
                            >
                              View current PDF
                            </a>
                          </p>
                        </div>
                      )}
                      <FormControl>
                        <Input
                          {...fieldProps}
                          value={value?.fileName}
                          type="file"
                          accept=".pdf,application/pdf"
                          onChange={(event) => {
                            onChange(event.target.files?.[0] || undefined);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
    </section>
  );
};

export default EditBook;
