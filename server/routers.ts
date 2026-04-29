import { COOKIE_NAME } from "../shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { insertPersonRecord, getAllPersonRecords } from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  person: router({
    submit: publicProcedure
      .input(z.object({
        name: z.string().min(1, "Name is required"),
        surname: z.string().min(1, "Surname is required"),
        address: z.string().min(1, "Address is required"),
        cellNumber: z.string().min(1, "Cell number is required"),
        employed: z.boolean(),
        hasBusiness: z.boolean(),
        skills: z.string().min(1, "Skills are required"),
      }))
      .mutation(async ({ input }) => {
        await insertPersonRecord({
          name: input.name,
          surname: input.surname,
          address: input.address,
          cellNumber: input.cellNumber,
          employed: input.employed,
          hasBusiness: input.hasBusiness,
          skills: input.skills,
        });
        return { success: true };
      }),
    getAll: publicProcedure.query(async ({ ctx }) => {
      // Check if admin session exists
      const adminSession = ctx.req.cookies?.admin_session;
      if (adminSession !== "authenticated") {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Admin session required",
        });
      }
      const records = await getAllPersonRecords();
      return records;
    }),
  }),

  admin: router({
    login: publicProcedure
      .input(z.object({
        username: z.string(),
        password: z.string(),
      }))
      .mutation(({ input, ctx }) => {
        const expectedPassword = process.env.ADMIN_PASSWORD ?? "Admin123#";
        const isValid = input.username === "admin" && input.password === expectedPassword;
        if (!isValid) {
          return { success: false, message: "Invalid credentials" };
        }
        // Set admin session cookie
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie("admin_session", "authenticated", {
          ...cookieOptions,
          maxAge: 24 * 60 * 60 * 1000, // 24 hours
        });
        return { success: true };
      }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie("admin_session", { ...cookieOptions, maxAge: -1 });
      return { success: true };
    }),
    checkSession: publicProcedure.query(({ ctx }) => {
      const adminSession = ctx.req.cookies?.admin_session;
      return { authenticated: adminSession === "authenticated" };
    }),
  }),
});

export type AppRouter = typeof appRouter;
