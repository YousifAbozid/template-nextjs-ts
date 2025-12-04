/**
 * User-related DTOs and types
 */

/**
 * User creation DTO
 */
export class CreateUserDto {
  name!: string;
  email!: string;
}

/**
 * User response DTO
 */
export class UserResponseDto {
  _id!: string;
  name!: string;
  email!: string;
  createdAt!: Date;
  updatedAt!: Date;
}

/**
 * User update DTO
 */
export class UpdateUserDto {
  name?: string;
  email?: string;
}
