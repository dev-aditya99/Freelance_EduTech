import { NextResponse } from "next/server";

import { ApiError } from "./api-error";

export function handleApiError(error: unknown) {
  // console.error(error);

  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      {
        status: error.statusCode,
      },
    );
  }

  return NextResponse.json(
    {
      success: false,
      message: error instanceof Error ? error.message : "Something went wrong",
    },
    {
      status: 500,
    },
  );
}
