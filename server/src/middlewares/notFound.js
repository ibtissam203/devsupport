export function notFound(req, res) {
  res.status(404).json({ message: `Route non trouvée : ${req.originalUrl}` });
}