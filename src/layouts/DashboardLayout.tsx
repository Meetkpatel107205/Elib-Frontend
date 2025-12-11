import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import useTokenStore from "@/store";
import { useQuery } from "@tanstack/react-query";
import { getBooks } from "@/http/api";
import {
  CircleUser,
  Home,
  LibraryBig,
  Menu,
  Moon,
  Package2,
  Search,
  Sun,
} from "lucide-react";
import {
  Link,
  Navigate,
  NavLink,
  Outlet,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import { useState, useEffect } from "react";

const DashboardLayout = () => {
  const { token, setToken } = useTokenStore((state) => state);
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const isBookPage = location.pathname === "/dashboard/books";
  const searchQuery = searchParams.get("search") || "";

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      return savedTheme === "dark";
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    const htmlElement = document.documentElement;
    // document.documentElement → HTML page ka sabse top-level element hota hai.
    if (isDarkMode) {
      htmlElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      htmlElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  const handleSearchChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set("search", value);
      newParams.set("page", "1"); // Reset to page 1 on search
    } else {
      newParams.delete("search");
    }
    setSearchParams(newParams);
  };

  const { data } = useQuery({
    queryKey: ["books"],
    queryFn: getBooks,
    staleTime: 10000,
  });

  const books = data?.data ?? [];
  const count = books.length;

  const [isSheetOpen, setIsSheetOpen] = useState(false);

  if (token === "") {
    return <Navigate to={"/auth/login"} replace />;
  }

  const logout = () => {
    // console.log('Logging out!');
    setToken("");
  };

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr] select-none">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link to="/" className="flex items-center gap-2 font-semibold">
              <Package2 className="h-6 w-6" />
              <span className="">Coder's Book</span>
            </Link>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              <NavLink
                to="/dashboard/home"
                className={({ isActive }) => {
                  return `flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${
                    isActive && "bg-muted"
                  }`;
                }}
              >
                <Home className="h-4 w-4" />
                Home
              </NavLink>

              <NavLink
                to="/dashboard/books"
                className={({ isActive }) => {
                  return `flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${
                    isActive && "bg-muted"
                  }`;
                }}
              >
                <LibraryBig className="h-4 w-4" />
                Books{" "}
              </NavLink>
            </nav>
          </div>
          <div className="mt-auto p-4">
            <Card x-chunk="dashboard-02-chunk-0">
              <CardHeader className="p-2 pt-0 md:p-4">
                <CardTitle>Upgrade to Pro</CardTitle>
                <CardDescription>
                  Unlock all features and get unlimited access to our support
                  team.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-2 pt-0 md:p-4 md:pt-0">
                <Button size="sm" className="w-full">
                  Upgrade
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              <nav className="grid gap-2 text-lg font-medium">
                <Link
                  to="#"
                  className="flex items-center gap-2 mb-4 text-lg font-semibold"
                >
                  <Package2 className="h-6 w-6" />
                  <span className="">Coder's Book</span>
                </Link>
                <NavLink
                  to="/dashboard/home"
                  onClick={() => {
                    if (location.pathname !== "/dashboard/home")
                      setIsSheetOpen(false);
                  }}
                  className={({ isActive }) => {
                    return `flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${
                      isActive && "bg-muted"
                    }`;
                  }}
                >
                  <Home className="h-4 w-4" />
                  Home
                </NavLink>
                <NavLink
                  to="/dashboard/books"
                  onClick={() => {
                    if (location.pathname !== "/dashboard/books")
                      setIsSheetOpen(false);
                  }}
                  className={({ isActive }) => {
                    return `flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${
                      isActive && "bg-muted"
                    }`;
                  }}
                >
                  <LibraryBig className="h-4 w-4" />
                  Books{" "}
                  <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                    {count}
                  </Badge>
                </NavLink>
              </nav>
              <div className="mt-auto sticky-bottom">
                <Card>
                  <CardHeader>
                    <CardTitle>Upgrade to Pro</CardTitle>
                    <CardDescription>
                      Unlock all features and get unlimited access to our
                      support team.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button size="sm" className="w-full">
                      Upgrade
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
            {isBookPage && (
              <form onSubmit={(e) => e.preventDefault()}>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search books..."
                    className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                  />
                </div>
              </form>
            )}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="rounded-full"
          >
            {isDarkMode ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <CircleUser className="h-5 w-5" />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Button onClick={logout} variant={"link"}>
                  Logout
                </Button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
