import { Router, Request, Response } from 'express';
import { db } from '../../DataBase/db.ts';
import { authMiddleware, optionalAuth, AuthenticatedRequest } from '../middleware/authMiddleware.ts';

export const blogRouter = Router();

// GET /api/blogs
blogRouter.get('/', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const { category, search, status } = req.query;

  const blogs = db.getBlogs({
    search: typeof search === 'string' ? search : undefined,
    category: typeof category === 'string' ? category : undefined,
    status: typeof status === 'string' ? status : undefined,
  });

  return res.json(blogs);
});

// GET /api/blogs/:id
blogRouter.get('/:id', (req: Request, res: Response) => {
  const blog = db.getBlogById(req.params.id);
  if (!blog) {
    return res.status(404).json({ error: 'Blog not found.' });
  }
  return res.json(blog);
});

// POST /api/blogs
blogRouter.post('/', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.role !== 'Admin' && req.user?.role !== 'Agent') {
    return res.status(403).json({ error: 'Forbidden: Admin or Agent role required.' });
  }

  const { title, content, thumbnail, categories, status, published_date } = req.body;
  if (!title || !content || !categories) {
    return res.status(400).json({ error: 'Missing required blog fields: title, content, categories' });
  }

  const newBlog = db.createBlog({
    title,
    content,
    thumbnail: thumbnail || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80',
    categories: Array.isArray(categories) ? categories : [categories],
    status: status || 'Published',
    published_date: published_date || new Date().toISOString().split('T')[0],
    author: req.user.name
  });

  return res.status(201).json(newBlog);
});

// PUT /api/blogs/:id
blogRouter.put('/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.role !== 'Admin' && req.user?.role !== 'Agent') {
    return res.status(403).json({ error: 'Forbidden: Admin or Agent role required.' });
  }

  const updated = db.updateBlog(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Blog not found.' });
  }
  return res.json(updated);
});

// DELETE /api/blogs/:id
blogRouter.delete('/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.role !== 'Admin') {
    return res.status(403).json({ error: 'Forbidden: Only Admins can delete blogs.' });
  }

  const deleted = db.deleteBlog(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: 'Blog not found.' });
  }
  return res.json({ message: 'Blog deleted successfully', id: req.params.id });
});

// GET /api/blog-categories
blogRouter.get('/categories/all', (req: Request, res: Response) => {
  return res.json(db.getCategories());
});

// POST /api/blog-categories
blogRouter.post('/categories/add', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Category name is required' });
  }
  const result = db.addCategory(name);
  return res.json(result);
});
