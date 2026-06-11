import { NextResponse } from "next/server";
import { Model, FilterQuery, SortOrder } from "mongoose";

type ClassValue =
  | string
  | number
  | false
  | null
  | undefined
  | ClassValue[]
  | Record<string, boolean | null | undefined>;

function flattenClassValue(input: ClassValue): string[] {
  if (!input) {
    return [];
  }

  if (typeof input === "string" || typeof input === "number") {
    return [String(input)];
  }

  if (Array.isArray(input)) {
    return input.flatMap(flattenClassValue);
  }

  return Object.entries(input)
    .filter(([, enabled]) => Boolean(enabled))
    .map(([className]) => className);
}

export function cn(...inputs: ClassValue[]) {
  return inputs.flatMap(flattenClassValue).join(" ");
}

export async function getPaginatedResponse<T>(
  model: Model<T>,
  request: Request,
  queryOptions: FilterQuery<T> = {},
  searchFields: string[] = [],
  populate: string | string[] = "",
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sort: string | { [key: string]: SortOrder } | [string, SortOrder][] = { createdAt: -1, timestamp: -1 } as any
) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const eventId = searchParams.get("eventId");
    const incidentId = searchParams.get("incidentId");
    const assignedTo = searchParams.get("assignedTo");
    const target = searchParams.get("target");

    const query: FilterQuery<T> = { ...queryOptions };
    
    if (eventId) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (query as any).eventId = eventId;
    }
    
    if (incidentId) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (query as any).incidentId = incidentId;
    }

    if (assignedTo) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (query as any).assignedTo = assignedTo;
    }

    if (target) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (query as any).target = target;
    }

    if (search && searchFields.length > 0) {
      query.$or = searchFields.map((field) => ({
        [field]: { $regex: search, $options: "i" },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      })) as any;
    }

    const skip = (page - 1) * limit;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let mongoQuery = model.find(query).sort(sort as any).skip(skip).limit(limit);
    
    if (populate) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mongoQuery = mongoQuery.populate(populate as any);
    }

    const [data, total] = await Promise.all([
      mongoQuery,
      model.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch data";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
