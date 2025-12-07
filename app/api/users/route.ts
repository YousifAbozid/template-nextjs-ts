import { NextRequest, NextResponse } from 'next/server';
import { withDatabase } from '@/lib/api/middleware';
import { User } from '@/lib/api/models';
import { CreateUserRequestSchema } from './schema';
import './openapi'; // Import to register OpenAPI routes

/**
 * GET /api/users - Get all users
 */
export const GET = withDatabase(async () => {
  try {
    const users = await User.find().sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: users,
      count: users.length
    });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch users'
      },
      { status: 500 }
    );
  }
});

/**
 * POST /api/users - Create a new user
 */
export const POST = withDatabase(async (req: NextRequest) => {
  try {
    const body = await req.json();

    // Validate with Zod
    const validationResult = CreateUserRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: validationResult.error.issues[0].message
        },
        { status: 400 }
      );
    }

    const { name, email } = validationResult.data;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'User with this email already exists'
        },
        { status: 400 }
      );
    }

    // Create new user
    const user = new User({ name, email });
    const savedUser = await user.save();

    return NextResponse.json(
      {
        success: true,
        data: savedUser,
        message: 'User created successfully'
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Create user error:', error);

    // Handle MongoDB validation errors
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        {
          success: false,
          error: error.message
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create user'
      },
      { status: 500 }
    );
  }
});
