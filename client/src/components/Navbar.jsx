import React, { useEffect } from "react";
import { School, Menu, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "./ui/dropdown-menu";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "./ui/sheet";
import { Separator } from "./ui/separator";
import DarkMode from "@/DarkMode";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useLogoutUserMutation } from "@/features/api/authApi";
import { useSelector, useDispatch } from "react-redux";
import { userLoggedOut } from "@/features/authSlice";

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [logoutUser, { data, isSuccess }] = useLogoutUserMutation();
  const navigate = useNavigate();

  const logoutHandler = async () => {
    try {
      await logoutUser();
      dispatch(userLoggedOut());
    } catch (error) {
      toast.error("Logout failed.");
      console.error("Logout error:", error);
    }
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success(data?.message || "Logout successful.");
      navigate("/login");
    }
  }, [isSuccess, data, navigate]);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b shadow-sm">
      {/* Desktop */}
      <div className="hidden md:flex items-center justify-between px-8 h-16">
        <div className="flex items-center">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <School className="h-7 w-7 text-blue-600" />
            <h1 className="font-extrabold text-2xl bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              E-Learning
            </h1>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <DarkMode />
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <Avatar className="h-10 w-10 border-2 border-blue-100 dark:border-blue-900">
                    <AvatarImage
                      src={user.photoUrl}
                      alt={user.name}
                    />
                    <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
                      {user.name?.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 p-2">
                <DropdownMenuLabel className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  My Account
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup className="space-y-1">
                  <DropdownMenuItem asChild className="cursor-pointer rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
                    <Link to="/my-learning" className="flex items-center gap-2 p-2">
                      <School className="h-4 w-4" />
                      My Learning
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
                    <Link to="/profile" className="flex items-center gap-2 p-2">
                      <Avatar className="h-4 w-4" />
                      Edit Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={logoutHandler}
                    className="cursor-pointer rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-red-600 dark:text-red-400"
                  >
                    <div className="flex items-center gap-2 p-2">
                      <LogOut className="h-4 w-4" />
                      Logout
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                {user.role === "instructor" && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild className="cursor-pointer rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
                      <Link to="/admin/dashboard" className="flex items-center gap-2 p-2">
                        <School className="h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="outline" asChild className="hover:bg-gray-100 dark:hover:bg-gray-800">
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
                <Link to="/login">Signup</Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile */}
      <div className="flex md:hidden items-center justify-between px-4 h-16">
        <Link to="/" className="flex items-center gap-2">
          <School className="h-6 w-6 text-blue-600" />
          <h1 className="font-extrabold text-xl bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
            E-Learning
          </h1>
        </Link>
        <MobileNavbar user={user} onLogout={logoutHandler} />
      </div>
    </div>
  );
};

const MobileNavbar = ({ user, onLogout }) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          size="icon"
          className="rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
          variant="outline"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col">
        <SheetHeader className="flex flex-row items-center justify-between mt-2">
          <SheetTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
            E-Learning
          </SheetTitle>
          <DarkMode />
        </SheetHeader>
        <Separator className="my-4" />
        <nav className="flex flex-col space-y-4 mt-6">
          {user ? (
            <>
              <div className="flex items-center gap-3 p-2">
                <Avatar className="h-10 w-10 border-2 border-blue-100 dark:border-blue-900">
                  <AvatarImage
                    src={user.photoUrl}
                    alt={user.name}
                  />
                  <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
                    {user.name?.split(" ").map((n) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                </div>
              </div>
              <Separator />
              <Link to="/my-learning" className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
                <School className="h-5 w-5" />
                My Learning
              </Link>
              <Link to="/profile" className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
                <Avatar className="h-5 w-5" />
                Edit Profile
              </Link>
              {user.role === "instructor" && (
                <Link to="/admin/dashboard" className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
                  <School className="h-5 w-5" />
                  Dashboard
                </Link>
              )}
              <Separator />
              <button
                onClick={onLogout}
                className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-red-600 dark:text-red-400"
              >
                <LogOut className="h-5 w-5" />
                Logout
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-2">
              <Button variant="outline" asChild className="w-full">
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                <Link to="/login">Signup</Link>
              </Button>
            </div>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
};

export default Navbar;
