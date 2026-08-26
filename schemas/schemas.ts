import { z } from "zod";

export const SkillDialogSchema = z.object({
  name: z.string().nonempty("Skill name is required"),
  category: z.string().nonempty("Skill category is required"),
  tag: z.string().nonempty("Skill tag is required"),
});

export const SkillDialogServerSchema = z.object({
  name: z.string().trim().min(1, "Skill name is required"),
  category: z.enum(["Frontend", "Backend", "Cloud_DevOps"]),
  tag: z.enum(["Advanced", "Expert", "Proficient", "Intermediate"]),
});

export const ProfileSchema = z.object({
  name: z.string().nonempty("Name is required"),
  firstName: z.string().nonempty("First name is required"),
  professionalTitle: z.string().nonempty("Title is required"),
  tagline: z.string().nonempty("Tagline is required"),
  location: z.string().nonempty("Location is required"),
  email: z.string().nonempty("Email is required"),
  github: z.string().nonempty("GitHub link is required"),
  linkedin: z.string().nonempty("LinkedIn link is required"),
  resumeLink: z.string().nonempty("Resume link is required"),
});

export const contactFormSchema = z.object({
  name: z.string().min(3, "Name is required"),
  email: z.email("Invalid email address"),
  subject: z.string().min(5, "Subject is required"),
  message: z.string().min(5, "Message is required"),
});

export const analyticsSchema = z.object({
  eventId: z.uuid(),

  event: z.enum([
    "page_view",
    "github_click",
    "linkedin_click",
    "email_click",
    "project_demo_click",
    "project_github_click",
    "generate_lead",
  ]),

  path: z.string().max(500).optional(),
  referrer: z.string().max(2000).optional(),
  title: z.string().max(500).optional(),

  projectId: z.string().max(100).optional(),

  metadata: z.record(z.string(), z.json()).optional(),
});

export const loginSchema = z.object({
  email: z.email().nonempty("Email is required"),
  password: z.string().min(1, "Password is required"),
});

export const forgotPwSchema = z.object({
  email: z.email().nonempty("Email is required"),
});

export const verifyTokenSchema = z.object({
  token: z.string().regex(/^[0-9a-fA-F]{64}$/, {
    message: "Must be a valid 64-character crypto hex token",
  }),
});

export const resetTokenSchema = z.object({
  token: z.string().regex(/^[0-9a-fA-F]{64}$/, {
    message: "Must be a valid 64-character crypto hex token",
  }),
});

export const resetPwSchema = z
  .object({
    password: z.string().min(1, "Password is required"),
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"], // Sets the error specifically to the confirmPassword field
  });

export const resetPwServerSchema = z.object({
  token: z.string().regex(/^[0-9a-fA-F]{64}$/, {
    message: "Must be a valid 64-character crypto hex token",
  }),
  password: z.string().min(1, "Password is required"),
});

export const GeneralSettingsSchema = z.object({
  publicSiteTitle: z
    .string()
    .min(1, "Public site title is required")
    .max(100, "Public site title is too long"),

  publicSiteDescription: z
    .string()
    .max(300, "Public site description is too long"),

  siteUrl: z.string().url("Enter a valid URL").or(z.literal("")),

  adminTitle: z
    .string()
    .min(1, "Admin title is required")
    .max(100, "Admin title is too long"),

  adminDescription: z.string().max(300, "Admin description is too long"),

  seoTitle: z.string().max(100, "SEO title is too long"),

  seoDescription: z.string().max(300, "SEO description is too long"),

  seoKeywords: z.string().max(500, "SEO keywords are too long"),

  canonicalUrl: z.string().url("Enter a valid URL").or(z.literal("")),

  ogImageUrl: z.string().url("Enter a valid URL").or(z.literal("")),
});

export const AnalyticsSettingsSchema = z.object({
  analyticsRetentionDays: z
    .number()
    .int("Retention period must be a whole number")
    .min(1, "Retention period must be at least 1 day")
    .max(3650, "Retention period cannot exceed 3650 days"),
});

