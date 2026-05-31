export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id: string) {
    super(`${resource} with id '${id}' not found`, 404, 'NOT_FOUND');
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT');
  }
}

export class InvalidTransitionError extends AppError {
  constructor(from: string, to: string) {
    super(`Invalid case status transition: ${from} -> ${to}`, 400, 'INVALID_TRANSITION');
  }
}

export class SignOffRequiredError extends AppError {
  constructor() {
    super(
      'Appeal cannot be submitted without a recorded clinician sign-off (clinicianSignoffUserId + signedOffAt required)',
      422,
      'SIGNOFF_REQUIRED',
    );
  }
}
