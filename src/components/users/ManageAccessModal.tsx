"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateIdentity, deleteIdentity } from "@/app/(dashboard)/users/actions";

const formSchema = z.object({
  first_name: z.string().min(2, "First name must be at least 2 characters"),
  last_name: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().optional(),
  role: z.enum(["admin", "teacher", "student", "parent"]),
});

type FormValues = z.infer<typeof formSchema>;

export function ManageAccessModal({ user }: { user: any }) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      email: user.email || "",
      password: "",
      role: user.role || "student",
    },
  });

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);
    try {
      const result = await updateIdentity(user.id, values);
      if (result.success) {
        toast.success(result.message);
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update identity");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to permanently delete this identity? This action cannot be reversed.")) {
      return;
    }

    setIsDeleting(true);
    try {
      const result = await deleteIdentity(user.id);
      if (result.success) {
        toast.success(result.message);
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to delete identity");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="rounded-sm font-black text-[10px] uppercase tracking-widest text-primary hover:bg-primary/10 transition-all"
        >
          MANAGE ACCESS
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] border-primary/20 bg-background/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-black uppercase tracking-widest text-primary italic">
            Manage Access Matrix
          </DialogTitle>
          <DialogDescription className="text-xs uppercase tracking-widest text-foreground/40 font-black pt-2">
            Modify credentials and authorization levels for this identity.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] uppercase font-black tracking-widest">First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="JOHN" {...field} className="rounded-sm bg-card/40 border-border text-xs focus-visible:ring-primary shadow-inner" />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] uppercase font-black tracking-widest">Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="DOE" {...field} className="rounded-sm bg-card/40 border-border text-xs focus-visible:ring-primary shadow-inner" />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] uppercase font-black tracking-widest">Email Address</FormLabel>
                  <FormControl>
                    <Input type="email" disabled placeholder="user@eduflux.com" {...field} className="rounded-sm bg-background/50 border-border text-xs focus-visible:ring-0 opacity-70 cursor-not-allowed shadow-inner" />
                  </FormControl>
                  <p className="text-[8px] uppercase tracking-widest text-foreground/40 mt-1">Network alias cannot be changed directly.</p>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] uppercase font-black tracking-widest">Reset Password (Optional)</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Leave blank to keep unchanged" {...field} className="rounded-sm bg-card/40 border-border text-xs focus-visible:ring-primary shadow-inner" />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] uppercase font-black tracking-widest">Clearance Level (Role)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="rounded-sm bg-card/40 border-border text-xs focus:ring-primary shadow-inner uppercase font-black tracking-widest">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-sm border-border bg-card">
                      <SelectItem value="admin" className="text-xs uppercase font-black tracking-widest text-primary focus:bg-primary/10">Administrator (Level 5)</SelectItem>
                      <SelectItem value="teacher" className="text-xs uppercase font-black tracking-widest focus:bg-primary/10">Teacher</SelectItem>
                      <SelectItem value="student" className="text-xs uppercase font-black tracking-widest focus:bg-primary/10">Student</SelectItem>
                      <SelectItem value="parent" className="text-xs uppercase font-black tracking-widest focus:bg-primary/10">Parent</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />

            <div className="pt-4 flex justify-between gap-x-2 border-t border-border mt-6">
              <Button type="button" variant="destructive" onClick={handleDelete} className="rounded-sm text-[10px] font-black uppercase tracking-widest bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all gap-x-2" disabled={isSubmitting || isDeleting}>
                {isDeleting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                Purge
              </Button>
              <div className="flex gap-x-2">
                <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="rounded-sm text-[10px] font-black uppercase tracking-widest" disabled={isSubmitting || isDeleting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting || isDeleting} className="rounded-sm bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest gap-x-2 emerald-glow min-w-[120px]">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      UPDATING...
                    </>
                  ) : (
                    "CONFIRM UPDATE"
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
