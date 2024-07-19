export function catchAsyncError(fn) {
  return (req, res, next) => {
    fn(req, res, next).catch(err => { //promise
      //  res.status(500).json({ error: "Error: ", err });
      next(err)
    });
  };
};

export class AppError extends Error{
  constructor(message, statusCode){
    super(message);
    this.statusCode = statusCode;
  };
};
