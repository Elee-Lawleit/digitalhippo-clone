import { toast } from "sonner";
import { useRouter } from "next/navigation";

export const useAuth = () => {

  const router = useRouter();

  const signOut = async () => {
    try {
      //route given by payload cms
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/logout`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if(!res.ok) throw new Error();

      toast.error("Signed out successfully.")
      router.push("sign-in")
      router.refresh();

    } catch (error) {
      toast.success("Couldn't sign out, please try again.")
    }
  };

  return {signOut}
};
