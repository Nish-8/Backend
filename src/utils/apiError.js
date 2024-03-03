//to define custom apiError class
//Error is class in node for handling error, we are creating child of that class
class apiError extends Error {
  //we will be define our own constructor and override it
  constructor(
    statusCode,
    message = "Something went wrong",
    errors = [],
    stack = ""
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.message = message;
    this.success = false;
    this.data = null;

    //this code is for production level to trace the stack of error
    //removed in production
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { apiError };
