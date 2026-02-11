# Genshin Banpick Client - Copilot Instructions

## Project Overview

This is **Genshin Banpick Client**, a React + TypeScript + Vite application for Genshin Impact ban/pick gameplay management. The application supports user authentication, character/weapon management, and admin functionalities.

## Tech Stack

| Category         | Technology                           |
| ---------------- | ------------------------------------ |
| Framework        | React 19 + TypeScript                |
| Build Tool       | Vite                                 |
| Package Manager  | Bun                                  |
| Routing          | TanStack Router (file-based routing) |
| State Management | Redux Toolkit + React Redux          |
| Server State     | TanStack Query                       |
| Styling          | Tailwind CSS v4                      |
| UI Components    | shadcn/ui (new-york style)           |
| Forms            | React Hook Form + Zod validation     |
| HTTP Client      | Axios                                |
| i18n             | i18next + react-i18next              |
| Icons            | Lucide React                         |

## Project Structure

```
src/
├── apis/               # API modules by feature
│   └── {feature}/
│       ├── index.ts    # API functions
│       └── types.ts    # Zod schemas & TypeScript types
├── components/
│   ├── ui/             # shadcn/ui components
│   └── {feature}/      # Feature-specific components
├── hooks/              # Custom hooks
├── i18n/
│   ├── keys/           # Translation keys (typed constants)
│   ├── locales/        # Translation files (en, vi)
│   ├── types/          # Translation type definitions
│   ├── index.ts        # i18n configuration
│   └── namespaces.ts   # Namespace definitions
├── lib/
│   ├── constants/      # App constants & enums
│   ├── redux/          # Redux store & slices
│   ├── types/          # Shared TypeScript types
│   ├── http.ts         # Axios instance configuration
│   └── utils.ts        # Utility functions (cn)
└── routes/             # TanStack Router file-based routes
    ├── __root.tsx      # Root layout
    ├── _userLayout.tsx # User layout wrapper
    ├── admin/          # Admin routes
    └── self/           # User profile routes
```

## Coding Patterns & Conventions

### Path Aliases

Always use `@/` alias for imports from `src/`:

```typescript
import { Button } from "@/components/ui/button";
import { http } from "@/lib/http";
import { useAppSelector } from "@/hooks/use-app-selector";
```

### API Pattern

APIs are organized by feature with typed functions:

```typescript
// src/apis/{feature}/index.ts
import { http } from "@/lib/http";
import type { BaseApiResponse } from "@/lib/types";
import type { FeatureResponse, CreateFeatureInput } from "./types";

async function listFeatures() {
	const response =
		await http.get<BaseApiResponse<FeatureResponse[]>>("/api/features");
	return response.data;
}

async function createFeature(input: CreateFeatureInput) {
	const response = await http.post<BaseApiResponse<FeatureResponse>>(
		"/api/features",
		input,
	);
	return response.data;
}

export const featureApi = {
	listFeatures,
	createFeature,
};
```

```typescript
// src/apis/{feature}/types.ts
import z from "zod";
import { commonLocaleKeys } from "@/i18n/keys";
import { getTranslationToken } from "@/i18n/namespaces";

export interface FeatureResponse {
	id: number;
	name: string;
	createdAt: string;
}

export const createFeatureSchema = z.object({
	name: z
		.string()
		.min(
			1,
			getTranslationToken("common", commonLocaleKeys.validation_required),
		),
});

export type CreateFeatureInput = z.infer<typeof createFeatureSchema>;
```

### Redux Pattern

Use typed hooks and feature slices:

```typescript
// Typed hooks (already defined)
import { useAppDispatch } from "@/hooks/use-app-dispatch";
import { useAppSelector } from "@/hooks/use-app-selector";

// Slice example
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface FeatureState {
	data: FeatureResponse | null;
}

const initialState: FeatureState = { data: null };

export const featureSlice = createSlice({
	name: "feature",
	initialState,
	reducers: {
		setData: (state, action: PayloadAction<FeatureResponse | null>) => {
			state.data = action.payload;
		},
	},
});

export const { setData } = featureSlice.actions;
export const selectFeatureData = (state: RootState) => state.feature.data;
```

### Component Pattern

Use functional components with TypeScript interfaces:

```tsx
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { getTranslationToken } from "@/i18n/namespaces";
import { featureLocaleKeys } from "@/i18n/keys";

export interface FeatureComponentProps {
	data: FeatureResponse;
	onAction?: () => void;
}

export default function FeatureComponent({
	data,
	onAction,
}: FeatureComponentProps) {
	const { t } = useTranslation();

	return (
		<div>
			<h1>{data.name}</h1>
			<Button onClick={onAction}>
				{t(getTranslationToken("feature", featureLocaleKeys.action_button))}
			</Button>
		</div>
	);
}
```

