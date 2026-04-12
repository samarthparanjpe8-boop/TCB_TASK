import { HttpError } from "./httpErrors.js";
export function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}
export function errorHandler(err, _req, res, _next) {
    if (err instanceof HttpError) {
        return res.status(err.status).json({ error: err.message });
    }
    if (err && typeof err === "object" && "code" in err && err.code === 11000) {
        return res.status(409).json({ error: "Duplicate value" });
    }
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
}
