import { Router, Request, Response } from 'express';
import { db } from '../../DataBase/repository.ts';
import { authMiddleware, optionalAuth, AuthenticatedRequest } from '../middleware/authMiddleware.ts';
import { asyncHandler } from '../middleware/asyncHandler.ts';

export const blogRouter = Router();

// GET /api/blogs
blogRouter.get('/', optionalAuth, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { category, search, status } = req.query;

  const blogs = await db.getBlogs({
    search: typeof search === 'string' ? search : undefined,
    category: typeof category === 'string' ? category : undefined,
    status: typeof status === 'string' ? status : undefined,
  });

  return res.json(blogs);
}));
// Category routes must be declared before the dynamic /:id route.
blogRouter.get('/categories/all', asyncHandler(async (_req: Request, res: Response) => res.json(await db.getCategories())));

blogRouter.post('/categories/add', authMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Category name is required' });
  return res.json(await db.addCategory(name));
}));
// GET /api/blogs/:id
blogRouter.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const blog = await db.getBlogById(req.params.id);
  if (!blog) {
    return res.status(404).json({ error: 'Blog not found.' });
  }
  return res.json(blog);
}));

// POST /api/blogs
blogRouter.post('/', authMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.role !== 'Admin' && req.user?.role !== 'Agent') {
    return res.status(403).json({ error: 'Forbidden: Admin or Agent role required.' });
  }

  const { title, content, thumbnail, categories, status, published_date } = req.body;
  if (!title || !content || !categories) {
    return res.status(400).json({ error: 'Missing required blog fields: title, content, categories' });
  }

  const newBlog = await db.createBlog({
    title,
    content,
    thumbnail: thumbnail || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80',
    categories: Array.isArray(categories) ? categories : [categories],
    status: status || 'Published',
    published_date: published_date || new Date().toISOString().split('T')[0],
    author: req.user.name
  });

  return res.status(201).json(newBlog);
}));

// PUT /api/blogs/:id
blogRouter.put('/:id', authMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.role !== 'Admin' && req.user?.role !== 'Agent') {
    return res.status(403).json({ error: 'Forbidden: Admin or Agent role required.' });
  }

  const updated = await db.updateBlog(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Blog not found.' });
  }
  return res.json(updated);
}));

// DELETE /api/blogs/:id
blogRouter.delete('/:id', authMiddleware, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.role !== 'Admin') {
    return res.status(403).json({ error: 'Forbidden: Only Admins can delete blogs.' });
  }

  const deleted = await db.deleteBlog(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: 'Blog not found.' });
  }
  return res.json({ message: 'Blog deleted successfully', id: req.params.id });
}));