export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),

    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters"),

    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const experienceSchema = z.object({
  jobTitle: z
    .string()
    .trim()
    .min(1, "Job title is required")
    .max(150, "Job title is too long"),

  employer: z
    .string()
    .trim()
    .min(1, "Employer is required")
    .max(150, "Employer is too long"),

  location: z
    .string()
    .trim()
    .min(1, "Location is required")
    .max(150, "Location is too long"),

  startDate: z
    .number()
    .int()
    .min(1900, "Enter a valid start year")
    .max(2100, "Enter a valid start year"),

  endDate: z
    .number()
    .int()
    .min(1900, "Enter a valid end year")
    .max(2100, "Enter a valid end year")
    .nullable(),

  isContinued: z.boolean(),

  jobSummary: z
    .string()
    .trim()
    .min(1, "Job summary is required")
    .max(2000, "Job summary is too long"),

  skillIds: z
    .array(z.number().int().positive())
    .max(50, "Too many skills selected"),

  bullets: z
    .array(
      z.object({
        description: z
          .string()
          .trim()
          .min(1, "Bullet cannot be empty")
          .max(500, "Bullet is too long"),
      }),
    )
    .max(50, "Too many responsibilities"),
});

export const experienceFormSchema = z
  .object({
    jobTitle: z.string().trim().min(1, "Job title is required"),

    employer: z.string().trim().min(1, "Employer is required"),

    location: z.string().trim().min(1, "Location is required"),

    startDate: z
      .number()
      .int()
      .min(1900, "Enter a valid year")
      .max(2100, "Enter a valid year"),

    endDate: z
      .number()
      .int()
      .min(1900, "Enter a valid year")
      .max(2100, "Enter a valid year")
      .nullable(),

    isContinued: z.boolean(),

    jobSummary: z.string().trim().min(1, "Job summary is required"),

    skillIds: z.array(z.number().int().positive()),

    bullets: z.array(
      z.object({
        description: z.string().trim().min(1, "Responsibility cannot be empty"),
      }),
    ),
  })
  .superRefine((data, ctx) => {
    if (
      !data.isContinued &&
      data.endDate !== null &&
      data.endDate < data.startDate
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["endDate"],
        message: "End year cannot be before start year",
      });
    }

    if (data.isContinued && data.endDate !== null) {
      ctx.addIssue({
        code: "custom",
        path: ["endDate"],
        message: "End year must be empty",
      });
    }
  });

export const projectSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug can only contain lowercase letters, numbers, and hyphens",
    ),

  title: z.string().trim().min(1, "Title is required"),

  tagline: z.string().trim().min(1, "Tagline is required"),

  description: z.string().trim().min(1, "Description is required"),

  codePreviewName: z.string().trim().optional().or(z.literal("")),

  previewCode: z.string().optional().or(z.literal("")),

  codeLanguage: z.string().trim().optional().or(z.literal("")),

  liveUrl: z
    .string()
    .trim()
    .url("Enter a valid URL")
    .optional()
    .or(z.literal("")),

  repoUrl: z
    .string()
    .trim()
    .url("Enter a valid URL")
    .optional()
    .nullable()
    .or(z.literal("")),

  clientProject: z.boolean(),

  // accent: z.string().trim().optional().or(z.literal("")),

  // icon: z.string().trim().optional().or(z.literal("")),

  technologies: z
    .array(z.string().trim().min(1, "Technology is required"))
    .min(1, "Add at least one technology"),

  features: z.array(
    z.object({
      content: z.string().trim().min(1, "Feature is required"),
    }),
  ),

  highlights: z.array(
    z.object({
      label: z.string().trim().min(1, "Highlight label is required"),

      value: z.string().trim().min(1, "Highlight value is required"),
    }),
  ),
});