### Form Pattern with React Hook Form + Zod

```tsx
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	createFeatureSchema,
	type CreateFeatureInput,
} from "@/apis/feature/types";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

function FeatureForm() {
	const form = useForm<CreateFeatureInput>({
		resolver: zodResolver(createFeatureSchema),
		defaultValues: { name: "" },
	});

	const onSubmit = (values: CreateFeatureInput) => {
		// Handle submission
	};

	return (
		<form onSubmit={form.handleSubmit(onSubmit)}>
			<FieldGroup>
				<Controller
					name="name"
					control={form.control}
					render={({ field, fieldState }) => (
						<Field data-invalid={fieldState.invalid}>
							<FieldLabel htmlFor={field.name}>Name</FieldLabel>
							<Input
								{...field}
								id={field.name}
								aria-invalid={fieldState.invalid}
							/>
							{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
						</Field>
					)}
				/>
			</FieldGroup>
		</form>
	);
}
```

### TanStack Query Pattern

```tsx
import { useQuery, useMutation } from "@tanstack/react-query";
import { featureApi } from "@/apis/feature";
import { toast } from "sonner";

function FeaturePage() {
	const { data, isLoading, refetch } = useQuery({
		queryKey: ["features"],
		queryFn: featureApi.listFeatures,
	});

	const createMutation = useMutation({
		mutationFn: featureApi.createFeature,
		onSuccess: () => {
			toast.success("Feature created successfully");
			refetch();
		},
		onError: (error: AxiosError<BaseApiResponse>) => {
			toast.error(error.response?.data?.message ?? "Failed to create feature");
		},
	});
}
```

### i18n Pattern

Translation keys are typed constants organized by namespace:

```typescript
// src/i18n/keys/{namespace}.ts
export const featureLocaleKeys = {
	feature_title: "feature_title",
	feature_action: "feature_action",
} as const;

// Usage in components
import { getTranslationToken } from "@/i18n/namespaces";
import { featureLocaleKeys } from "@/i18n/keys";

const { t } = useTranslation();
t(getTranslationToken("feature", featureLocaleKeys.feature_title));
```

### Route Pattern (TanStack Router)

```tsx
// src/routes/feature/index.tsx
import { createFileRoute } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { featureQuerySchema } from "@/apis/feature/types";

export const Route = createFileRoute("/feature/")({
	component: RouteComponent,
	validateSearch: zodValidator(featureQuerySchema), // Optional search validation
	beforeLoad: async () => {
		// Authentication or data prefetching
	},
});

function RouteComponent() {
	return <div>Feature Page</div>;
}
```

### Constants Pattern

```typescript
// src/lib/constants/{feature}.ts
export const FeatureType = {
	TYPE_A: 0,
	TYPE_B: 1,
} as const;

export type FeatureTypeEnum = (typeof FeatureType)[keyof typeof FeatureType];

// With details/metadata
export const FeatureTypeDetail = {
	[FeatureType.TYPE_A]: { key: "type_a", name: "Type A" },
	[FeatureType.TYPE_B]: { key: "type_b", name: "Type B" },
} as const;
```

### shadcn/ui Components

Use components from `@/components/ui/`:

```tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
```

### Utility Functions

```typescript
import { cn } from "@/lib/utils"; // Tailwind class merging

<div className={cn("base-class", condition && "conditional-class")} />
```

## Key Type Definitions

```typescript
// Base API Response
interface BaseApiResponse<T = any> {
	code: string;
	message: string;
	error?: any;
	data?: T;
	pagination?: PaginationDto;
}

// Pagination
interface PaginationDto {
	page: number;
	take: number;
	totalRecord: number;
	totalPage: number;
	nextPage?: number;
	prevPage?: number;
}
```

## Best Practices

1. **Always use typed imports** - Import types with `type` keyword when possible
2. **Use path aliases** - Always use `@/` instead of relative paths
3. **Follow feature-based organization** - Group related files by feature
4. **Use i18n for all user-facing text** - Never hardcode text strings
5. **Validate forms with Zod** - Define schemas in API types files
6. **Handle errors gracefully** - Use toast notifications for user feedback
7. **Use TanStack Query for server state** - Avoid storing server data in Redux
8. **Keep Redux for client-only state** - Auth profile, theme, etc.

## Commands

```bash
# Development
bun dev

# Build
bun run build

# Lint
bun lint

# Format
bun prettier:fix
```
